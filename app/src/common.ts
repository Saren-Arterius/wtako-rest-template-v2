import pg from 'pg';
import multer from 'multer';
import createKnex from 'knex';

import { configDev } from './config/dev';
import { secretsDev } from './config/secrets-dev';
// process.env.PROD = 1;

export const SECRETS = secretsDev;
export const CONFIG = configDev;

const knexConfig: typeof CONFIG.knex = Object.assign({}, JSON.parse(JSON.stringify(CONFIG.knex)));
knexConfig.pool = {
  afterCreate(connection, callback) {
    connection.query(`SET TIME ZONE "${CONFIG.timezone.postgres}"`, (err: any) => {
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

