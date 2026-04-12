require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares globais
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Importando as rotas originais da pasta backend/src/routes
// Agora usando ../backend/... para voltar para a pasta onde suas rotas residem
app.use('/api/auth',          require('../backend/src/routes/auth'));
app.use('/api/agendamentos',  require('../backend/src/routes/agendamentos'));
app.use('/api/clientes',      require('../backend/src/routes/clientes'));
app.use('/api/servicos',      require('../backend/src/routes/servicos'));
app.use('/api/relatorios',    require('../backend/src/routes/relatorios'));
app.use('/api/admin',         require('../backend/src/routes/admin'));
app.use('/api/colaboradores', require('../backend/src/routes/colaboradores'));
app.use('/api/colaborador',   require('../backend/src/routes/colaborador'));

// ── Rotas Públicas (Sem Auth) ────────────────────────────────
const db = require('../backend/src/db');

app.get('/api/public/avaliacoes', async (req, res) => {
  try {
    const result = await db.query("SELECT valor FROM configuracoes WHERE chave = 'avaliacoes_site'");
    if (result.rows.length > 0 && result.rows[0].valor) {
      res.json({ success: true, data: JSON.parse(result.rows[0].valor) });
    } else {
      res.json({ success: true, data: null });
    }
  } catch (err) {
    res.json({ success: false, message: 'Erro ao buscar avaliações' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    app: 'Fernandes Auto Tech API (Vercel Serverless)',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Rota não encontrada: ${req.path}` });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err.stack);
  res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
});

// Exporta o app para a Vercel consumir como Serverless Function (Sem app.listen)
module.exports = app;