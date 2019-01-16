import { ISlackResponse } from "./types";

export const RESPONSE_COLOR = '#104293';
export const RESPONSE_COLOR_ERROR = '#b21d0c';

export const trimSlackUsername = (username: string) => username.startsWith('@') ? username.substr(1) : username;

export const randomInRange = (max: number, min = 0) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const errorResponse = (errorMessage: string): ISlackResponse => {
  return {
    response_type: 'ephemeral',
    attachments: [{
      text: errorMessage,
      color: RESPONSE_COLOR_ERROR,
    }],
  };
};
