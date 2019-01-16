import { initializeApp } from 'firebase-admin';
import { IQuote } from './types';
import { randomInRange } from './util';

const app = initializeApp();
const settings = { timestampsInSnapshots: true };
const firestore = app.firestore();
firestore.settings(settings);

export const addQuoteToStore = (domain: string, user: string, quote: IQuote) => {
  return firestore.collection('quotes')
    .doc(domain)
    .collection('users')
    .doc(user)
    .collection('quotes')
    .add(quote)
    .then(() => quote);
};

export const fetchRandomQuoteForUserFromStore = (domain: string, user: string) => {
  return firestore.collection('quotes')
    .doc(domain)
    .collection('users')
    .doc(user)
    .collection('quotes')
    .get()
    .then(snap => {
      if (snap.empty) {
        return null;
      }
      const numQuotes = snap.docs.length - 1;
      return snap.docs[randomInRange(numQuotes)].data() as IQuote;
    });
};
