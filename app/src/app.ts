import express, { type ErrorRequestHandler, type Application, type NextFunction, type Request, type Response } from 'express';
import logger from 'morgan';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import Boom from '@hapi/boom';

import { updateDB, sleep } from './utils/misc';
import { CONFIG, knex } from './common';

import index from './routes/index';
import type { IPRequest } from './types/express';
import type { Config } from './types/tables';

export const app: Application = express();


app.use(logger('dev'));
app.use(express.static('public'));
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));
app.use(cookieParser());

app.use((req, res, next) => {
  const tmp = req.url.split('?');
  if (tmp[0].endsWith('.html')) {
    tmp[0] = tmp[0].substring(0, tmp[0].length - 5);
    req.url = tmp.join('?');
    res.header('Content-Type', 'text/html; charset=utf-8');
  }
  next();
});

// CORS
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.headers.origin == null) {
    next();
    return;
  }
  try {
    const { hostname } = new URL(req.headers.origin);
    if (CONFIG.trustedHosts[hostname]) {
      res.header('Access-Control-Allow-Origin', req.headers.origin);
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
      res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    }
  } catch (error) {
    console.error(error);
  }

  if (req.method === 'OPTIONS') {
    res.send()
    return
  };
  next();
});

// Anti-CSRF
app.use((req, res, next) => {
  if (req.method !== 'POST') { next(); return; }
  const check = req.headers.origin ?? req.headers.referer;
  if (check == null) { next(); return; }
  try {
    const { hostname } = new URL(check);
    if (!CONFIG.trustedHosts[hostname]) {
      next(Boom.badRequest(`Untrusted hostname ${hostname}`)); return;
    }
  } catch (error) {
    console.error(error);
  }
  next();
});

app.use((req: IPRequest, res: Response, next: NextFunction) => {
  if (req.query.http_auth != null && typeof req.query.http_auth === 'string') {
    // eslint-disable-next-line @typescript-eslint/prefer-destructuring
    req.headers.authorization = req.query.http_auth;
  }

  // Determine user IP with fallbacks
  req.userIP = (
    req.headers['cf-connecting-ip'] ??
    req.headers['x-forwarded-for'] ??
    req.connection.remoteAddress
  )?.toString();

  // Get device ID from headers (case-insensitive)
  req.deviceID = (
    req.headers['x-gateway-id'] ??
    req.headers['X-GATEWAY-ID']
  )?.toString();

  next();
});
app.use('/', index);

const errorHandler: ErrorRequestHandler = (err: Error | Boom.Boom, req, res, next) => {
  console.error(err);
  if (Boom.isBoom(err)) {
    res.status(err.output.statusCode)
      .json(err.output.payload);
  } else {
    next(err);
  }
};

app.use(errorHandler);


process.on('unhandledRejection', (reason, p) => {
  console.error(reason, 'Unhandled Rejection at Promise', p);
}).on('uncaughtException', (err) => {
  console.error(err, 'Uncaught Exception thrown');
  // process.exit(1);
});

export const main = (async (): Promise<void> => {
  while (true) {
    try {
      await updateDB();
      break;
    } catch (e) {
      console.error(e);
      await sleep(1000);
    }
  }

  const value = Date.now();
  const key = 'lastStart';
  await knex('config').insert({
    key,
    value
  })
    .onConflict('key')
    .merge();
  const pgCheck = await knex<Config>('config').select().where('key', 'lastStart').first();
  console.log({ pgCheck });

  // await redis.set(key, value);
  // const redisCheck = await redis.get(key);
  // console.log({ redisCheck });
});
