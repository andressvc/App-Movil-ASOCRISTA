// middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    // Obtener token del header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Acceso denegado. Token requerido.' 
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuario
    const usuario = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!usuario) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token inválido.' 
      });
    }

    if (!usuario.activo) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario desactivado.' 
      });
    }

    // Agregar usuario a la request
    req.usuario = usuario;
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Token inválido.' 
    });
  }
};

module.exports = authMiddleware;