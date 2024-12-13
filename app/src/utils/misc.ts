import Boom from '@hapi/boom';
import crypto from 'crypto';
import fs from 'fs/promises';
import createKnex, { type Knex } from 'knex';
import _ from 'lodash';

import { knex, CONFIG } from '../common';
import type { AuthedRequest, PagedRequest } from '../types/express';
import type { NextFunction, Request, Response } from 'express';

export const sleep = async (ms: number): Promise<void> => { await new Promise(resolve => setTimeout(resolve, ms)); };

export const updateDB = async (): Promise<void> => {
  const cloned = _.cloneDeep(CONFIG.knex);
  cloned.connection.database = undefined;
  const tmpKnex = createKnex(cloned);
   
  const rows = await tmpKnex('pg_catalog.pg_database').select().where('datname', CONFIG.knex.connection.database);
  if (rows.length === 0) {
    console.log('[DB] Creating database');
    await tmpKnex.raw(`CREATE DATABASE ${CONFIG.knex.connection.database}`);
  }
  console.log('[DB] knex migrate:latest');
  await knex.migrate.latest({ directory: '../migrations' });
  console.log('[DB] Done');
  
};

export const revoluteDB = async (): Promise<void> => {
  const cloned = _.cloneDeep(CONFIG.knex);
  cloned.connection.database = undefined;
  const tmpKnex = createKnex(cloned);

  await tmpKnex('pg_stat_activity')
    .select(knex.raw('pg_terminate_backend(pid)'))
    .where('datname', CONFIG.knex.connection.database);
  await tmpKnex.raw(`DROP DATABASE IF EXISTS ${CONFIG.knex.connection.database}`);
  await updateDB();
};

export const sqlJSONTables = (tables: string[]): Knex.Raw[] => tables.map(t => knex.raw(`to_json("${t}".*) as "${t}"`));

export const randomBytes = async (size = 32): Promise<string> => await new Promise((resolve, reject) => {
  crypto.randomBytes(size, (err, buf) => {
    if (err != null) { reject(err); return; }
    resolve(buf.toString('hex'));
  });
});

export const paging = (req: PagedRequest, res: Response, next: NextFunction): void => {
  let page = parseInt(req.params.page ?? '0', 10);
  if (page < 0) page = 0;
  req.page = page;
  next();
};

export const noCache = (req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); // HTTP 1.1.
  res.setHeader('Pragma', 'no-cache'); // HTTP 1.0.
  res.setHeader('Expires', '0'); // Proxies.
  next();
};

export const requireLogin = (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user == null) {
    next(Boom.unauthorized('Not logged in'));
    return;
  }
  next();
};

export const rejectLogin = (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user != null) {
    next(Boom.badRequest('Already logged in'));
    return;
  }
  next();
};

export const getRandomInt = (min: number, max: number): number => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * ((max - min) + 1)) + min;
};

export const retainFields = (object: Record<string, unknown>, fields: Iterable<unknown> | null | undefined): Record<string, unknown> => {
  const fieldSet = new Set(fields);
  Object.keys(object).forEach((f) => {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    if (!fieldSet.has(f)) delete object[f];
  });
  return object;
};

export const tryRemoveFiles = async (files: string[]): Promise<void> => {
  for (const f of files) {
    try {
      await fs.rm(f, { recursive: true });
    } catch (error) {
      console.error(error);
    }
  }
};


export const clamp = (num: number, min: number, max: number): number => num <= min ? min : num >= max ? max : num;
/**
 * Formats a date into a string with the pattern "YYYY-MM-DD HH:mm:ss"
 * @param ms Date input as milliseconds, string, or Date object
 * @param cut Separator character for date parts (default: '-')
 * @returns Formatted date string
 */
export const formatDate = (
  ms: string | number | Date,
  cut = '-'
): string => {
  const date = new Date(ms);

  const padNumber = (num: number): string => 
    num < 10 ? `0${num}` : String(num);

  const YY = `${date.getFullYear()}${cut}`;
  const MM = `${padNumber(date.getMonth() + 1)}${cut}`;
  const DD = padNumber(date.getDate());
  const hh = `${padNumber(date.getHours())}:`;
  const mm = `${padNumber(date.getMinutes())}:`;
  const ss = padNumber(date.getSeconds());

  return `${YY}${MM}${DD} ${hh}${mm}${ss}`;
};

/**
 * Adds an ordinal suffix to a number (1st, 2nd, 3rd, 4th, etc.)
 * @param i Input number
 * @returns Number with ordinal suffix
 */
export const ordinalSuffix = (i: number): string => {
  if (!Number.isInteger(i)) {
    throw new Error('Input must be an integer');
  }

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
