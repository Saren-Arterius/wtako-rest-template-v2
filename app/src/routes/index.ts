import { Router } from 'express';
// import Boom from '@hapi/boom';
// import Joi from 'joi';

import type { IPRequest } from '../types/express';
import { knex } from '../common';
import type { Config } from '../types/tables';
import Boom from '@hapi/boom';

const router: Router = Router();


// const schema = Joi.object({
//   name: Joi.string().min(2).max(50),
//   username: Joi.string().regex(/^[_.0-9a-zA-Z]{3,30}$/),
//   description: Joi.string().max(2000)
// });

router.get('/', async (req: IPRequest, res) => {
  const pgCheck = await knex<Config>('config').select().where('key', 'lastStart').first();
  res.send(`Hello world! ${req.userIP} ${pgCheck?.value}`);
  console.log(`hi`);
});

router.get('/err', (req: IPRequest, res, next) => {
  next(Boom.badRequest('test'));
});

export default router;