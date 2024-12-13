import pg from 'pg';
import multer from 'multer';
import createKnex from 'knex';

import { configDev } from './config/dev';
import { secretsDev } from './config/secrets-dev';
import _ from 'lodash';
// process.env.PROD = 1;

export const SECRETS = secretsDev;
export const CONFIG = configDev;

 
const knexConfig = _.cloneDeep(CONFIG.knex);
knexConfig.pool = {
  afterCreate(connection: { query: (arg0: string, arg1: (err: unknown) => void) => void; }, callback: (err: unknown, arg1: unknown) => void) {
    connection.query(`SET TIME ZONE "${CONFIG.timezone.postgres}"`, (err: unknown) => {
      callback(err, connection);
    });
  }
};

pg.types.setTypeParser(20, 'text', parseInt);
export const knex = createKnex(knexConfig);

export const userFileUpload = multer({
  dest: '/data/upload',
  limits: {
    fileSize: CONFIG.upload.fileSizeLimit
  }
});

const storage = multer.memoryStorage();
export const userPhotoUploadRam = multer({
  storage,
  limits: {
    fileSize: CONFIG.upload.fileSizeLimit
  }
});

// fbAdmin.initializeApp({
//   credential: fbAdmin.credential.cert(require(CONFIG.firebase.serviceAccountPath)),
//   databaseURL: CONFIG.firebase.databaseURL
// });

