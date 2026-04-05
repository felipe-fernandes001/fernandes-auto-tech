const db = require('../db');

/**
 * GET /api/relatorios/faturamento?periodo=diario|semanal|mensal
 * Retorna faturamento agregado.
 */
const faturamento = async (req, res) => {
  try {
    const { periodo = 'semanal' } = req.query;

    let groupBy, dateFilter;

    if (periodo === 'diario') {
      groupBy = `DATE(a.data_hora)`;
      dateFilter = `a.data_hora >= NOW() - INTERVAL '30 days'`;
    } else if (periodo === 'semanal') {
      groupBy = `DATE_TRUNC('week', a.data_hora)`;
      dateFilter = `a.data_hora >= NOW() - INTERVAL '12 weeks'`;
    } else {
      groupBy = `DATE_TRUNC('month', a.data_hora)`;
      dateFilter = `a.data_hora >= NOW() - INTERVAL '12 months'`;
    }

    const result = await db.query(`
      SELECT
        ${groupBy}                     AS periodo,
        COUNT(a.id)                    AS total_agendamentos,
        SUM(COALESCE(a.valor_cobrado, s.preco)) AS faturamento_total,
        AVG(COALESCE(a.valor_cobrado, s.preco)) AS ticket_medio
      FROM agendamentos a
      JOIN servicos s ON s.id = a.servico_id
      WHERE ${dateFilter}
        AND a.status IN ('finalizado', 'pronto_retirada')
      GROUP BY ${groupBy}
      ORDER BY periodo DESC
    `);

    res.json({ success: true, data: result.rows, periodo });
  } catch (err) {
    console.error('Erro no relatório de faturamento:', err);
    res.status(500).json({ success: false, message: 'Erro ao gerar relatório.' });
  }
};

/**
 * GET /api/relatorios/resumo
 * Resumo geral: total hoje, semana, mês, veículos em pátio.
 */
const resumo = async (req, res) => {
  try {
    const [hoje, semana, mes, patio] = await Promise.all([
      db.query(`
        SELECT
          COUNT(id) AS total,
          COALESCE(SUM(valor_cobrado), 0) AS faturamento
        FROM agendamentos
        WHERE DATE(data_hora) = CURRENT_DATE
          AND status IN ('finalizado', 'pronto_retirada')
      `),
      db.query(`
        SELECT
          COUNT(id) AS total,
          COALESCE(SUM(valor_cobrado), 0) AS faturamento
        FROM agendamentos
        WHERE data_hora >= DATE_TRUNC('week', NOW())
          AND status IN ('finalizado', 'pronto_retirada')
      `),
      db.query(`
        SELECT
          COUNT(id) AS total,
          COALESCE(SUM(valor_cobrado), 0) AS faturamento
        FROM agendamentos
        WHERE data_hora >= DATE_TRUNC('month', NOW())
          AND status IN ('finalizado', 'pronto_retirada')
      `),
      db.query(`
        SELECT COUNT(id) AS total
        FROM agendamentos
        WHERE status NOT IN ('finalizado', 'pronto_retirada')
      `),
    ]);

    res.json({
      success: true,
      data: {
        hoje:   hoje.rows[0],
        semana: semana.rows[0],
        mes:    mes.rows[0],
        veiculos_em_patio: parseInt(patio.rows[0].total),
      },
    });
  } catch (err) {
    console.error('Erro no resumo:', err);
    res.status(500).json({ success: false, message: 'Erro ao gerar resumo.' });
  }
};

/**
 * GET /api/relatorios/servicos
 * Ranking de serviços mais solicitados.
 */
const rankingServicos = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        s.nome,
        COUNT(a.id) AS total,
        SUM(COALESCE(a.valor_cobrado, s.preco)) AS faturamento
      FROM agendamentos a
      JOIN servicos s ON s.id = a.servico_id
      WHERE a.data_hora >= NOW() - INTERVAL '30 days'
      GROUP BY s.id, s.nome
      ORDER BY total DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Erro ranking:', err);
    res.status(500).json({ success: false, message: 'Erro interno.' });
  }
};

module.exports = { faturamento, resumo, rankingServicos };
