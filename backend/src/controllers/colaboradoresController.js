const db = require('../db');

/* ────────────────────────────────────────────────
   GET /api/colaboradores
   Lista todos os colaboradores ativos
   Estrutura: id, nome, cargo, porcentagem_comissao, saldo_acumulado, ativo
──────────────────────────────────────────────── */
const listarColaboradores = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, nome, cargo, porcentagem_comissao, saldo_acumulado, ativo, created_at
       FROM colaboradores
       WHERE ativo = TRUE
       ORDER BY nome ASC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao buscar colaboradores.' });
  }
};

/* ────────────────────────────────────────────────
   POST /api/colaboradores
   Cadastra novo colaborador
──────────────────────────────────────────────── */
const criarColaborador = async (req, res) => {
  try {
    const { nome, cargo = 'Ajudante', porcentagem_comissao = 35, codigo_acesso = '' } = req.body;
    if (!nome?.trim()) return res.status(400).json({ success: false, message: 'Nome obrigatório.' });

    const result = await db.query(
      `INSERT INTO colaboradores (nome, cargo, porcentagem_comissao, saldo_acumulado, codigo_acesso)
       VALUES ($1, $2, $3, 0, $4) RETURNING *`,
      [nome.trim(), cargo.trim(), parseFloat(porcentagem_comissao), codigo_acesso]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao criar colaborador.' });
  }
};

/* ────────────────────────────────────────────────
   PUT /api/colaboradores/:id
   Atualiza colaborador
──────────────────────────────────────────────── */
const atualizarColaborador = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cargo, porcentagem_comissao, ativo, saldo_acumulado, codigo_acesso } = req.body;

    const result = await db.query(
      `UPDATE colaboradores
       SET nome                 = COALESCE($1, nome),
           cargo                = COALESCE($2, cargo),
           porcentagem_comissao = COALESCE($3, porcentagem_comissao),
           ativo                = COALESCE($4, ativo),
           saldo_acumulado      = COALESCE($5, saldo_acumulado),
           codigo_acesso        = COALESCE($6, codigo_acesso)
       WHERE id = $7 RETURNING *`,
      [
        nome?.trim() || null,
        cargo?.trim() || null,
        porcentagem_comissao !== undefined ? parseFloat(porcentagem_comissao) : null,
        ativo !== undefined ? ativo : null,
        saldo_acumulado !== undefined ? parseFloat(saldo_acumulado) : null,
        codigo_acesso !== undefined && codigo_acesso !== '' ? codigo_acesso : null,
        id
      ]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Colaborador não encontrado.' });

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao atualizar colaborador.' });
  }
};

/* ────────────────────────────────────────────────
   DELETE /api/colaboradores/:id
   Soft-delete: marca como inativo
──────────────────────────────────────────────── */
const desativarColaborador = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'UPDATE colaboradores SET ativo = FALSE WHERE id = $1 RETURNING id, nome',
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Colaborador não encontrado.' });
    res.json({ success: true, message: `${result.rows[0].nome} desativado.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao desativar colaborador.' });
  }
};

/* ────────────────────────────────────────────────
   POST /api/colaboradores/agendamento/:agendamento_id
   Vincula colaboradores a um agendamento
──────────────────────────────────────────────── */
const vincularColaboradores = async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const { agendamento_id } = req.params;
    const { colaborador_ids } = req.body;  // number[]

    if (!Array.isArray(colaborador_ids) || colaborador_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Informe ao menos um colaborador.' });
    }

    // Remove vínculos anteriores
    await client.query('DELETE FROM agendamento_colaboradores WHERE agendamento_id = $1', [agendamento_id]);

    for (const cid of colaborador_ids) {
      await client.query(
        'INSERT INTO agendamento_colaboradores (agendamento_id, colaborador_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [agendamento_id, cid]
      );
    }

    await client.query('COMMIT');
    res.json({ success: true, message: 'Equipe vinculada.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro vincularColaboradores:', err);
    res.status(500).json({ success: false, message: 'Erro ao vincular equipe.' });
  } finally {
    client.release();
  }
};

/* ────────────────────────────────────────────────
   GET /api/colaboradores/relatorio?mes=YYYY-MM
   Relatório de comissões.
   Calcula GANHOS DO MÊS e traz o SALDO ACUMULADO.
──────────────────────────────────────────────── */
const relatorioComissoes = async (req, res) => {
  try {
    const { mes } = req.query;
    const ref = mes || new Date().toISOString().slice(0, 7);
    const [ano, month] = ref.split('-');

    const result = await db.query(
      `SELECT
         c.id,
         c.nome,
         c.cargo,
         c.porcentagem_comissao,
         c.saldo_acumulado,
         COUNT(DISTINCT ac.agendamento_id)                                    AS total_servicos,
         COALESCE(SUM(
           COALESCE(a.valor_cobrado, s.preco) / 
           NULLIF((SELECT COUNT(*) FROM agendamento_colaboradores ac2 WHERE ac2.agendamento_id = a.id), 0)
         ), 0) AS faturamento_total,
         COALESCE(SUM(
           (COALESCE(a.valor_cobrado, s.preco) / 
           NULLIF((SELECT COUNT(*) FROM agendamento_colaboradores ac2 WHERE ac2.agendamento_id = a.id), 0)) * c.porcentagem_comissao / 100
         ), 0) AS valor_a_pagar
       FROM colaboradores c
       LEFT JOIN agendamento_colaboradores ac ON ac.colaborador_id = c.id
       LEFT JOIN agendamentos a ON a.id = ac.agendamento_id
         AND EXTRACT(YEAR  FROM a.data_hora) = $1
         AND EXTRACT(MONTH FROM a.data_hora) = $2
         AND a.status IN ('finalizado', 'pronto_retirada')
       LEFT JOIN servicos s ON s.id = a.servico_id
       WHERE c.ativo = TRUE
       GROUP BY c.id, c.nome, c.cargo, c.porcentagem_comissao, c.saldo_acumulado
       ORDER BY c.nome ASC`,
      [parseInt(ano), parseInt(month)]
    );

    res.json({ success: true, data: result.rows, mes: ref });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao gerar relatório.' });
  }
};

module.exports = {
  listarColaboradores,
  criarColaborador,
  atualizarColaborador,
  desativarColaborador,
  vincularColaboradores,
  relatorioComissoes,
};
