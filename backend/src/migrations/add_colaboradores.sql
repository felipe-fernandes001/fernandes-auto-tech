-- ═══════════════════════════════════════════════════════════
-- MIGRAÇÃO: Sistema de Equipe / Comissões (v2)
-- ═══════════════════════════════════════════════════════════

-- 1. Tabela de colaboradores
CREATE TABLE IF NOT EXISTS colaboradores (
  id                   SERIAL PRIMARY KEY,
  nome                 VARCHAR(100) NOT NULL,
  cargo                VARCHAR(100) NOT NULL DEFAULT 'Ajudante',
  porcentagem_comissao DECIMAL(10, 2) NOT NULL DEFAULT 35.00,
  saldo_acumulado      DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  ativo                BOOLEAN NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tabela de vínculo agendamento ↔ colaborador
CREATE TABLE IF NOT EXISTS agendamento_colaboradores (
  id              SERIAL PRIMARY KEY,
  agendamento_id  INTEGER NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
  colaborador_id  INTEGER NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(agendamento_id, colaborador_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ag_colab_agendamento ON agendamento_colaboradores(agendamento_id);
CREATE INDEX IF NOT EXISTS idx_ag_colab_colaborador  ON agendamento_colaboradores(colaborador_id);

-- Colunas extras nos agendamentos se não existirem
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS valor_cobrado DECIMAL(10,2);
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
