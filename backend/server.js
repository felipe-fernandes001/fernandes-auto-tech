require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const fs       = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middlewares globais ──────────────────────────────────────
app.use(cors({
  origin: '*'
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

const db = require('./src/db');

// ── Migração Automática de Banco de Dados ────────────────────
const iniciarBancoDeDados = async () => {
  try {
    console.log('🔄 Sincronizando tabelas com o PostgreSQL no Railway...');
    
    // 1. Cria a tabela base com a estrutura relacional correta
    await db.query(`
      CREATE TABLE IF NOT EXISTS agendamentos (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER,
        veiculo_id INTEGER,
        servico_id INTEGER,
        data_hora TIMESTAMP,
        status TEXT DEFAULT 'recebido',
        observacoes TEXT,
        valor_cobrado DECIMAL(10,2),
        token_cliente TEXT,
        busca_veiculo BOOLEAN DEFAULT FALSE,
        cancelamento_motivo TEXT,
        colaboradores_ids TEXT,
        valor_final DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Trava de segurança: Garante as novas colunas caso a tabela já existisse
    await db.query(`
      ALTER TABLE agendamentos
      ADD COLUMN IF NOT EXISTS busca_veiculo BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS cancelamento_motivo TEXT,
      ADD COLUMN IF NOT EXISTS colaboradores_ids TEXT,
      ADD COLUMN IF NOT EXISTS valor_final DECIMAL(10,2);
    `);

    // 3. Atualiza a constraint do status para suportar o fluxo completo
    await db.query(`ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS chk_status;`);
    await db.query(`
      ALTER TABLE agendamentos ADD CONSTRAINT chk_status CHECK (
        status IN ('recebido', 'em_lavagem', 'detalhamento', 'finalizado', 'pronto_retirada', 'cancelado')
      );
    `);

    console.log('✅ Banco de dados sincronizado e pronto para uso!');
  } catch (err) {
    console.error('❌ Erro ao sincronizar o banco de dados:', err.message);
  }
};

// ── Inicializa servidor APÓS migração ────────────────────────
iniciarBancoDeDados().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚗 Fernandes Auto Tech API rodando na porta ${PORT}`);
    console.log(`📍 http://localhost:${PORT}/api/health\n`);
  });
});
