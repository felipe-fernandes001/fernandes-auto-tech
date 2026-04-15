const db = require('../db');

/**
 * GET /api/admin/dashboard
 * KPIs do dia + agendamentos completos + serie 7 dias para o gráfico.
 */
const getDashboard = async (req, res) => {
  try {
    const [kpiHoje, kpiFaturamento, kpiFila, agendamentos, serie7dias] = await Promise.all([

      // 1. Total de agendamentos hoje (não cancelados)
      db.query(`
        SELECT COUNT(a.id) AS agendamentos_hoje
        FROM agendamentos a
        WHERE DATE(a.data_hora) = CURRENT_DATE
          AND a.status != 'cancelado'
      `),

      // 2. Faturamento: APENAS serviços finalizado ou pronto_retirada de hoje
      db.query(`
        SELECT COALESCE(SUM(COALESCE(a.valor_cobrado, s.preco)), 0) AS faturamento_estimado
        FROM agendamentos a
        JOIN servicos s ON s.id = a.servico_id
        WHERE DATE(a.data_hora) = CURRENT_DATE
          AND a.status IN ('finalizado', 'pronto_retirada')
      `),

      // 3. Veículos ainda em andamento (na fila / pátio)
      db.query(`
        SELECT COUNT(id) AS veiculos_na_fila
        FROM agendamentos
        WHERE status NOT IN ('finalizado', 'pronto_retirada', 'cancelado')
      `),

      // 4. Lista completa de agendamentos com joins
      db.query(`
        SELECT
          a.id,
          a.token_cliente,
          a.data_hora,
          a.status,
          a.observacoes,
          a.created_at,
          c.nome        AS cliente_nome,
          c.celular     AS cliente_celular,
          v.modelo      AS veiculo_modelo,
          v.placa       AS veiculo_placa,
          s.nome        AS servico_nome,
          s.preco       AS servico_preco,
          a.valor_cobrado AS valor_cobrado,
          (
            SELECT string_agg(c2.nome, ', ')
            FROM agendamento_colaboradores ac
            JOIN colaboradores c2 ON c2.id = ac.colaborador_id
            WHERE ac.agendamento_id = a.id
          ) AS equipe
        FROM agendamentos a
        JOIN clientes c ON c.id = a.cliente_id
        JOIN veiculos  v ON v.id = a.veiculo_id
        JOIN servicos  s ON s.id = a.servico_id
        ORDER BY a.created_at DESC
        LIMIT 100
      `),

      // 5. Série dos últimos 7 dias (apenas finalizados)
      db.query(`
        SELECT
          TO_CHAR(DATE(a.data_hora), 'DD/MM') AS dia,
          DATE(a.data_hora)                   AS data_iso,
          COALESCE(SUM(COALESCE(a.valor_cobrado, s.preco)), 0) AS total
        FROM agendamentos a
        JOIN servicos s ON s.id = a.servico_id
        WHERE a.data_hora >= CURRENT_DATE - INTERVAL '6 days'
          AND a.status IN ('finalizado', 'pronto_retirada')
        GROUP BY DATE(a.data_hora)
        ORDER BY data_iso ASC
      `),
    ]);

    // Garante todos os 7 dias na série (dias sem faturamento = 0)
    const serieCompleta = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const diaStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      const match  = (serie7dias?.rows || []).find(r => r.dia === diaStr);
      serieCompleta.push({ dia: diaStr, total: match ? parseFloat(match.total) : 0 });
    }

    res.json({
      success: true,
      data: {
        kpi: {
          agendamentos_hoje:    parseInt(kpiHoje?.rows[0]?.agendamentos_hoje || 0),
          faturamento_estimado: parseFloat(kpiFaturamento?.rows[0]?.faturamento_estimado || 0),
          veiculos_na_fila:     parseInt(kpiFila?.rows[0]?.veiculos_na_fila || 0),
        },
        agendamentos: agendamentos?.rows || [],
        grafico7dias: serieCompleta,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao carregar dashboard: ' + err.message });
  }
};

/**
 * PUT /api/admin/agendamentos/:id/concluir
 * Finaliza o serviço (status → finalizado).
 */
const concluirAgendamento = async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;

    const atual = await client.query('SELECT status FROM agendamentos WHERE id = $1', [id]);
    if (atual.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Agendamento não encontrado.' });

    const statusAnterior = atual.rows[0].status;
    await client.query("UPDATE agendamentos SET status = 'finalizado', updated_at = NOW() WHERE id = $1", [id]);
    await client.query(
      `INSERT INTO historico_status (agendamento_id, status_anterior, status_novo) VALUES ($1, $2, 'finalizado')`,
      [id, statusAnterior]
    );

    await client.query('COMMIT');
    res.json({ success: true, message: 'Agendamento concluído!' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao concluir:', err);
    res.status(500).json({ success: false, message: 'Erro ao concluir.' });
  } finally {
    client.release();
  }
};

/**
 * PUT /api/admin/agendamentos/:id/cancelar
 * Cancela o agendamento.
 * IMPORTANTE: execute o ALTER TABLE no banco para habilitar status 'cancelado':
 *   ALTER TABLE agendamentos DROP CONSTRAINT chk_status;
 *   ALTER TABLE agendamentos ADD CONSTRAINT chk_status CHECK (
 *     status IN ('recebido','em_lavagem','detalhamento','finalizado','pronto_retirada','cancelado')
 *   );
 */
const cancelarAgendamento = async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { motivo } = req.body || {};

    const atual = await client.query('SELECT status, observacoes FROM agendamentos WHERE id = $1', [id]);
    if (atual.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Agendamento não encontrado.' });

    const statusAnterior = atual.rows[0].status;
    const obsAtual = atual.rows[0].observacoes || '';
    const novaObs = motivo ? (obsAtual ? `${obsAtual}\n[CANCELADO] Motivo: ${motivo}` : `[CANCELADO] Motivo: ${motivo}`) : obsAtual;

    await client.query("UPDATE agendamentos SET status = 'cancelado', observacoes = $2, updated_at = NOW() WHERE id = $1", [id, novaObs]);
    await client.query(
      `INSERT INTO historico_status (agendamento_id, status_anterior, status_novo) VALUES ($1, $2, 'cancelado')`,
      [id, statusAnterior]
    );

    await client.query('COMMIT');
    res.json({ success: true, message: 'Agendamento cancelado.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao cancelar:', err);
    res.status(500).json({ success: false, message: 'Erro ao cancelar. Lembre de executar o ALTER TABLE para habilitar o status cancelado.' });
  } finally {
    client.release();
  }
};

/**
 * PATCH /api/admin/agendamentos/:id/valor
 * Atualiza o valor cobrado real (usado quando veículo chega sujo).
 */
const atualizarValor = async (req, res) => {
  try {
    const { id } = req.params;
    const { valor_cobrado } = req.body;
    if (valor_cobrado === undefined || isNaN(parseFloat(valor_cobrado))) {
      return res.status(400).json({ success: false, message: 'Valor inválido.' });
    }
    const result = await db.query(
      'UPDATE agendamentos SET valor_cobrado = $1, updated_at = NOW() WHERE id = $2 RETURNING id, valor_cobrado',
      [parseFloat(valor_cobrado), id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Agendamento não encontrado.' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao atualizar valor.' });
  }
};

/**
 * POST /api/admin/agendamentos/manual
 * Cria um agendamento manual (cliente antigo, cadastro no balcão).
 * Body: { nome, celular, modelo_carro, servico_id, data_hora, observacoes, sujeira_extrema }
 */
const criarManual = async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    let { nome, celular, modelo_carro, servico_id, data_hora, observacoes, sujeira_extrema, placa, valor_cobrado } = req.body;

    // Auto-preenchimento para o Check-in Relâmpago (Modo Pátio)
    nome = nome || 'Cliente Avulso';
    celular = celular || '00000000000';
    data_hora = data_hora || new Date().toISOString();

    if (!modelo_carro || !servico_id) {
      return res.status(400).json({ success: false, message: 'Campos obrigatórios: modelo, serviço.' });
    }

    // Upsert cliente
    const clienteRes = await client.query(
      `INSERT INTO clientes (nome, celular) VALUES ($1, $2)
       ON CONFLICT (celular) DO UPDATE SET nome = EXCLUDED.nome
       RETURNING id`,
      [nome.trim(), celular.trim()]
    );
    const cliente_id = clienteRes.rows[0].id;

    // Upsert veículo (Agora vinculando a Placa)
    const veiculoRes = await client.query(
      `INSERT INTO veiculos (cliente_id, modelo, placa) VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING RETURNING id`,
      [cliente_id, modelo_carro.trim(), placa ? placa.trim() : null]
    );
    let veiculo_id;
    if (veiculoRes.rows.length > 0) {
      veiculo_id = veiculoRes.rows[0].id;
    } else {
      // Fallback: se houver conflito (ex: mesmo cliente/modelo s/ placa), busca o que já existe
      const v = await client.query(
        'SELECT id FROM veiculos WHERE cliente_id = $1 AND modelo = $2 LIMIT 1',
        [cliente_id, modelo_carro.trim()]
      );
      veiculo_id = v.rows[0]?.id;
    }

    // Observação extra se sujeira extrema
    const obsExtra = sujeira_extrema ? '[SUJEIRA EXTREMA - avaliar acréscimo] ' : '';
    const obsCompleta = obsExtra + (observacoes || '');

    // Gerar token
    const token = require('crypto').randomBytes(16).toString('hex');

    // Criar agendamento (Status vai direto para em_lavagem e assume valor manual)
    const agRes = await client.query(
      `INSERT INTO agendamentos (cliente_id, veiculo_id, servico_id, data_hora, status, observacoes, token_cliente, valor_cobrado)
       VALUES ($1, $2, $3, $4, 'em_lavagem', $5, $6, $7) RETURNING id, token_cliente`,
      [cliente_id, veiculo_id, parseInt(servico_id), data_hora, obsCompleta.trim() || null, token, valor_cobrado ? parseFloat(valor_cobrado) : null]
    );

    // Salva o pulo de status no histórico
    await client.query(
      `INSERT INTO historico_status (agendamento_id, status_novo) VALUES ($1, 'em_lavagem')`,
      [agRes.rows[0].id]
    );

    await client.query('COMMIT');
    res.status(201).json({ success: true, data: agRes.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar agendamento manual:', err);
    res.status(500).json({ success: false, message: 'Erro ao criar agendamento.' });
  } finally {
    client.release();
  }
};

/**
 * GET /api/admin/configuracoes
 */
const getConfiguracoes = async (req, res) => {
  try {
    const result = await db.query('SELECT chave, valor FROM configuracoes');
    const config = {};
    result.rows.forEach(r => config[r.chave] = r.valor);
    res.json({ success: true, data: config });
  } catch (err) {
    res.json({ success: true, data: {} });
  }
};

/**
 * POST /api/admin/configuracoes
 */
const setConfiguracoes = async (req, res) => {
  try {
    const { chave, valor } = req.body;
    await db.query(`
      INSERT INTO configuracoes (chave, valor) VALUES ($1, $2)
      ON CONFLICT (chave) DO UPDATE SET valor = EXCLUDED.valor, updated_at = NOW()
    `, [chave, valor]);
    res.json({ success: true, message: 'Configuração atualizada' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao salvar config' });
  }
};

/**
 * GET /api/admin/veiculos/busca-placa?placa=XYZ
 * Busca cliente e veículo pela placa (JOIN com clientes).
 */
const buscarPorPlaca = async (req, res) => {
  try {
    const { placa } = req.query;
    if (!placa) return res.status(400).json({ success: false, message: 'Placa não informada.' });
    
    const result = await db.query(
      `SELECT v.id as veiculo_id, v.modelo, v.placa, c.id as cliente_id, c.nome, c.celular 
       FROM veiculos v 
       JOIN clientes c ON c.id = v.cliente_id 
       WHERE v.placa ILIKE $1 LIMIT 1`,
      [`%${placa}%`]
    );
    if (result.rows.length > 0) {
      res.json({ success: true, data: result.rows[0] });
    } else {
      res.json({ success: false, message: 'Veículo não encontrado.' });
    }
  } catch (err) {
    console.error('Erro na busca por placa:', err);
    res.status(500).json({ success: false, message: 'Erro ao buscar placa.' });
  }
};

module.exports = { getDashboard, concluirAgendamento, cancelarAgendamento, atualizarValor, criarManual, getConfiguracoes, setConfiguracoes, buscarPorPlaca };
