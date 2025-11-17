// middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    // Verificar que JWT_SECRET esté configurado
    if (!process.env.JWT_SECRET) {
      console.error('ERROR CRÍTICO: JWT_SECRET no está configurado en las variables de entorno');
      return res.status(500).json({ 
        success: false, 
        message: 'Error de configuración del servidor' 
      });
    }

    // Obtener token del header o query string (para móvil)
    let token = req.header('Authorization')?.replace('Bearer ', '');
    
    // Si no está en header, intentar en query string (útil para móvil)
    if (!token && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Acceso denegado. Token requerido.' 
      });
    }

    // Verificar token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Token expirado. Por favor, inicia sesión nuevamente.' 
        });
      }
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Token inválido.' 
        });
      }
      throw jwtError;
    }
    
    // Buscar usuario
    const usuario = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!usuario) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario no encontrado.' 
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
    console.error('Error stack:', error.stack);
    res.status(401).json({ 
      success: false, 
      message: 'Error de autenticación. Por favor, inicia sesión nuevamente.' 
    });
  }
};

module.exports = authMiddleware;