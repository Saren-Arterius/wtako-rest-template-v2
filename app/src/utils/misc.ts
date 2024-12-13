import axios from 'axios';
import Boom from '@hapi/boom';
import objectAssignDeep from 'object-assign-deep';
import crypto from 'crypto';
import FormData from 'form-data';
import fs from 'fs/promises';

import { knex, CONFIG } from '../common';
import { AuthedRequest } from '../types/auth';

export const sleep = (ms: number) => new Promise(rs => setTimeout(rs, ms));

export const updateDB = async () => {
  console.log(333, JSON.stringify(CONFIG.knex))

  const cloned = JSON.parse(JSON.stringify(CONFIG.knex));
  cloned.connection.database = null;
  const createKnex = require('knex')(cloned);

  const rows = await createKnex('pg_catalog.pg_database').select().where('datname', CONFIG.knex.connection.database);
  if (!rows.length) {
    console.log('[DB] Creating database');
    await createKnex.raw(`CREATE DATABASE ${CONFIG.knex.connection.database}`);
  }
  console.log('[DB] knex migrate:latest');
  await knex.migrate.latest({ directory: '../migrations' });
  console.log('[DB] Done');
};

export const revoluteDB = async () => {
  const cloned = JSON.parse(JSON.stringify(CONFIG.knex));
  cloned.connection.database = null;
  const createKnex = require('knex')(cloned);
  await createKnex('pg_stat_activity')
    .select(knex.raw('pg_terminate_backend(pid)'))
    .where('datname', CONFIG.knex.connection.database);
  await createKnex.raw(`DROP DATABASE IF EXISTS ${CONFIG.knex.connection.database}`);
  await updateDB();
};

export const sqlJSONTables = (tables: any[]) => tables.map(t => knex.raw(`to_json("${t}".*) as "${t}"`));

export const randomBytes = (size = 32) => new Promise((rs, rj) => {
  crypto.randomBytes(size, (err, buf) => {
    if (err) return rj(err);
    return rs(buf.toString('hex'));
  });
});

export const paging = (req: { params: { page: string; }; page: number; }, res: any, next: () => any) => {
  let page = parseInt(req.params.page, 10) || 0;
  if (page < 0) page = 0;
  req.page = page;
  return next();
};

export const noCache = (req: any, res: { setHeader: (arg0: string, arg1: string) => void; }, next: () => void) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); // HTTP 1.1.
  res.setHeader('Pragma', 'no-cache'); // HTTP 1.0.
  res.setHeader('Expires', '0'); // Proxies.
  next();
};

export const requireLogin = (req: AuthedRequest, res: any, next: any) => {
  if (!req.user) {
    return next(Boom.unauthorized('Not logged in'));
  }
  next();
};

export const rejectLogin = (req: AuthedRequest, res: any, next: any) => {
  if (req.user) {
    return next(Boom.badRequest('Already logged in'));
  }
  return next();
};

export const getRandomInt = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * ((max - min) + 1)) + min;
};

export const retainFields = (object: { [x: string]: any; }, fields: Iterable<unknown> | null | undefined) => {
  const fieldSet = new Set(fields);
  Object.keys(object).forEach((f) => {
    if (!fieldSet.has(f)) delete object[f];
  });
  return object;
};

export const tryRemoveFiles = async (files: any) => {
  for (const f of files) {
    try {
      await fs.rm(f, { recursive: true });
    } catch (error) {
      console.error(error);
    }
  }
};


export const clamp = (num: number, min: number, max: number) => {
  // eslint-disable-next-line no-nested-ternary
  return num <= min ? min : num >= max ? max : num;
};

export const axiosMultipart = (data: { [s: string]: unknown; } | ArrayLike<unknown>) => {
  const formData = new FormData();
  Object.entries(data).forEach(([k, v]) => formData.append(k, v));
  const config = {
    headers: Object.assign(
      {},
      formData.getHeaders(),
      {
        'Content-Length': formData.getLengthSync()
      }
    )
  };
  return { formData, config };
};

/*
export const announceToAll = async (announcement) => {
  await knex.transaction(async (trx) => {
    [announcement] = await trx('announcement').insert(announcement).returning('*');
    if (process.env.PROD) {
      await firebase.messaging()
        .sendToTopic('all', {
          data: {
            url: announcement.url || '',
            place_id: announcement.place_id || '',
            franchise_id: announcement.franchise_id || '',
            type: 'announcement'
          },
          notification: {
            title: announcement.title,
            body: announcement.body
          }
        }, {
          priority: 'high'
        });
      await tryPurgeCFCache(['/announcements.html?go_gup=1', '/announcements.html']);
    }
  });
  return announcement;
};
*/

export function numberInGroups(n: { toString: () => string; }) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') || 0;
}

/*
export const getDisplayPriceString = (price, commas = false) => {
  if (!price) return '0';
  const n = ethers.FixedNumber.fromValue(price, 18, 'fixed').toString();
  if (!commas) return n;
  const [dec, point] = n.split('.');
  if (point === '0') return numberInGroups(dec);
  return [numberInGroups(dec), point.substr(0, 5)].join('.');
};
*/

export const formatDate = (ms: string | number | Date, cut = '-') => {
  const date = new Date(ms);
  const YY = date.getFullYear() + cut;
  const MM =
    (date.getMonth() + 1 < 10
      ? `0${date.getMonth() + 1}`
      : date.getMonth() + 1) + cut;
  const DD = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  const hh = `${date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()}:`;
  const mm = `${date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()}:`;
  const ss = date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds();
  return `${YY + MM + DD} ${hh}${mm}${ss}`;
};

export const ordinalSuffix = (i: number) => {
  const j = i % 10;
  const k = i % 100;
  if (j === 1 && k !== 11) {
    return `${i}st`;
  }
  if (j === 2 && k !== 12) {
    return `${i}nd`;
  }
  if (j === 3 && k !== 13) {
    return `${i}rd`;
  }
  return `${i}th`;
};
