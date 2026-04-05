const db = require('../db');

/**
 * GET /api/clientes (admin)
 * Lista todos os clientes com info do último agendamento.
 */
const listarClientes = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        c.id, c.nome, c.celular, c.email, c.created_at,
        COUNT(a.id)            AS total_agendamentos,
        MAX(a.data_hora)       AS ultimo_agendamento,
        SUM(a.valor_cobrado)   AS total_gasto
      FROM clientes c
      LEFT JOIN agendamentos a ON a.cliente_id = c.id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Erro ao listar clientes:', err);
    res.status(500).json({ success: false, message: 'Erro ao buscar clientes.' });
  }
};

/**
 * GET /api/clientes/:id (admin)
 * Detalhes de um cliente com histórico de agendamentos.
 */
const buscarCliente = async (req, res) => {
  try {
    const { id } = req.params;

    const cliente = await db.query(
      'SELECT id, nome, celular, email, created_at FROM clientes WHERE id = $1',
      [id]
    );
    if (cliente.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Cliente não encontrado.' });
    }

    const historico = await db.query(
      `SELECT a.id, a.data_hora, a.status, a.valor_cobrado, a.token_cliente,
              s.nome AS servico, v.modelo AS veiculo
       FROM agendamentos a
       JOIN servicos s ON s.id = a.servico_id
       JOIN veiculos  v ON v.id = a.veiculo_id
       WHERE a.cliente_id = $1
       ORDER BY a.data_hora DESC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...cliente.rows[0],
        historico: historico.rows,
      },
    });
  } catch (err) {
    console.error('Erro ao buscar cliente:', err);
    res.status(500).json({ success: false, message: 'Erro interno.' });
  }
};

/**
 * GET /api/clientes/busca?q=termo (admin)
 */
const buscarPorTermo = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, data: [] });

    const result = await db.query(
      `SELECT id, nome, celular, email
       FROM clientes
       WHERE nome ILIKE $1 OR celular ILIKE $1
       ORDER BY nome ASC
       LIMIT 20`,
      [`%${q}%`]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Erro na busca:', err);
    res.status(500).json({ success: false, message: 'Erro interno.' });
  }
};

module.exports = { listarClientes, buscarCliente, buscarPorTermo };
