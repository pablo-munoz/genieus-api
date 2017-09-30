const knex = require('knex');
const dbConn = knex({
  client: 'pg',
  connection: {
    host: 'database',
    user: 'postgres',
    database: 'genieus',
    port: 5432
  }
});

module.exports = dbConn;
