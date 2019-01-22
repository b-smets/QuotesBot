import * as functions from 'firebase-functions';
import { addQuote } from './commands/addQuote';
import { randomQuote } from './commands/randomQuote';
import * as express from 'express';
import { validationMiddleware } from './middleware';

const app = express();
app.use(validationMiddleware);
app.post('/add', addQuote);
app.post('/random', randomQuote);
export const quote = functions.https.onRequest(app);
