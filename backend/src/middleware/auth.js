const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticação JWT.
 * Protege rotas administrativas.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticação não fornecido.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Token inválido ou expirado.',
    });
  }
};

module.exports = authMiddleware;
