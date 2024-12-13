import { updateTypes } from 'knex-types';
import { knex } from '../common';

updateTypes(knex, { output: '/src/app/src/types/tables.ts' }).then(() => {
  setTimeout(() => {
    process.exit(0);
  }, 1000);
}).catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
