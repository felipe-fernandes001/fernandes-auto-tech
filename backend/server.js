require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const fs       = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middlewares globais ──────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Pasta de uploads (cria se não existir) ───────────────────
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// ── Rotas da API ─────────────────────────────────────────────
app.use('/api/auth',          require('./src/routes/auth'));
app.use('/api/agendamentos',  require('./src/routes/agendamentos'));
app.use('/api/clientes',      require('./src/routes/clientes'));
app.use('/api/servicos',      require('./src/routes/servicos'));
app.use('/api/relatorios',    require('./src/routes/relatorios'));
app.use('/api/admin',         require('./src/routes/admin'));
app.use('/api/colaboradores', require('./src/routes/colaboradores'));
app.use('/api/colaborador',   require('./src/routes/colaborador'));

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    app: 'Fernandes Auto Tech API v1.0',
  });
});

// ── 404 handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Rota não encontrada: ${req.path}` });
});

// ── Error handler global ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err.stack);
  res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
});

// ── Inicializa servidor ──────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚗 Fernandes Auto Tech API rodando na porta ${PORT}`);
  console.log(`📍 http://localhost:${PORT}/api/health\n`);
});
