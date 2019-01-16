import { IQuote, ISlackResponse } from "../types";
import { RESPONSE_COLOR, errorResponse } from "../util";
import { addQuoteToStore } from "../firebase";
import * as functions from 'firebase-functions';

const parseAddQuoteCommand = (command: string, sender: string) => {
  const [user, quoteText, context = 'No context..'] = command.split(/[“"”]/g).map(s => s.trim()).filter(s => !!s);
  return {
    user,
    quote: {
      quoteText,
      context,
      sender,
      timestamp: new Date().toISOString(),
    } as IQuote,
  };
};

const formatResponse = (user: string, quote: IQuote): ISlackResponse => {
  return {
    response_type: 'in_channel',
    attachments: [
      {
        color: RESPONSE_COLOR,
        pretext: 'The following quote was added:',
        title: user,
        text: quote.quoteText,
        footer: quote.context,
        ts: new Date(quote.timestamp).getTime() / 1000,
      },
    ],
  };
};

const addQuoteCommand = (commandText: string, sender: string, domain: string) => {
  const { user, quote } = parseAddQuoteCommand(commandText, sender);
  return addQuoteToStore(domain, user, quote)
    .then(quoteResult => formatResponse(user, quoteResult));
};

export const addQuote = functions.https.onRequest((request, response) => {
  const { command, text: paramsText, user_name: sender, team_domain: domain } = request.body;
  if (command === '/addquote') {
    console.log(`Adding new quote with params ${paramsText}`);
    addQuoteCommand(paramsText, sender, domain)
      .then(result => response.json(result))
      .catch(err => response.json(errorResponse(`Failed to add quote: ${err}`)));
  } else {
    response.status(400).send(`Invalid command: ${command}`);
  }
});
