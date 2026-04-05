const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'fernandes_tech',
  user: 'postgres',
  password: 'Epil@f08@6234'
});

async function run() {
  try {
    const sql = fs.readFileSync('fix_clientes.sql', 'utf8');
    await pool.query(sql);
    console.log('SQL executado com sucesso!');
  } catch(e) {
    console.error('Erro:', e);
  } finally {
    pool.end();
  }
}

run();
