const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * POST /api/auth/login
 * Login do administrador (Felipe).
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios.',
      });
    }

    // Verifica credenciais via .env (MVP simples sem tabela de usuários)
    const adminEmail    = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (email !== adminEmail) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas.',
      });
    }

    const passwordMatch = password === adminPassword;
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas.',
      });
    }

    const token = jwt.sign(
      { email: adminEmail, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.json({
      success: true,
      token,
      admin: { email: adminEmail, nome: 'Felipe', role: 'admin' },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
  }
};

/**
 * GET /api/auth/verify
 * Verifica se o token JWT é válido.
 */
const verify = (req, res) => {
  res.json({
    success: true,
    admin: req.admin,
  });
};

/**
 * POST /api/auth/colaborador/login
 * Login usando nome e código de acesso.
 */
const db = require('../db');
const loginColaborador = async (req, res) => {
  try {
    const { nome, codigo_acesso } = req.body;
    if (!nome || !codigo_acesso) {
      return res.status(400).json({ success: false, message: 'Nome e código são obrigatórios.' });
    }

    const result = await db.query(
      'SELECT id, nome, cargo, ativo FROM colaboradores WHERE nome ILIKE $1 AND codigo_acesso = $2',
      [String(nome).trim(), String(codigo_acesso).trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas ou código incorreto.' });
    }

    const colab = result.rows[0];
    if (!colab.ativo) {
      return res.status(403).json({ success: false, message: 'Colaborador inativo.' });
    }

    const token = jwt.sign(
      { id: colab.id, nome: colab.nome, role: 'colaborador' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ success: true, token, colaborador: colab });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro interno: ' + err.message });
  }
};

module.exports = { login, verify, loginColaborador };
