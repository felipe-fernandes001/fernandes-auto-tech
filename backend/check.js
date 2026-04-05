const { Client } = require('pg');
const client = new Client({ user: 'postgres', password: 'Epil@f08@6234', host: 'localhost', port: 5432, database: 'fernandes_tech' });
client.connect()
  .then(() => client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'agendamentos'"))
  .then(res => console.log('agendamentos:', res.rows))
  .then(() => client.query("SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'clientes'"))
  .then(res => console.log('clientes indexes:', res.rows))
  .catch(console.error)
  .finally(() => client.end());
