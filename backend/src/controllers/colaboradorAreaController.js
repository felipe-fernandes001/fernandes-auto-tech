const db = require('../db');

/**
 * GET /api/colaborador/dashboard
 * Retorna os serviços atribuídos a este colaborador de hoje.
 */
const getDashboard = async (req, res) => {
  try {
    const colabId = req.colaborador.id;

    // Buscar comissão do mês e saldo acumulado
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth() + 1; // 1 a 12

    // Pegamos a % de comissao e o saldo original
    const resultColab = await db.query(
      'SELECT porcentagem_comissao, saldo_acumulado FROM colaboradores WHERE id = $1',
      [colabId]
    );

    let comissao_porcentagem = 35;
    let saldo_acumulado = 0;
    if (resultColab.rows.length > 0) {
      comissao_porcentagem = parseFloat(resultColab.rows[0].porcentagem_comissao) || 35;
      saldo_acumulado = parseFloat(resultColab.rows[0].saldo_acumulado) || 0;
    }

    // Calcular ganhos apenas deste mês (status 'finalizado' ou 'pronto_retirada')
    const ganhosRes = await db.query(
      `SELECT COALESCE(SUM(
         COALESCE(a.valor_cobrado, s.preco) / NULLIF((SELECT COUNT(*) FROM agendamento_colaboradores ac2 WHERE ac2.agendamento_id = a.id), 0)
       ), 0) as faturamento_parcial
       FROM agendamento_colaboradores ac
       JOIN agendamentos a ON a.id = ac.agendamento_id 
       JOIN servicos s ON s.id = a.servico_id
       WHERE ac.colaborador_id = $1
         AND EXTRACT(YEAR FROM a.data_hora) = $2
         AND EXTRACT(MONTH FROM a.data_hora) = $3
         AND a.status IN ('finalizado', 'pronto_retirada')`,
      [colabId, ano, mes]
    );

    const faturamento_parcial = parseFloat(ganhosRes.rows[0].faturamento_parcial);
    const comissao_mes_atual = faturamento_parcial * (comissao_porcentagem / 100);

    const extrato = {
      saldoBase: saldo_acumulado,
      comissaoMes: comissao_mes_atual,
      totalGanho: saldo_acumulado + comissao_mes_atual,
      porcentagem: comissao_porcentagem
    };

    // Buscar "Meus Serviços de Hoje" ou pendentes (recebido, em_lavagem, detalhamento) independentemente da data para não perder serviços atrasados.
    const servicosRes = await db.query(
      `SELECT 
         a.id, a.data_hora, a.status, a.observacoes, a.valor_cobrado,
         v.modelo as veiculo_modelo, v.placa as veiculo_placa,
         s.nome as servico_nome, s.preco as servico_preco,
         c.celular as cliente_celular
       FROM agendamentos a
       JOIN agendamento_colaboradores ac ON a.id = ac.agendamento_id
       JOIN veiculos v ON v.id = a.veiculo_id
       JOIN servicos s ON s.id = a.servico_id
       LEFT JOIN clientes c ON c.id = a.cliente_id
       WHERE ac.colaborador_id = $1
         AND a.status != 'cancelado'
         AND (
           a.status NOT IN ('finalizado', 'pronto_retirada') 
           OR (EXTRACT(MONTH FROM a.data_hora) = EXTRACT(MONTH FROM CURRENT_DATE))
         )
       ORDER BY a.data_hora ASC`,
      [colabId]
    );

    // Buscar "Fila de Espera" (carros no pátio, recebidos hoje, mas que ninguém assumiu ainda)
    const filaRes = await db.query(
      `SELECT 
         a.id, a.data_hora, a.status, a.observacoes, a.valor_cobrado,
         v.modelo as veiculo_modelo, v.placa as veiculo_placa,
         s.nome as servico_nome, s.preco as servico_preco
       FROM agendamentos a
       LEFT JOIN agendamento_colaboradores ac ON a.id = ac.agendamento_id
       JOIN veiculos v ON v.id = a.veiculo_id
       JOIN servicos s ON s.id = a.servico_id
       WHERE ac.agendamento_id IS NULL 
         AND a.status = 'recebido'
         AND DATE(a.data_hora) = CURRENT_DATE
       ORDER BY a.data_hora ASC`
    );

    // 3. Faturamento total da loja no mês para a Meta
    const lojaRes = await db.query(
      `SELECT COALESCE(SUM(COALESCE(a.valor_cobrado, s.preco)), 0) as fat_total
       FROM agendamentos a JOIN servicos s ON s.id = a.servico_id
       WHERE EXTRACT(YEAR FROM a.data_hora) = $1 AND EXTRACT(MONTH FROM a.data_hora) = $2
         AND a.status IN ('finalizado', 'pronto_retirada')`,
         [ano, mes]
    );

  let meta_faturamento = 30000;
  try {
    const configRes = await db.query("SELECT valor FROM configuracoes WHERE chave = 'meta_faturamento_mensal'");
    if (configRes.rows.length > 0) meta_faturamento = parseFloat(configRes.rows[0].valor);
  } catch (e) {
    // Fallback silencioso
  }
    const faturamento_loja = parseFloat(lojaRes.rows[0].fat_total) || 0;

    res.json({
      success: true,
      data: {
        extrato,
        servicos: servicosRes.rows,
        filaDisponivel: filaRes.rows,
        meta: { faturamento_loja, meta_faturamento }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao carregar dashboard.' });
  }
};

/**
 * PATCH /api/colaborador/agendamentos/:id/status
 * Permite ao funcionário atualizar o status do agendamento (Ex: recebido -> em_lavagem -> finalizado).
 */
const atualizarStatus = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const colabId = req.colaborador.id;
    const { id } = req.params;
    const { novo_status } = req.body;

    const statusPermitidos = ['recebido', 'em_lavagem', 'detalhamento', 'finalizado'];
    if (!statusPermitidos.includes(novo_status)) {
      return res.status(400).json({ success: false, message: 'Status inválido.' });
    }

    await client.query('BEGIN');

    // Valida se ele pertence à equipe desse agendamento
    const check = await client.query(
      'SELECT a.status FROM agendamentos a JOIN agendamento_colaboradores ac ON a.id = ac.agendamento_id WHERE a.id = $1 AND ac.colaborador_id = $2',
      [id, colabId]
    );

    if (check.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(403).json({ success: false, message: 'Você não está vinculado a este veículo.' });
    }

    const statusAnterior = check.rows[0].status;

    if (novo_status === 'finalizado' && statusAnterior !== 'finalizado') {
      const agInfo = await client.query(
        'SELECT COALESCE(a.valor_cobrado, s.preco) as valor_servico FROM agendamentos a JOIN servicos s ON s.id = a.servico_id WHERE a.id = $1', 
        [id]
      );
      const valorServico = parseFloat(agInfo.rows[0]?.valor_servico) || 0;
      
      await client.query(
        'UPDATE agendamentos SET status = $1, valor_final = $2, updated_at = NOW() WHERE id = $3', 
        [novo_status, valorServico, id]
      );
    } else {
      // Atualização normal de status
      await client.query('UPDATE agendamentos SET status = $1, updated_at = NOW() WHERE id = $2', [novo_status, id]);
    }

    await client.query(
      "INSERT INTO historico_status (agendamento_id, status_anterior, status_novo) VALUES ($1, $2, $3)",
      [id, statusAnterior, novo_status]
    );

    await client.query('COMMIT');
    res.json({ success: true, message: 'Status atualizado com sucesso!', status: novo_status });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro atualizarStatus Colaborador:', err);
    res.status(500).json({ success: false, message: 'Erro ao atualizar status.' });
  } finally {
    client.release();
  }
};

/**
 * POST /api/colaborador/agendamentos/:id/assumir
 * O colaborador "puxa" um serviço da fila para si.
 */
const assumirServico = async (req, res) => {
  try {
    const colabId = req.colaborador.id;
    const { id } = req.params;

    // Tentar inserir. Como a fila não devia ter ninguém, se der duplicate (pois já inseriram), o banco ignora e podemos checar depois.
    const insertRes = await db.query(
      'INSERT INTO agendamento_colaboradores (agendamento_id, colaborador_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
      [id, colabId]
    );

    if (insertRes.rows.length === 0) {
      // Já pode ter alguém atribuído
      const check = await db.query('SELECT c.nome FROM agendamento_colaboradores ac JOIN colaboradores c ON c.id = ac.colaborador_id WHERE ac.agendamento_id = $1', [id]);
      if (check.rows.length > 0) {
        return res.status(400).json({ success: false, message: `Serviço já assumido por ${check.rows[0].nome}.` });
      }
    }

    res.json({ success: true, message: 'Você assumiu este serviço!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao assumir serviço.' });
  }
};

/**
 * GET /api/colaborador/historico
 * Retorna os extratos dos últimos dias do colaborador.
 */
const getHistorico = async (req, res) => {
  try {
    const colabId = req.colaborador.id;

    // Buscar %
    const resultColab = await db.query('SELECT porcentagem_comissao FROM colaboradores WHERE id = $1', [colabId]);
    let porcentagem = parseFloat(resultColab.rows[0]?.porcentagem_comissao) || 35;

    const query = `
      SELECT 
        TO_CHAR(DATE(a.data_hora), 'DD/MM/YYYY') as data_br,
        DATE(a.data_hora) as data_iso,
        COUNT(a.id) as qtde_servicos,
        COALESCE(SUM(
          COALESCE(a.valor_cobrado, s.preco) / NULLIF((SELECT COUNT(*) FROM agendamento_colaboradores ac2 WHERE ac2.agendamento_id = a.id), 0)
        ), 0) as faturamento_parcial
      FROM agendamento_colaboradores ac
      JOIN agendamentos a ON a.id = ac.agendamento_id
      JOIN servicos s ON s.id = a.servico_id
      WHERE ac.colaborador_id = $1
        AND a.status IN ('finalizado', 'pronto_retirada')
      GROUP BY DATE(a.data_hora)
      ORDER BY DATE(a.data_hora) DESC
      LIMIT 15
    `;
    const hist = await db.query(query, [colabId]);

    const formatado = hist.rows.map(r => {
      const g = parseFloat(r.faturamento_parcial) * (porcentagem / 100);
      return { ...r, ganho: g };
    });

    res.json({ success: true, data: formatado });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao buscar histórico.' });
  }
};

module.exports = { getDashboard, atualizarStatus, assumirServico, getHistorico };
