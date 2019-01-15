import * as functions from 'firebase-functions';
import { initializeApp } from 'firebase-admin';

interface IQuote {
  user: string;
  quoteText: string;
  context?: string;
  sender: string;
  timestamp: string;
}

const app = initializeApp();
const settings = { timestampsInSnapshots: true };
const firestore = app.firestore()
firestore.settings(settings);

const trimUsername = (user: string) => user.startsWith('@') ? user.substr(1) : user;

const randomInRange = (max: number, min = 0) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const parseQuoteCommand = (command: string, sender: string): IQuote => {
  const [user, quoteText, context = 'No context..'] = command.split(/[“"”]/g).map(s => s.trim()).filter(s => !!s);
  return {
    user: trimUsername(user),
    quoteText,
    context,
    sender,
    timestamp: new Date().toISOString(),
  }
};

const addQuote = (commandText: string, sender: string, domain: string) => {
  const parsedQuote = parseQuoteCommand(commandText, sender);
  console.log(`PARSED QUOTE: `, parsedQuote);
  return firestore.collection('quotes')
    .doc(domain)
    .collection('users')
    .doc(parsedQuote.user)
    .collection('quotes')
    .add(parsedQuote)
    .then(() => parsedQuote);
};

const randomQuote = (domain: string, user: string) => {
  return firestore.collection('quotes')
    .doc(domain)
    .collection('users')
    .doc(trimUsername(user))
    .collection('quotes')
    .get()
    .then(snap => {
      const numQuotes = snap.docs.length - 1;
      return snap.docs[randomInRange(numQuotes)].data() as IQuote;
    });
};

const formatQuote = (quoteToFormat: IQuote, addition: boolean = false) => {
  return {
    response_type: 'in_channel',
    attachments: [
      {
        color: '#104293',
        pretext: addition ? 'The following quote was added:' : undefined,
        title: quoteToFormat.user,
        text: quoteToFormat.quoteText,
        footer: quoteToFormat.context,
        ts: new Date(quoteToFormat.timestamp).getTime() / 1000,
      },
    ]
  };
};

export const quote = functions.https.onRequest((request, response) => {
  const { command, text: paramsText, user_name: sender, team_domain: domain } = request.body;
  if (command === '/quote') {
    console.log(`Executing command ${command} with params ${paramsText}`);
    if (paramsText.trim().includes(' ')) {
      console.log(`Adding new quote with params ${paramsText}`);
      addQuote(paramsText, sender, domain)
        .then(parsedQuote => response.send(formatQuote(parsedQuote, true)))
        .catch(err => response.status(500).send(`Failed to insert quote: ${err}`));
    } else {
      console.log(`Fetching random quote with params ${paramsText}`);
      randomQuote(domain, paramsText)
        .then(resultingQuote => response.send(formatQuote(resultingQuote)))
        .catch(err => response.status(500).send(`Failed to retrieve quote for user ${paramsText}: ${err}`))
    }
  } else {
    response.status(400).send(`Invalid command: ${command}`);
  }
});
