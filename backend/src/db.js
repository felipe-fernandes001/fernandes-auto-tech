const { Pool } = require('pg');
require('dotenv').config();

// Usa a URL do Railway em produção, ou as variáveis locais (host, user...) se estiver rodando localmente
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.LOCAL_DB_URL, // Adapte se usar variáveis separadas localmente
  // O Railway e outros provedores em nuvem geralmente exigem SSL
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
