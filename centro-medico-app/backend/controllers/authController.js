// controllers/authController.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { Op } = require('sequelize');
const { logBitacora } = require('../utils/bitacora');

// Generar JWT
const generarJWT = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '24h'
  });
};

// REQ7 - Inicio de sesión seguro
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos requeridos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    // Buscar usuario
    const usuario = await User.findOne({ 
      where: { email: email.toLowerCase() }
    });

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar si el usuario está activo
    if (!usuario.activo) {
      return res.status(401).json({
        success: false,
        message: 'Usuario desactivado'
      });
    }

    // Verificar contraseña
    const passwordValida = await usuario.verificarPassword(password);
    if (!passwordValida) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Actualizar último acceso
    await usuario.update({ ultimo_acceso: new Date() });

    // Generar token
    const token = generarJWT(usuario.id);

    // Respuesta exitosa
    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        token,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
          ultimo_acceso: usuario.ultimo_acceso
        }
      }
    });

    // Bitácora (no bloquear en caso de error)
    try {
      await logBitacora({ usuario: { id: usuario.id } }, {
        accion: 'login',
        descripcion: 'Inicio de sesión exitoso',
        entidad: 'usuario',
        entidad_id: usuario.id
      });
    } catch (_) {}

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener perfil del usuario autenticado
const perfil = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        usuario: req.usuario
      }
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// REQ4 - Cambiar contraseña
const cambiarPassword = async (req, res) => {
  try {
    const { passwordActual, passwordNueva } = req.body;

    if (!passwordActual || !passwordNueva) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña actual y nueva son requeridas'
      });
    }

    // Buscar usuario con contraseña
    const usuario = await User.findByPk(req.usuario.id);

    // Verificar contraseña actual
    const passwordValida = await usuario.verificarPassword(passwordActual);
    if (!passwordValida) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }

    // Actualizar contraseña
    await usuario.update({ password: passwordNueva });

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar perfil de usuario
const actualizarPerfil = async (req, res) => {
  try {
    const { nombre, email } = req.body;
    const usuarioId = req.usuario.id;

    // Validar campos requeridos
    if (!nombre || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y email son requeridos'
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'El formato del email no es válido'
      });
    }

    // Verificar si el email ya existe en otro usuario
    const emailExistente = await User.findOne({
      where: {
        email: email.toLowerCase(),
        id: { [Op.ne]: usuarioId }
      }
    });

    if (emailExistente) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está en uso por otro usuario'
      });
    }

    // Actualizar usuario
    const usuario = await User.findByPk(usuarioId);
    await usuario.update({
      nombre: nombre.trim(),
      email: email.toLowerCase().trim()
    });

    // Obtener usuario actualizado
    const usuarioActualizado = await User.findByPk(usuarioId, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        usuario: usuarioActualizado
      }
    });

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  login,
  perfil,
  cambiarPassword,
  actualizarPerfil
};