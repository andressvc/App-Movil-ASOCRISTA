// controllers/citaController.js
const { Cita, Paciente, User } = require('../models');
const { Op } = require('sequelize');
const { logBitacora } = require('../utils/bitacora');

// REQ2 - Crear nueva cita/evento
const crearCita = async (req, res) => {
  try {
    const {
      paciente_id,
      tipo,
      titulo,
      descripcion,
      fecha,
      hora_inicio,
      hora_fin,
      notas
    } = req.body;

    // Validar campos requeridos
    if (!paciente_id || !tipo || !titulo || !fecha || !hora_inicio || !hora_fin) {
      return res.status(400).json({
        success: false,
        message: 'Paciente, tipo, título, fecha, hora inicio y hora fin son requeridos'
      });
    }

    // Verificar que el paciente existe y pertenece al usuario
    const paciente = await Paciente.findOne({
      where: { id: paciente_id, activo: true, usuario_id: req.usuario.id }
    });

    if (!paciente) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    // Verificar conflictos de horario (solo para citas del mismo usuario)
    const citaConflicto = await Cita.findOne({
      where: {
        fecha,
        usuario_id: req.usuario.id,
        estado: { [Op.not]: 'cancelada' },
        [Op.or]: [
          {
            hora_inicio: { [Op.between]: [hora_inicio, hora_fin] }
          },
          {
            hora_fin: { [Op.between]: [hora_inicio, hora_fin] }
          },
          {
            [Op.and]: [
              { hora_inicio: { [Op.lte]: hora_inicio } },
              { hora_fin: { [Op.gte]: hora_fin } }
            ]
          }
        ]
      }
    });

    if (citaConflicto) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una cita en ese horario'
      });
    }

    // Crear cita
    const cita = await Cita.create({
      paciente_id,
      usuario_id: req.usuario.id,
      tipo,
      titulo: titulo.trim(),
      descripcion,
      fecha,
      hora_inicio,
      hora_fin,
      notas
    });

    // Obtener la cita con datos del paciente
    const citaCompleta = await Cita.findOne({
      where: { id: cita.id, usuario_id: req.usuario.id },
      include: [
        {
          model: Paciente,
          as: 'paciente',
          attributes: ['id', 'codigo', 'nombre', 'apellido', 'telefono']
        },
        {
          model: User,
          as: 'usuario',
          attributes: ['id', 'nombre', 'rol']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Cita creada exitosamente',
      data: { cita: citaCompleta }
    });

    // Bitácora
    logBitacora(req, {
      accion: 'cita_creada',
      descripcion: `Cita creada (${tipo}) para paciente ${paciente_id} el ${fecha} ${hora_inicio}-${hora_fin}`,
      entidad: 'cita',
      entidad_id: cita.id,
      metadata: { paciente_id, fecha, hora_inicio, hora_fin, tipo }
    });

  } catch (error) {
    console.error('Error al crear cita:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// REQ2 - Obtener citas con filtros
const obtenerCitas = async (req, res) => {
  try {
    const { fecha, estado, tipo, paciente_id, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Construir condiciones de filtro
    let whereCondition = { usuario_id: req.usuario.id };
    
    if (fecha) {
      whereCondition.fecha = fecha;
    }
    
    if (estado) {
      whereCondition.estado = estado;
    }
    
    if (tipo) {
      whereCondition.tipo = tipo;
    }
    
    if (paciente_id) {
      whereCondition.paciente_id = paciente_id;
    }

    const { count, rows } = await Cita.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Paciente,
          as: 'paciente',
          attributes: ['id', 'codigo', 'nombre', 'apellido', 'telefono'],
          where: { activo: true },
          required: false
        },
        {
          model: User,
          as: 'usuario',
          attributes: ['id', 'nombre', 'rol'],
          required: false
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['fecha', 'ASC'], ['hora_inicio', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        citas: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// REQ2 - Obtener cita individual por ID
const obtenerCita = async (req, res) => {
  try {
    const { id } = req.params;

    const cita = await Cita.findOne({
      where: { id, usuario_id: req.usuario.id },
      include: [
        {
          model: Paciente,
          as: 'paciente',
          attributes: ['id', 'codigo', 'nombre', 'apellido', 'telefono'],
          required: false // Permite devolver la cita aunque el paciente no exista o esté inactivo
        },
        {
          model: User,
          as: 'usuario',
          attributes: ['id', 'nombre', 'rol'],
          required: false // Permite devolver la cita aunque el usuario no exista
        }
      ]
    });

    if (!cita) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    res.json({
      success: true,
      data: { cita }
    });

  } catch (error) {
    console.error('Error al obtener cita:', error);
    console.error('Error detalles:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// REQ2 - Obtener citas del día
const obtenerCitasDelDia = async (req, res) => {
  try {
    const { fecha } = req.params;
    
    const citas = await Cita.findAll({
      where: { fecha, usuario_id: req.usuario.id },
      include: [
        {
          model: Paciente,
          as: 'paciente',
          attributes: ['id', 'codigo', 'nombre', 'apellido', 'telefono'],
          where: { activo: true },
          required: false
        },
        {
          model: User,
          as: 'usuario',
          attributes: ['id', 'nombre'],
          required: false
        }
      ],
      order: [['hora_inicio', 'ASC']]
    });

    res.json({
      success: true,
      data: { 
        fecha,
        citas,
        total: citas.length
      }
    });

  } catch (error) {
    console.error('Error al obtener citas del día:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// REQ2 - Actualizar cita
const actualizarCita = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizacion = req.body;

    const cita = await Cita.findOne({
      where: { id, usuario_id: req.usuario.id }
    });

    if (!cita) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    // Si se cambia fecha/hora, verificar conflictos
    if (datosActualizacion.fecha || datosActualizacion.hora_inicio || datosActualizacion.hora_fin) {
      const fecha = datosActualizacion.fecha || cita.fecha;
      const hora_inicio = datosActualizacion.hora_inicio || cita.hora_inicio;
      const hora_fin = datosActualizacion.hora_fin || cita.hora_fin;

      const citaConflicto = await Cita.findOne({
        where: {
          id: { [Op.not]: id },
          fecha,
          usuario_id: req.usuario.id,
          estado: { [Op.not]: 'cancelada' },
          [Op.or]: [
            {
              hora_inicio: { [Op.between]: [hora_inicio, hora_fin] }
            },
            {
              hora_fin: { [Op.between]: [hora_inicio, hora_fin] }
            },
            {
              [Op.and]: [
                { hora_inicio: { [Op.lte]: hora_inicio } },
                { hora_fin: { [Op.gte]: hora_fin } }
              ]
            }
          ]
        }
      });

      if (citaConflicto) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe una cita en ese horario'
        });
      }
    }

    await cita.update(datosActualizacion);

    // Obtener cita actualizada con relaciones
    const citaActualizada = await Cita.findOne({
      where: { id, usuario_id: req.usuario.id },
      include: [
        {
          model: Paciente,
          as: 'paciente',
          attributes: ['id', 'codigo', 'nombre', 'apellido', 'telefono']
        },
        {
          model: User,
          as: 'usuario',
          attributes: ['id', 'nombre']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Cita actualizada exitosamente',
      data: { cita: citaActualizada }
    });

    // Bitácora
    logBitacora(req, {
      accion: 'cita_actualizada',
      descripcion: `Cita ${id} actualizada`,
      entidad: 'cita',
      entidad_id: id,
      metadata: datosActualizacion
    });

  } catch (error) {
    console.error('Error al actualizar cita:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// REQ2 - Cambiar estado de cita
const cambiarEstadoCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, notas } = req.body;

    const estadosValidos = ['programada', 'en_proceso', 'completada', 'cancelada', 'no_asistio'];
    
    if (!estado || !estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: `Estado inválido. Estados válidos: ${estadosValidos.join(', ')}`
      });
    }

    const cita = await Cita.findOne({
      where: { id, usuario_id: req.usuario.id }
    });

    if (!cita) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    await cita.update({ 
      estado,
      notas: notas || cita.notas
    });

    res.json({
      success: true,
      message: `Cita marcada como ${estado}`,
      data: { cita }
    });

    // Bitácora
    logBitacora(req, {
      accion: 'cita_estado',
      descripcion: `Cita ${id} estado -> ${estado}`,
      entidad: 'cita',
      entidad_id: id,
      metadata: { estado }
    });

  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// REQ2 - Eliminar cita
const eliminarCita = async (req, res) => {
  try {
    const { id } = req.params;

    const cita = await Cita.findOne({
      where: { id, usuario_id: req.usuario.id }
    });

    if (!cita) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    await cita.destroy();

    res.json({
      success: true,
      message: 'Cita eliminada exitosamente'
    });

    // Bitácora
    logBitacora(req, {
      accion: 'cita_eliminada',
      descripcion: `Cita ${id} eliminada`,
      entidad: 'cita',
      entidad_id: id
    });

  } catch (error) {
    console.error('Error al eliminar cita:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  crearCita,
  obtenerCitas,
  obtenerCita,
  obtenerCitasDelDia,
  actualizarCita,
  cambiarEstadoCita,
  eliminarCita
};