const passport = require('passport');
const { verifyToken } = require('../config/jwt');
const User = require('../models/User');

const authenticateJWT = passport.authenticate('jwt', { session: false });

const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Token de acceso requerido'
      });
    }
    
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Usuario no autorizado'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Token inválido o expirado'
    });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Acceso denegado: se requieren permisos de administrador'
    });
  }
  next();
};

module.exports = {
  authenticateJWT,
  requireAuth,
  requireAdmin
};
