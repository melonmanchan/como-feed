import uuid from 'uuid';
import redis from 'ioredis';
import { IncomingWebhook } from '@slack/client';

const client = redis.createClient(process.env.REDIS_URL || undefined);
const id = uuid.v4();
const log = (msg: string, ...rest: any) => console.log(`[id:${id}] ${msg}`, rest);

process.on('unhandledRejection', (e) => {
  console.error(e); // eslint-disable-line
  throw new Error('Unhandled exception');
});

const webhooksUrls: Array<string> = (process.env.SLACK_WEBHOOK_URLS || '').split(',');
const webhooks: Array<IncomingWebhook> = webhooksUrls.map((url) => new IncomingWebhook(url));

async function main() {}

main();
