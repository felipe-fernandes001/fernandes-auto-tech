const { Client } = require('pg');
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'fernandes_tech',
  password: 'Epil@f08@6234',
  port: 5432
});

async function run() {
  try {
    await client.connect();
    const resTable = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('--- TABLES ---');
    console.log(JSON.stringify(resTable.rows));
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
run();
