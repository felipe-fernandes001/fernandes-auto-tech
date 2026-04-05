-- ================================================
-- Fernandes Auto Tech — Schema PostgreSQL
-- Execute este arquivo no seu PGAdmin ou Terminal:
--   psql -U seu_usuario -d fernandes_autotech -f schema.sql
-- ================================================

-- Habilitar extensão UUID (opcional)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABELA: clientes
-- ============================================================
CREATE TABLE IF NOT EXISTS clientes (
    id          SERIAL PRIMARY KEY,
    nome        VARCHAR(255) NOT NULL,
    celular     VARCHAR(20)  NOT NULL,
    email       VARCHAR(255),
    token_acesso VARCHAR(255) UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
    created_at  TIMESTAMP    DEFAULT NOW(),
    updated_at  TIMESTAMP    DEFAULT NOW()
);

-- ============================================================
-- TABELA: veiculos
-- ============================================================
CREATE TABLE IF NOT EXISTS veiculos (
    id          SERIAL PRIMARY KEY,
    cliente_id  INTEGER      NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    modelo      VARCHAR(255) NOT NULL,
    placa       VARCHAR(20),
    cor         VARCHAR(100),
    ano         INTEGER,
    created_at  TIMESTAMP    DEFAULT NOW()
);

-- ============================================================
-- TABELA: servicos
-- ============================================================
CREATE TABLE IF NOT EXISTS servicos (
    id                SERIAL PRIMARY KEY,
    nome              VARCHAR(255)   NOT NULL,
    descricao         TEXT,
    preco             DECIMAL(10, 2) NOT NULL,
    duracao_minutos   INTEGER        DEFAULT 60,
    ativo             BOOLEAN        DEFAULT TRUE,
    created_at        TIMESTAMP      DEFAULT NOW()
);

-- ============================================================
-- TABELA: agendamentos
-- ============================================================
-- Status possíveis: recebido | em_lavagem | detalhamento | finalizado | pronto_retirada
CREATE TABLE IF NOT EXISTS agendamentos (
    id              SERIAL PRIMARY KEY,
    cliente_id      INTEGER      NOT NULL REFERENCES clientes(id),
    veiculo_id      INTEGER      NOT NULL REFERENCES veiculos(id),
    servico_id      INTEGER      NOT NULL REFERENCES servicos(id),
    data_hora       TIMESTAMP    NOT NULL,
    status          VARCHAR(50)  NOT NULL DEFAULT 'recebido',
    observacoes     TEXT,
    token_cliente   VARCHAR(255) UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
    valor_cobrado   DECIMAL(10, 2),
    created_at      TIMESTAMP    DEFAULT NOW(),
    updated_at      TIMESTAMP    DEFAULT NOW(),

    CONSTRAINT chk_status CHECK (
        status IN ('recebido', 'em_lavagem', 'detalhamento', 'finalizado', 'pronto_retirada', 'cancelado')
    )
);

-- ============================================================
-- TABELA: checklist_entrada
-- Fotos e observações feitas no recebimento do veículo
-- ============================================================
CREATE TABLE IF NOT EXISTS checklist_entrada (
    id              SERIAL PRIMARY KEY,
    agendamento_id  INTEGER      NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
    foto_url        VARCHAR(500),
    observacao      TEXT,
    created_at      TIMESTAMP    DEFAULT NOW()
);

-- ============================================================
-- TABELA: historico_status
-- Log de todas as mudanças de status (auditoria)
-- ============================================================
CREATE TABLE IF NOT EXISTS historico_status (
    id              SERIAL PRIMARY KEY,
    agendamento_id  INTEGER     NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
    status_anterior VARCHAR(50),
    status_novo     VARCHAR(50) NOT NULL,
    alterado_por    VARCHAR(100) DEFAULT 'admin',
    created_at      TIMESTAMP   DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES para performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_agendamentos_cliente    ON agendamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status     ON agendamentos(status);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data_hora  ON agendamentos(data_hora);
CREATE INDEX IF NOT EXISTS idx_agendamentos_token      ON agendamentos(token_cliente);
CREATE INDEX IF NOT EXISTS idx_veiculos_cliente        ON veiculos(cliente_id);

-- ============================================================
-- TRIGGER: atualiza updated_at automaticamente
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_agendamentos_updated_at
    BEFORE UPDATE ON agendamentos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_clientes_updated_at
    BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SEED: Serviços iniciais
-- ============================================================
INSERT INTO servicos (nome, descricao, preco, duracao_minutos) VALUES
    ('Detalhamento de Motos',
     'Limpeza completa e detalhamento profissional para motos. Remove sujeira, polimento e proteção.',
     150.00, 120),
    ('Higienização Interna Full',
     'Higienização completa do interior do veículo com produtos premium. Bancos, tapetes, painel e teto.',
     250.00, 180),
    ('Lavagem Premium SUV',
     'Lavagem completa premium para SUVs e veículos de grande porte. Externo, rodas e acabamento.',
     80.00, 90)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED: Usuário Admin padrão (senha gerenciada via .env no backend)
-- Não armazenar senha aqui — use variáveis de ambiente
-- ============================================================

-- ============================================================
-- VIEW útil: agendamentos completos
-- ============================================================
CREATE OR REPLACE VIEW v_agendamentos_completos AS
SELECT
    a.id,
    a.token_cliente,
    a.data_hora,
    a.status,
    a.observacoes,
    a.valor_cobrado,
    a.created_at,
    c.nome        AS cliente_nome,
    c.celular     AS cliente_celular,
    c.email       AS cliente_email,
    v.modelo      AS veiculo_modelo,
    v.placa       AS veiculo_placa,
    v.cor         AS veiculo_cor,
    v.ano         AS veiculo_ano,
    s.nome        AS servico_nome,
    s.preco       AS servico_preco,
    s.duracao_minutos
FROM agendamentos a
JOIN clientes c ON c.id = a.cliente_id
JOIN veiculos  v ON v.id = a.veiculo_id
JOIN servicos  s ON s.id = a.servico_id;
