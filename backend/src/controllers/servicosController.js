const db = require('../db');

/**
 * GET /api/servicos
 * Retorna todos os serviços ativos.
 */
const listarServicos = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, nome, descricao, preco, duracao_minutos, categoria, icone FROM servicos WHERE ativo = TRUE ORDER BY preco ASC'
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Erro ao listar serviços:', err);
    res.status(500).json({ success: false, message: 'Erro ao buscar serviços.' });
  }
};

/**
 * GET /api/servicos/:id
 */
const buscarServico = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM servicos WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Serviço não encontrado.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Erro ao buscar serviço:', err);
    res.status(500).json({ success: false, message: 'Erro interno.' });
  }
};

/**
 * PUT /api/servicos/:id (admin)
 * Atualiza preço, descrição, categoria ou ícone.
 */
const atualizarServico = async (req, res) => {
  try {
    const { id } = req.params;
    const { preco, descricao, duracao_minutos, categoria, icone, nome } = req.body;
    const result = await db.query(
      `UPDATE servicos SET
         nome = COALESCE($1, nome),
         preco = COALESCE($2, preco),
         descricao = COALESCE($3, descricao),
         duracao_minutos = COALESCE($4, duracao_minutos),
         categoria = COALESCE($5, categoria),
         icone = COALESCE($6, icone)
       WHERE id = $7 RETURNING *`,
      [nome, preco, descricao, duracao_minutos, categoria, icone, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Serviço não encontrado.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Erro ao atualizar serviço:', err);
    res.status(500).json({ success: false, message: 'Erro interno.' });
  }
};

/**
 * POST /api/servicos (admin)
 * Cria um novo serviço.
 */
const criarServico = async (req, res) => {
  try {
    const { nome, descricao, preco, duracao_minutos, categoria = 'carro', icone = '🚗' } = req.body;
    if (!nome || !preco) {
      return res.status(400).json({ success: false, message: 'Nome e preço são obrigatórios.' });
    }
    const result = await db.query(
      `INSERT INTO servicos (nome, descricao, preco, duracao_minutos, categoria, icone, ativo)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE) RETURNING *`,
      [nome.trim(), descricao?.trim() || '', parseFloat(preco), parseInt(duracao_minutos) || 60, categoria, icone]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Erro ao criar serviço:', err);
    res.status(500).json({ success: false, message: 'Erro ao criar serviço.' });
  }
};

/**
 * DELETE /api/servicos/:id (admin)
 * Soft-delete: marca o serviço como inativo.
 */
const excluirServico = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'UPDATE servicos SET ativo = FALSE WHERE id = $1 RETURNING id, nome',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Serviço não encontrado.' });
    }
    res.json({ success: true, message: `Serviço "${result.rows[0].nome}" removido.` });
  } catch (err) {
    console.error('Erro ao excluir serviço:', err);
    res.status(500).json({ success: false, message: 'Erro ao excluir serviço.' });
  }
};

module.exports = { listarServicos, buscarServico, atualizarServico, criarServico, excluirServico };
