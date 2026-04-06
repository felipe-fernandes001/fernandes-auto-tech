require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const fs       = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middlewares globais ──────────────────────────────────────
app.use(cors({
  origin: '*',
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

    // 1. Tabela agendamentos
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

    await db.query(`
      ALTER TABLE agendamentos
      ADD COLUMN IF NOT EXISTS busca_veiculo BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS cancelamento_motivo TEXT,
      ADD COLUMN IF NOT EXISTS colaboradores_ids TEXT,
      ADD COLUMN IF NOT EXISTS valor_final DECIMAL(10,2);
    `);

    await db.query(`ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS chk_status;`);
    await db.query(`
      ALTER TABLE agendamentos ADD CONSTRAINT chk_status CHECK (
        status IN ('recebido', 'em_lavagem', 'detalhamento', 'finalizado', 'pronto_retirada', 'cancelado')
      );
    `);

    // 2. Tabela servicos — cria com as colunas que o controller espera
    await db.query(`
      CREATE TABLE IF NOT EXISTS servicos (
        id              SERIAL PRIMARY KEY,
        nome            TEXT NOT NULL,
        descricao       TEXT DEFAULT '',
        preco           NUMERIC(10,2) NOT NULL,
        duracao_minutos INTEGER DEFAULT 60,
        categoria       TEXT NOT NULL,
        icone           TEXT DEFAULT '🔧',
        ativo           BOOLEAN DEFAULT TRUE,
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Garante colunas caso a tabela já existia com nomes antigos
    await db.query(`ALTER TABLE servicos ADD COLUMN IF NOT EXISTS descricao TEXT DEFAULT '';`);
    await db.query(`ALTER TABLE servicos ADD COLUMN IF NOT EXISTS icone TEXT DEFAULT '🔧';`);
    await db.query(`ALTER TABLE servicos ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE;`);

    // 3. Seed — insere serviços padrão apenas se a tabela estiver vazia
    const { rows } = await db.query('SELECT COUNT(*) AS total FROM servicos');
    if (parseInt(rows[0].total) === 0) {
      console.log('🌱 Inserindo serviços padrão...');
      await db.query(`
        INSERT INTO servicos (nome, descricao, preco, duracao_minutos, categoria, icone, ativo) VALUES
        ('Lavagem Simples Moto',     'Lavagem externa com shampoo e secagem.',                        35.00,  40,  'moto',  '🏍️', TRUE),
        ('Lavagem Completa Moto',    'Lavagem completa + motor + conservante de plásticos.',           60.00,  70,  'moto',  '🏍️', TRUE),
        ('Polimento Moto',           'Polimento de carenagens com cera de carnaúba.',                  90.00,  90,  'moto',  '✨',  TRUE),
        ('Lavagem Simples Carro',    'Lavagem externa com shampoo, secagem e limpeza básica.',         50.00,  50,  'carro', '🚗',  TRUE),
        ('Lavagem Completa Carro',   'Lavagem externa + interna, aspiração, vidros e tablier.',        90.00,  90,  'carro', '🚗',  TRUE),
        ('Polimento Carro',          'Polimento técnico com máquina e cera protetora.',               150.00, 120,  'carro', '✨',  TRUE),
        ('Higienização Interna',     'Limpeza profunda de estofados e tapetes com extratora.',        180.00, 150,  'carro', '🧹',  TRUE),
        ('Lavagem Simples SUV',      'Lavagem externa completa para grandes veículos.',                70.00,  60,  'suv',   '🛻',  TRUE),
        ('Lavagem Completa SUV',     'Lavagem externa + interna, aspiração, vidros e tablier.',       120.00, 110,  'suv',   '🛻',  TRUE),
        ('Polimento SUV',            'Polimento técnico com máquina e cera protetora.',               200.00, 150,  'suv',   '✨',  TRUE),
        ('Higienização Interna SUV', 'Limpeza profunda de estofados e tapetes com extratora a vapor.',230.00, 180,  'suv',   '🧹',  TRUE)
      `);
      console.log('✅ 11 serviços inseridos com sucesso!');
    } else {
      console.log(`ℹ️  Tabela servicos já tem ${rows[0].total} registro(s). Seed ignorado.`);
    }

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