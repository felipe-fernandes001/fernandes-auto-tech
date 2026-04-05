-- 1. Create table configuracoes
CREATE TABLE IF NOT EXISTS configuracoes (
    chave VARCHAR(100) PRIMARY KEY,
    valor TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);
INSERT INTO configuracoes (chave, valor) VALUES ('meta_faturamento_mensal', '30000') ON CONFLICT DO NOTHING;

-- 2. Cleanup Dups
WITH duplicados AS (
  SELECT celular, MIN(id) as id_to_keep
  FROM clientes
  GROUP BY celular
  HAVING COUNT(*) > 1
)
UPDATE veiculos v
SET cliente_id = d.id_to_keep
FROM clientes c
JOIN duplicados d ON d.celular = c.celular
WHERE v.cliente_id = c.id AND c.id != d.id_to_keep;

WITH duplicados AS (
  SELECT celular, MIN(id) as id_to_keep
  FROM clientes
  GROUP BY celular
  HAVING COUNT(*) > 1
)
UPDATE agendamentos a
SET cliente_id = d.id_to_keep
FROM clientes c
JOIN duplicados d ON d.celular = c.celular
WHERE a.cliente_id = c.id AND c.id != d.id_to_keep;

WITH duplicados AS (
  SELECT celular, MIN(id) as id_to_keep
  FROM clientes
  GROUP BY celular
  HAVING COUNT(*) > 1
)
DELETE FROM clientes c
USING duplicados d
WHERE c.celular = d.celular AND c.id != d.id_to_keep;

-- 3. Unique
ALTER TABLE clientes DROP CONSTRAINT IF EXISTS clientes_celular_key;
ALTER TABLE clientes ADD CONSTRAINT clientes_celular_key UNIQUE(celular);
