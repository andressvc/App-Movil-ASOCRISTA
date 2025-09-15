// controllers/pacienteController.js
const { Paciente, User } = require('../models');
const { Op } = require('sequelize');

// REQ1 - Registrar nuevo paciente
const crearPaciente = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      fecha_nacimiento,
      edad,
      telefono,
      direccion,
      contacto_emergencia,
      telefono_emergencia,
      historial_medico
    } = req.body;

    // Validar campos requeridos
    if (!nombre || !apellido) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y apellido son requeridos'
      });
    }

    // Generar código automáticamente
    const ultimoPaciente = await Paciente.findOne({
      order: [['id', 'DESC']],
      attributes: ['id']
    });
    
    const numeroSiguiente = ultimoPaciente ? ultimoPaciente.id + 1 : 1;
    const codigo = `P${numeroSiguiente.toString().padStart(4, '0')}`;

    // Crear paciente
    const paciente = await Paciente.create({
      codigo,
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      fecha_nacimiento,
      edad,
      telefono,
      direccion,
      contacto_emergencia,
      telefono_emergencia,
      historial_medico
    });

    res.status(201).json({
      success: true,
      message: 'Paciente registrado exitosamente',
      data: { paciente }
    });

  } catch (error) {
    console.error('Error al crear paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// REQ1 - Obtener todos los pacientes
const obtenerPacientes = async (req, res) => {
  try {
    const { page = 1, limit = 10, buscar } = req.query;
    const offset = (page - 1) * limit;

    // Construir condiciones de búsqueda
    let whereCondition = { activo: true };
    
    if (buscar) {
      whereCondition = {
        ...whereCondition,
        [Op.or]: [
          { nombre: { [Op.like]: `%${buscar}%` } },
          { apellido: { [Op.like]: `%${buscar}%` } },
          { codigo: { [Op.like]: `%${buscar}%` } }
        ]
      };
    }

    const { count, rows } = await Paciente.findAndCountAll({
      where: whereCondition,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        pacientes: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener pacientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// REQ1 - Obtener paciente por ID
const obtenerPacientePorId = async (req, res) => {
  try {
    const { id } = req.params;

    const paciente = await Paciente.findOne({
      where: { id, activo: true }
    });

    if (!paciente) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    res.json({
      success: true,
      data: { paciente }
    });

  } catch (error) {
    console.error('Error al obtener paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// REQ1 - Actualizar paciente
const actualizarPaciente = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizacion = req.body;

    const paciente = await Paciente.findOne({
      where: { id, activo: true }
    });

    if (!paciente) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    // Limpiar datos
    if (datosActualizacion.nombre) {
      datosActualizacion.nombre = datosActualizacion.nombre.trim();
    }
    if (datosActualizacion.apellido) {
      datosActualizacion.apellido = datosActualizacion.apellido.trim();
    }

    await paciente.update(datosActualizacion);

    res.json({
      success: true,
      message: 'Paciente actualizado exitosamente',
      data: { paciente }
    });

  } catch (error) {
    console.error('Error al actualizar paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// REQ1 - Eliminar paciente (soft delete)
const eliminarPaciente = async (req, res) => {
  try {
    const { id } = req.params;

    const paciente = await Paciente.findOne({
      where: { id, activo: true }
    });

    if (!paciente) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    await paciente.update({ activo: false });

    res.json({
      success: true,
      message: 'Paciente eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// REQ1 - Buscar pacientes por código o nombre
const buscarPacientes = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'El término de búsqueda debe tener al menos 2 caracteres'
      });
    }

    const pacientes = await Paciente.findAll({
      where: {
        activo: true,
        [Op.or]: [
          { nombre: { [Op.like]: `%${q}%` } },
          { apellido: { [Op.like]: `%${q}%` } },
          { codigo: { [Op.like]: `%${q}%` } }
        ]
      },
      limit: 10,
      order: [['nombre', 'ASC']]
    });

    res.json({
      success: true,
      data: { pacientes }
    });

  } catch (error) {
    console.error('Error en búsqueda:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  crearPaciente,
  obtenerPacientes,
  obtenerPacientePorId,
  actualizarPaciente,
  eliminarPaciente,
  buscarPacientes
};