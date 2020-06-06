import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';
import redis from 'ioredis';
import { IncomingWebhook } from '@slack/client';
import { JSDOM } from 'jsdom';

const client = redis.createClient(process.env.REDIS_URL || undefined);
const id = uuidv4();
const log = (msg: string, ...rest: any) => console.log(`[id:${id}] ${msg}`, rest);

process.on('unhandledRejection', (e) => {
  console.error(e); // eslint-disable-line
  throw new Error('Unhandled exception');
});

const webhooksUrls: Array<string> = (process.env.SLACK_WEBHOOK_URLS || '').split(',');
const webhooks: Array<IncomingWebhook> = webhooksUrls.map((url) => new IncomingWebhook(url));

async function main() {
  const URL = 'https://www.como.fi/aiheet/seksi/';
  const req = await fetch(URL);
  const text = await req.text();

  const { document } = new JSDOM(text).window;

  const posts = [...((document.querySelectorAll('.aiheet-seksi') as unknown) as Array<Element>)];

  const formatted = posts.map((p) => {
    const imageUrl = p.querySelector('.wp-post-image')?.getAttribute('data-src');
    console.log(imageUrl);
    const url = p.querySelector('a')?.href;
    const title = p.querySelector('.entry-title > a')?.innerHTML;
    const blurb = p.querySelector('.entry-content > p')?.innerHTML;
    const releasedAt = p.querySelector('time')?.getAttribute('datetime');

    const tagsRaw = [...((p.querySelectorAll('.entry-meta strong a') as unknown) as Array<Element>)];

    const tags = tagsRaw.map((tag) => {
      return {
        href: tag.getAttribute('href'),
        value: tag.innerHTML,
      };
    });

    return {
      url,
      imageUrl,
      title,
      blurb,
      releasedAt,
      tags,
    };
  });

  console.log(JSON.stringify(formatted, null, 2));
}

main();
