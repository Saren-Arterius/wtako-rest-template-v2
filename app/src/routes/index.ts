import { Router } from 'express';
import Boom from '@hapi/boom';
import Joi from 'joi';

import { AuthedRequest, IPRequest } from '../types/auth';
import { knex } from '../common';

const router: Router = Router();


const schema = Joi.object({
  name: Joi.string().min(2).max(50),
  username: Joi.string().regex(/^[_.0-9a-zA-Z]{3,30}$/),
  description: Joi.string().max(2000)
});

router.get('/', async (req: IPRequest, res) => {
  const [pgCheck] = await knex('config').select().where('key', 'lastStart');
  res.send(`Hello world! ${req.userIP} ${pgCheck.value}`);
});

export default router;