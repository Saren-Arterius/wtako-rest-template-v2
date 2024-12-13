import express, { Application } from 'express';
import logger from 'morgan';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import Boom from '@hapi/boom';
import url from 'url';
import jwt from 'jsonwebtoken';

import { updateDB, sleep } from './utils/misc';
import { CONFIG, knex } from './common';

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
app.use((req, res, next) => {
  if (!req.headers.origin) {
    return next();
  }
  const { hostname } = url.parse(req.headers.origin);
  if (hostname !== null && CONFIG.trustedHosts[hostname]) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  }
  if (req.method === 'OPTIONS') {
    res.send()
    return
  };
  next();
});

// Anti-CSRF
app.use((req, res, next) => {
  if (req.method !== 'POST') return next();
  const check = req.headers.origin || req.headers.referer;
  if (!check) return next();
  const { hostname } = url.parse(check);
  if (hostname !== null && !CONFIG.trustedHosts[hostname]) return next(Boom.badRequest(`Untrusted hostname ${hostname}`));
  return next();
});

app.use((req: any, res, next) => {
  if (req.query.http_auth) {
    req.headers.authorization = req.query.http_auth;
  }
  req.userIP = req.headers['cf-connecting-ip'] ||
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress;
  req.deviceID = req.headers['x-gateway-id'] ||
    req.headers['X-GATEWAY-ID'];

  next();
});

import index from './routes/index';
app.use('/', index);

app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  if (err.output) {
    return res.status(err.output.statusCode)
      .json(err.output.payload);
  }
  throw err;
});

process.on('unhandledRejection', (reason, p) => {
  console.error(reason, 'Unhandled Rejection at Promise', p);
}).on('uncaughtException', (err) => {
  console.error(err, 'Uncaught Exception thrown');
  // process.exit(1);
});

export const main = (async () => {
  while (updateDB) {
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
  const [pgCheck] = await knex('config').select().where('key', key);
  console.log({ pgCheck });

  // await redis.set(key, value);
  // const redisCheck = await redis.get(key);
  // console.log({ redisCheck });
});
