const { Client } = require('pg');
const client = new Client({ user: 'postgres', password: 'Epil@f08@6234', host: 'localhost', port: 5432, database: 'fernandes_tech' });
client.connect()
  .then(() => client.query("SELECT * FROM information_schema.tables WHERE table_schema='public'"))
  .then(res => console.log('tables:', res.rows.map(r => r.table_name)))
  .catch(console.error)
  .finally(() => client.end());
