import {revoluteDB} from '../utils/misc';
import {CONFIG} from '../common';
import createKnex from 'knex';
import _ from 'lodash';

void (async () => {
  console.log('Revoluting DB');
  await revoluteDB();
  console.log('Truncate tables');
  const cloned = _.cloneDeep(CONFIG.knex); 
  const tk = createKnex(cloned);
  await tk.raw('TRUNCATE TABLE knex_migrations, knex_migrations_lock CASCADE');
  console.log('Done');
  process.exit(0);
})();
