const jwt = require('jsonwebtoken');
const db = require('../db');

/**
 * Middleware de autenticação para Colaboradores.
 */
const authColaborador = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token não fornecido.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'colaborador') {
      return res.status(403).json({ success: false, message: 'Acesso restrito a colaboradores.' });
    }

    // Verifica rápido no banco se o colaborador ainda está ativo
    // "Corte de Acesso: Se eu desativar o colaborador [...], o acesso dele deve cair na hora."
    const result = await db.query('SELECT ativo FROM colaboradores WHERE id = $1', [decoded.id]);
    if (result.rows.length === 0 || !result.rows[0].ativo) {
      return res.status(403).json({ success: false, message: 'Conta de colaborador desativada.' });
    }

    req.colaborador = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Token inválido ou expirado.' });
  }
};

module.exports = authColaborador;
