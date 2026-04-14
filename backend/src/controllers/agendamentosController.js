const db = require('../db');

const WHATSAPP_NUMERO = process.env.WHATSAPP_NUMERO || '5511999999999';
const FRONTEND_URL    = process.env.FRONTEND_URL    || 'https://fernandes-auto-tech.vercel.app'
const STATUS_LABELS = {
  recebido:        'Recebido',
  em_lavagem:      'Em Lavagem',
  detalhamento:    'Detalhamento',
  finalizado:      'Finalizado',
  pronto_retirada: 'Pronto para Retirada',
};

const STATUS_FLOW = ['recebido', 'em_lavagem', 'detalhamento', 'finalizado', 'pronto_retirada'];

/**
 * POST /api/agendamentos
 * Cria agendamento + cliente (se novo) + veículo.
 * Retorna link de confirmação para WhatsApp.
 */
const criar = async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    let { nome, celular, modelo_carro, servico_id, data_hora, observacoes, cor, placa, busca_veiculo, valor_total, acrescimos, encaixeAdm } = req.body;

    // Validações básicas
    if (!encaixeAdm && (!nome || !celular || !modelo_carro || !servico_id || !data_hora)) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: nome, celular, modelo_carro, servico_id, data_hora',
      });
    }

    if (encaixeAdm) {
      nome = nome || 'Cliente Avulso';
      celular = celular || '00000000000';
      modelo_carro = modelo_carro || 'Veículo Padrão';
      servico_id = servico_id || 3; 
      data_hora = data_hora || new Date().toISOString();
    }

    // Regra de Negócios: Bloqueio de agendamentos aos domingos
    if (!encaixeAdm && data_hora.includes('T')) {
      const [datePart] = data_hora.split('T');
      const [ano, mes, dia] = datePart.split('-');
      const dateObj = new Date(ano, mes - 1, dia);
      if (dateObj.getDay() === 0) {
        return res.status(400).json({
          success: false,
          message: 'Não temos expediente aos domingos. Por favor, escolha outra data.',
        });
      }
    }

    // 1. Busca ou cria cliente
    let clienteResult = await client.query(
      'SELECT id FROM clientes WHERE celular = $1',
      [celular]
    );
    let clienteId;
    if (clienteResult.rows.length > 0) {
      clienteId = clienteResult.rows[0].id;

      // Regra de Negócios: Limitar a 1 agendamento por dia por cliente
      if (!encaixeAdm) {
        const agendamentoExistente = await client.query(
          `SELECT id FROM agendamentos 
           WHERE cliente_id = $1 AND DATE(data_hora) = DATE($2) AND status != 'cancelado'`,
          [clienteId, data_hora]
        );
        if (agendamentoExistente.rows.length > 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({ success: false, message: 'Você já possui um agendamento ativo para esta data. Limite de 1 reserva por dia.' });
        }
      }

      // Atualiza nome se mudou
      if (!encaixeAdm) {
        await client.query('UPDATE clientes SET nome = $1 WHERE id = $2', [nome, clienteId]);
      }
    } else {
      const novoCliente = await client.query(
        'INSERT INTO clientes (nome, celular) VALUES ($1, $2) RETURNING id',
        [nome, celular]
      );
      clienteId = novoCliente.rows[0].id;
    }

    // 2. Cria veículo
    const veiculo = await client.query(
      'INSERT INTO veiculos (cliente_id, modelo, placa, cor) VALUES ($1, $2, $3, $4) RETURNING id',
      [clienteId, modelo_carro, placa || null, cor || null]
    );
    const veiculoId = veiculo.rows[0].id;

    // 3. Busca preço do serviço
    const servico = await client.query('SELECT preco, nome FROM servicos WHERE id = $1', [servico_id]);
    if (servico.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Serviço não encontrado.' });
    }

    // Lógica de Preço (Fallback para o valor do banco se valor_total não vier)
    const precoFinal = valor_total !== undefined && valor_total !== null ? parseFloat(valor_total) : parseFloat(servico.rows[0].preco);

    // Lógica de Acréscimos (Hack Seguro)
    let observacoesFinais = observacoes || '';
    if (acrescimos && Array.isArray(acrescimos) && acrescimos.length > 0) {
      const textoAcrescimos = `➕ Acréscimos: ${acrescimos.join(', ')}`;
      observacoesFinais = observacoesFinais ? `${observacoesFinais}\n${textoAcrescimos}` : textoAcrescimos;
    }

    // 4. Cria agendamento
    const agendamento = await client.query(
      `INSERT INTO agendamentos (cliente_id, veiculo_id, servico_id, data_hora, observacoes, valor_cobrado, busca_veiculo, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, token_cliente, status`,
      [clienteId, veiculoId, servico_id, data_hora, observacoesFinais.trim() || null, precoFinal, busca_veiculo || false, encaixeAdm ? 'em_lavagem' : 'recebido']
    );

    const { id: agendamentoId, token_cliente } = agendamento.rows[0];

    // 5. Registra no histórico de status
    await client.query(
      'INSERT INTO historico_status (agendamento_id, status_novo) VALUES ($1, $2)',
      [agendamentoId, encaixeAdm ? 'em_lavagem' : 'recebido']
    );

    await client.query('COMMIT');

    // 6. Monta link do WhatsApp para o dono (Felipe)
    const linkCliente  = `${FRONTEND_URL}/status/${token_cliente}`;
    
    let dataStr = '';
    let horaStr = '';
    try {
      const [dataPart, horaPart] = data_hora.split('T');
      const [ano, mes, dia] = dataPart.split('-');
      dataStr = `${dia}/${mes}/${ano}`;
      horaStr = horaPart.substring(0, 5);
    } catch(e) {
      dataStr = new Date(data_hora).toLocaleDateString('pt-BR');
      horaStr = new Date(data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }

    const valorStr = precoFinal.toFixed(2).replace('.', ',');

    let veiculoIcon = '🚘';
    const modeloLower = (modelo_carro || '').toLowerCase();
    if (modeloLower.includes('moto')) veiculoIcon = '🏍️';
    else if (modeloLower.includes('suv') || modeloLower.includes('caminhonete')) veiculoIcon = '🛻';
    else if (modeloLower.includes('carro')) veiculoIcon = '🚗';

    let msgBusca = '';
    if (observacoes && observacoes.includes('[BUSCAR VEÍCULO]')) {
      msgBusca = `📍 BUSCA DE VEÍCULO SOLICITADA\nPor favor, envie sua localização abaixo deste texto.\n\n`;
    }

    const mensagem = encodeURIComponent(
      `🧼 FERNANDES AUTO TECH 🧼\n` +
      `Estética Automotiva de Elite\n\n` +
      `✅ AGENDAMENTO CONFIRMADO!\n\n` +
      `👤 Cliente: ${nome}\n` +
      `📱 Celular: ${celular}\n` +
      `${veiculoIcon} Veículo: ${modelo_carro}\n` +
      `📅 Data: ${dataStr}\n` +
      `🕒 Horário: ${horaStr}\n` +
      `💰 Valor: R$ ${valorStr}\n\n` +
      msgBusca +
      `🔗 Acompanhe seu serviço:\n${linkCliente}\n\n` +
      `Avenida Rodoviária - Em frente ao Centro São Francisco`
    );

    const whatsappLink = `https://wa.me/${WHATSAPP_NUMERO}?text=${mensagem}`;

    // Disparo de Webhook / Notificação Automática (Fire and Forget)
    const webhookUrl = process.env.WEBHOOK_URL;
    if (webhookUrl) {
      try {
        let msgBuscaWebhook = busca_veiculo ? '\n📍 *Solicitou buscar o veículo*' : '';
        const textoAcrescimos = acrescimos && acrescimos.length > 0 ? `\n➕ Acréscimos: ${acrescimos.join(', ')}` : '';
        
        const mensagemWebhook = `🆕 *NOVO AGENDAMENTO SITE* 🆕\n\n👤 Cliente: ${nome} (${celular})\n🚗 Veículo: ${modelo_carro}\n🔧 Serviço: ${servico.rows[0].nome}${textoAcrescimos}\n📅 Data: ${dataStr} às ${horaStr}\n💰 Valor Total: R$ ${valorStr}${msgBuscaWebhook}`;
        
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: mensagemWebhook, content: mensagemWebhook }) 
        }).catch(e => console.error('Aviso: Falha ao enviar Webhook de novo agendamento', e.message));
      } catch (e) {
        console.error('Erro na montagem do Webhook:', e);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Agendamento criado com sucesso!',
      data: {
        agendamento_id: agendamentoId,
        token_cliente,
        link_status: linkCliente,
        whatsapp_link: whatsappLink,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar agendamento:', err);
    return res.status(500).json({ success: false, message: 'Erro ao criar agendamento.' });
  } finally {
    client.release();
  }
};

/**
 * GET /api/agendamentos (admin)
 * Lista todos os agendamentos com joins.
 */
const listar = async (req, res) => {
  try {
    const { status, data } = req.query;
    let sql = 'SELECT * FROM v_agendamentos_completos WHERE 1=1';
    const params = [];

    if (status) {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }
    if (data) {
      params.push(data);
      sql += ` AND DATE(data_hora) = $${params.length}`;
    }

    sql += ' ORDER BY data_hora DESC';

    const result = await db.query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao buscar agendamentos.' });
  }
};

/**
 * GET /api/agendamentos/patio (admin)
 * Veículos atualmente no pátio (não finalizados).
 */
const listarPatio = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM v_agendamentos_completos
       WHERE status NOT IN ('finalizado', 'pronto_retirada')
         OR (status IN ('finalizado', 'pronto_retirada') AND DATE(data_hora) = CURRENT_DATE)
       ORDER BY data_hora ASC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro interno.' });
  }
};

/**
 * GET /api/agendamentos/status/:token (público)
 * Dashboard do cliente — busca por token único.
 */
const buscarPorToken = async (req, res) => {
  try {
    const { token } = req.params;
    const result = await db.query(
      'SELECT * FROM v_agendamentos_completos WHERE token_cliente = $1',
      [token]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado. Verifique o link.',
      });
    }

    const agendamento = result.rows[0];

    // Busca checklist de entrada
    const checklist = await db.query(
      'SELECT foto_url, observacao, created_at FROM checklist_entrada WHERE agendamento_id = $1',
      [agendamento.id]
    );

    // Busca histórico de status
    const historico = await db.query(
      `SELECT status_novo AS status, created_at FROM historico_status
       WHERE agendamento_id = $1 ORDER BY created_at ASC`,
      [agendamento.id]
    );

    // Histórico de outros agendamentos do mesmo cliente (por celular)
    const outrosServicos = await db.query(
      `SELECT a.data_hora, a.status, s.nome AS servico, v.modelo AS veiculo
       FROM agendamentos a
       JOIN servicos s ON s.id = a.servico_id
       JOIN veiculos v  ON v.id = a.veiculo_id
       JOIN clientes c  ON c.id = a.cliente_id
       WHERE c.celular = $1 AND a.token_cliente != $2
       ORDER BY a.data_hora DESC LIMIT 5`,
      [agendamento.cliente_celular, token]
    );

    const statusIndex = STATUS_FLOW.indexOf(agendamento.status);

    res.json({
      success: true,
      data: {
        ...agendamento,
        status_index:    statusIndex,
        status_flow:     STATUS_FLOW,
        status_labels:   STATUS_LABELS,
        checklist:       checklist.rows,
        historico_status: historico.rows,
        outros_servicos: outrosServicos.rows,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro interno.' });
  }
};

/**
 * PUT /api/agendamentos/:id/status (admin)
 * Muda o status do agendamento e registra no histórico.
 */
const atualizarStatus = async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { status } = req.body;

    if (!STATUS_FLOW.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status inválido. Valores aceitos: ${STATUS_FLOW.join(', ')}`,
      });
    }

    const atual = await client.query(
      'SELECT status FROM agendamentos WHERE id = $1',
      [id]
    );
    if (atual.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Agendamento não encontrado.' });
    }

    const statusAnterior = atual.rows[0].status;

    await client.query(
      'UPDATE agendamentos SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, id]
    );

    await client.query(
      `INSERT INTO historico_status (agendamento_id, status_anterior, status_novo)
       VALUES ($1, $2, $3)`,
      [id, statusAnterior, status]
    );

    await client.query('COMMIT');

    // Busca dados completos para retornar
    const updated = await db.query(
      'SELECT * FROM v_agendamentos_completos WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: `Status atualizado para "${STATUS_LABELS[status]}"`,
      data: updated.rows[0],
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar status:', err);
    res.status(500).json({ success: false, message: 'Erro ao atualizar status.' });
  } finally {
    client.release();
  }
};

/**
 * POST /api/agendamentos/:id/checklist (admin)
 * Adiciona item ao checklist de entrada.
 */
const adicionarChecklist = async (req, res) => {
  try {
    const { id } = req.params;
    const { observacao } = req.body;
    const foto_url = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await db.query(
      'INSERT INTO checklist_entrada (agendamento_id, foto_url, observacao) VALUES ($1, $2, $3) RETURNING *',
      [id, foto_url, observacao || null]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro interno.' });
  }
};

/**
 * GET /api/agendamentos/horarios-ocupados?data=YYYY-MM-DD
 * Retorna os horários já reservados para a data.
 */
const horariosOcupados = async (req, res) => {
  try {
    const { data } = req.query;
    if (!data) return res.status(400).json({ success: false, message: 'Data não informada.' });

    const result = await db.query(
      `SELECT TO_CHAR(data_hora, 'HH24:MI') as hora 
       FROM agendamentos 
       WHERE DATE(data_hora) = $1 AND status != 'cancelado'`,
      [data]
    );
    const ocupados = result.rows.map(r => r.hora);
    res.json({ success: true, data: ocupados });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro interno.' });
  }
};

/**
 * POST /api/agendamentos/cliente/:token/cancelar
 * Permite ao cliente cancelar se o status for 'recebido'
 */
const clienteCancelar = async (req, res) => {
  try {
    const { token } = req.params;
    const { motivo } = req.body;
    const result = await db.query('SELECT id, status, observacoes FROM agendamentos WHERE token_cliente = $1', [token]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Agendamento não encontrado.' });
    
    const ag = result.rows[0];
    if (ag.status !== 'recebido') {
      return res.status(400).json({ success: false, message: 'Só é possível cancelar agendamentos que ainda não foram iniciados pela equipe.' });
    }

    const novaObs = motivo ? `${ag.observacoes || ''}\n[CANCELADO PELO CLIENTE] Motivo: ${motivo}`.trim() : `${ag.observacoes || ''}\n[CANCELADO PELO CLIENTE]`.trim();

    await db.query("UPDATE agendamentos SET status = 'cancelado', observacoes = $2, cancelamento_motivo = $3, updated_at = NOW() WHERE id = $1", [ag.id, novaObs, motivo || null]);
    await db.query("INSERT INTO historico_status (agendamento_id, status_anterior, status_novo) VALUES ($1, $2, $3)", [ag.id, ag.status, 'cancelado']);

    res.json({ success: true, message: 'Agendamento cancelado com sucesso.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro interno.' });
  }
};

/**
 * POST /api/agendamentos/cliente/:token/remarcar
 * Permite ao cliente remarcar a data/hora se o status for 'recebido'
 */
const clienteRemarcar = async (req, res) => {
  try {
    const { token } = req.params;
    const { data_hora } = req.body;

    const result = await db.query(
      `SELECT a.id, a.status, a.data_hora AS data_antiga, c.nome AS cliente_nome, c.celular, v.modelo AS veiculo_modelo, s.nome AS servico_nome
       FROM agendamentos a
       JOIN clientes c ON c.id = a.cliente_id
       JOIN veiculos v ON v.id = a.veiculo_id
       JOIN servicos s ON s.id = a.servico_id
       WHERE a.token_cliente = $1`,
      [token]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Agendamento não encontrado.' });
    
    const ag = result.rows[0];
    if (ag.status !== 'recebido') {
      return res.status(400).json({ success: false, message: 'Só é possível remarcar agendamentos que ainda não foram iniciados.' });
    }

    await db.query("UPDATE agendamentos SET data_hora = $1, updated_at = NOW() WHERE id = $2", [data_hora, ag.id]);

    // Disparo de Webhook / Notificação Automática (Fire and Forget)
    const webhookUrl = process.env.WEBHOOK_URL;
    if (webhookUrl) {
      try {
        const dataAntigaFormatada = new Date(ag.data_antiga).toLocaleString('pt-BR');
        const dataNovaFormatada = new Date(data_hora).toLocaleString('pt-BR');
        const mensagem = `🔄 *REMARCAÇÃO PELO SITE* 🔄\n\n👤 Cliente: ${ag.cliente_nome} (${ag.celular})\n🚗 Veículo: ${ag.veiculo_modelo}\n🔧 Serviço: ${ag.servico_nome}\n\n❌ Data Anterior: ${dataAntigaFormatada}\n✅ Nova Data: ${dataNovaFormatada}`;
        
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: mensagem, content: mensagem }) 
        }).catch(e => console.error('Aviso: Falha ao enviar Webhook de remarcação', e.message));
      } catch (e) {
        console.error('Erro na montagem do Webhook:', e);
      }
    }

    res.json({ success: true, message: 'Agendamento remarcado com sucesso.' });
  } catch (err) {
    console.error('Erro ao remarcar agendamento pelo cliente:', err);
    res.status(500).json({ success: false, message: 'Erro interno.' });
  }
};

/**
 * GET /api/agendamentos/telefone?celular=...
 * Retorna a lista de agendamentos associados a um celular.
 */
const buscarPorCelular = async (req, res) => {
  try {
    const { celular } = req.query;
    if (!celular) return res.status(400).json({ success: false, message: 'Celular não informado.' });

    const result = await db.query(
      `SELECT a.id, a.data_hora, a.status, a.token_cliente, v.modelo AS veiculo_modelo, s.nome AS servico_nome
       FROM agendamentos a
       JOIN clientes c ON c.id = a.cliente_id
       JOIN veiculos v ON v.id = a.veiculo_id
       JOIN servicos s ON s.id = a.servico_id
       WHERE c.celular = $1
       ORDER BY a.data_hora DESC LIMIT 10`,
      [celular]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Erro ao buscar por celular:', err);
    res.status(500).json({ success: false, message: 'Erro ao buscar agendamentos.' });
  }
};

/**
 * PATCH /api/agendamentos/cancelar-cliente
 * Cancela se pertencer ao celular e o status for 'recebido' (pendente).
 */
const cancelarPorCliente = async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const { id, celular } = req.body;

    const check = await client.query(
      `SELECT a.id, a.status, a.data_hora, c.nome AS cliente_nome, v.modelo AS veiculo_modelo, s.nome AS servico_nome
       FROM agendamentos a
       JOIN clientes c ON c.id = a.cliente_id
       JOIN veiculos v ON v.id = a.veiculo_id
       JOIN servicos s ON s.id = a.servico_id
       WHERE a.id = $1 AND c.celular = $2`,
      [id, celular]
    );

    if (check.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Agendamento não encontrado para este celular.' });
    }

    const ag = check.rows[0];
    if (!['recebido', 'agendado', 'pendente'].includes(ag.status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Só é possível cancelar agendamentos que ainda não foram iniciados pela equipe.' });
    }

    await client.query("UPDATE agendamentos SET status = 'cancelado', updated_at = NOW() WHERE id = $1", [id]);
    await client.query(
      "INSERT INTO historico_status (agendamento_id, status_anterior, status_novo) VALUES ($1, $2, $3)",
      [id, ag.status, 'cancelado']
    );

    await client.query('COMMIT');

    // Disparo de Webhook / Notificação Automática (Fire and Forget)
    const webhookUrl = process.env.WEBHOOK_URL;
    if (webhookUrl) {
      try {
        const dataFormatada = new Date(ag.data_hora).toLocaleString('pt-BR');
        const mensagem = `🚨 *CANCELAMENTO PELO SITE* 🚨\n\n👤 Cliente: ${ag.cliente_nome} (${celular})\n🚗 Veículo: ${ag.veiculo_modelo}\n🔧 Serviço: ${ag.servico_nome}\n📅 Data: ${dataFormatada}\n\n_A vaga acabou de ser liberada no sistema._`;
        
        // Usando fetch nativo (Node 18+). As chaves text/content cobrem integrações como Slack, Discord ou Make/Zapier.
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: mensagem, content: mensagem }) 
        }).catch(e => console.error('Aviso: Falha ao enviar Webhook de cancelamento', e.message));
      } catch (e) {
        console.error('Erro na montagem do Webhook:', e);
      }
    }

    res.json({ success: true, message: 'Agendamento cancelado com sucesso.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao cancelar agendamento pelo cliente:', err);
    res.status(500).json({ success: false, message: 'Erro ao cancelar.' });
  } finally {
    client.release();
  }
};

module.exports = {
  criar,
  listar,
  listarPatio,
  buscarPorToken,
  atualizarStatus,
  adicionarChecklist,
  horariosOcupados,
  clienteCancelar,
  clienteRemarcar,
  buscarPorCelular,
  cancelarPorCliente
};
