import { IQuote, ISlackResponse } from "../types";
import { trimSlackUsername, RESPONSE_COLOR, errorResponse } from "../util";
import { fetchRandomQuoteForUserFromStore } from "../firebase";
import { Request, Response } from 'express';

const parseRandomQuoteCommand = (command: string) => {
  return trimSlackUsername(command.trim());
};

const formatResponse = (user: string, responseQuote: IQuote | null): ISlackResponse => {
  if (!responseQuote) {
    return {
      response_type: 'in_channel',
      attachments: [
        {
          color: RESPONSE_COLOR,
          text: `${user} has no quotes yet. Invoke /addquote to add one.`,
        },
      ],
    }
  }

  return {
    response_type: 'in_channel',
    attachments: [
      {
        color: RESPONSE_COLOR,
        title: `Random quote for ${user}:`,
        text: responseQuote.quoteText,
        footer: responseQuote.context,
        ts: new Date(responseQuote.timestamp).getTime() / 1000,
      },
    ],
  };
};

const randomQuoteCommand = (commandText: string, domain: string) => {
  const user = parseRandomQuoteCommand(commandText);
  return fetchRandomQuoteForUserFromStore(domain, user)
    .then(quoteResult => formatResponse(user, quoteResult));
};

export const randomQuote = (request: Request, response: Response) => {
  const { command, text: paramsText, team_domain: domain } = request.body;
  if (command === '/quote') {
    console.log(`Fetching random quote with params ${paramsText}`);
    randomQuoteCommand(paramsText, domain)
      .then(result => response.json(result))
      .catch(err => response.json(errorResponse(`Failed to retrieve quote for user ${paramsText}: ${err}`)));
  } else {
    response.status(400).send(`Invalid command: ${command}`);
  }
};
