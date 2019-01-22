import * as functions from 'firebase-functions';
import { createHmac, timingSafeEqual } from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { errorResponse } from './util';

const SIGNING_SECRET = functions.config().quotesbot.signing_secret;
const hmacWithSigningSecret = (data: string) => {
  return createHmac('sha256', SIGNING_SECRET).update(data).digest('hex');
}

const compareSignatures = (sig1: string, sig2: string) => {
  console.log('Comparing signatures', sig1, sig2);
  return timingSafeEqual(
    Buffer.from(sig1, 'utf8'),
    Buffer.from(sig2, 'utf8'),
  )
}

export const validationMiddleware = (request: Request, response: Response, next: NextFunction) => {
  const body = (request as any).rawBody;
  console.log('rawbody: ', body);
  console.log('rawbody toString: ', body.toString());
  const timestamp = request.header('X-Slack-Request-Timestamp');
  const requestSignature = request.header('X-Slack-Signature');
  if (!requestSignature) {
    console.info('Received request without signature');
    response.json(errorResponse('Missing request signature'));
    return;
  }
  if ((new Date().getTime() / 1000) - Number(timestamp) > 60 * 5) {
    console.log(`Possible replay attack: `, request.body);
    response.status(400).json(errorResponse('Bad request'));
    return;
  }
  const signatureBasestring = `v0:${timestamp}:${body}`;
  const calculatedSignature = `v0=${hmacWithSigningSecret(signatureBasestring)}`;
  if (compareSignatures(requestSignature, calculatedSignature)) {
    next();
    return;
  } else {
    response.status(400).json(errorResponse('Bad request'));
    return;
  }
}
