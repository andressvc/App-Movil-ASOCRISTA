// controllers/bitacoraController.js
const { Bitacora, User } = require('../models');

// Crear entrada de bitácora
const crearEntrada = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const { accion, descripcion, entidad, entidad_id, metadata } = req.body;

    if (!accion) {
      return res.status(400).json({ success: false, message: 'La acción es requerida' });
    }

    const entrada = await Bitacora.create({
      usuario_id,
      accion,
      descripcion: descripcion || null,
      entidad: entidad || null,
      entidad_id: entidad_id || null,
      metadata: metadata || null
    });

    res.status(201).json({ success: true, data: { entrada } });
  } catch (error) {
    console.error('Error al crear entrada de bitácora:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Listar entradas (propias) con filtros básicos
const listarEntradas = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const { page = 1, limit = 20, accion, entidad } = req.query;
    const offset = (page - 1) * limit;

    const where = { usuario_id };
    if (accion) where.accion = accion;
    if (entidad) where.entidad = entidad;

    const { count, rows } = await Bitacora.findAndCountAll({
      where,
      include: [{ model: User, as: 'usuario', attributes: ['id', 'nombre', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        entradas: rows,
        paginacion: {
          total: count,
          pagina: parseInt(page),
          limite: parseInt(limit),
          totalPaginas: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error al listar bitácora:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

module.exports = { crearEntrada, listarEntradas };


