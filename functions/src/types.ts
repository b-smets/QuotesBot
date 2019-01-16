export interface IQuote {
  quoteText: string;
  context?: string;
  sender: string;
  timestamp: string;
}

export interface ISlackResponseAttachment {
  color: string;
  title?: string;
  pretext?: string;
  text: string;
  footer?: string;
  ts?: number;
}

export interface ISlackResponse {
  response_type: 'in_channel' | 'ephemeral';
  attachments: ISlackResponseAttachment[];
}
