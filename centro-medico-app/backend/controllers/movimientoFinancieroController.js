// controllers/movimientoFinancieroController.js
const { MovimientoFinanciero, Paciente, Cita } = require('../models');
const { Op } = require('sequelize');

// REQ3 - Crear movimiento financiero
const crearMovimiento = async (req, res) => {
  try {
    const { tipo, categoria, descripcion, monto, fecha, paciente_id, cita_id, metodo_pago, comprobante } = req.body;
    const usuario_id = req.usuario.id;

    // Validar campos requeridos
    if (!tipo || !categoria || !descripcion || !monto || !fecha) {
      return res.status(400).json({
        success: false,
        message: 'Tipo, categoría, descripción, monto y fecha son requeridos'
      });
    }

    // Validar tipo
    if (!['ingreso', 'egreso'].includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: 'El tipo debe ser "ingreso" o "egreso"'
      });
    }

    // Validar monto
    if (monto <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El monto debe ser mayor a 0'
      });
    }

    // Validar método de pago si se proporciona
    const metodosValidos = ['efectivo', 'tarjeta', 'transferencia', 'cheque', 'deposito'];
    if (metodo_pago && !metodosValidos.includes(metodo_pago)) {
      return res.status(400).json({
        success: false,
        message: 'Método de pago no válido'
      });
    }

    // Crear movimiento
    const movimiento = await MovimientoFinanciero.create({
      usuario_id,
      tipo,
      categoria,
      descripcion,
      monto,
      fecha,
      paciente_id: paciente_id || null,
      cita_id: cita_id || null,
      metodo_pago: metodo_pago || null,
      comprobante: comprobante || null
    });

    // Obtener el movimiento con relaciones
    const movimientoCompleto = await MovimientoFinanciero.findByPk(movimiento.id, {
      include: [
        {
          model: Paciente,
          as: 'paciente',
          attributes: ['id', 'nombre', 'apellido']
        },
        {
          model: Cita,
          as: 'cita',
          attributes: ['id', 'fecha', 'hora']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Movimiento financiero creado exitosamente',
      data: movimientoCompleto
    });

  } catch (error) {
    console.error('Error al crear movimiento financiero:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// REQ3 - Listar movimientos financieros
const listarMovimientos = async (req, res) => {
  try {
    const { fecha, tipo, categoria, page = 1, limit = 10 } = req.query;
    const usuario_id = req.usuario.id;

    // Construir filtros
    const filtros = { usuario_id };
    
    if (fecha) {
      filtros.fecha = fecha;
    }
    
    if (tipo) {
      filtros.tipo = tipo;
    }
    
    if (categoria) {
      filtros.categoria = { [Op.like]: `%${categoria}%` };
    }

    // Calcular offset para paginación
    const offset = (page - 1) * limit;

    // Obtener movimientos con paginación
    const { count, rows: movimientos } = await MovimientoFinanciero.findAndCountAll({
      where: filtros,
      include: [
        {
          model: Paciente,
          as: 'paciente',
          attributes: ['id', 'nombre', 'apellido']
        },
        {
          model: Cita,
          as: 'cita',
          attributes: ['id', 'fecha', 'hora']
        }
      ],
      order: [['fecha', 'DESC'], ['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        movimientos,
        paginacion: {
          total: count,
          pagina: parseInt(page),
          limite: parseInt(limit),
          totalPaginas: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error al listar movimientos financieros:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// REQ3 - Obtener balance diario
const obtenerBalanceDiario = async (req, res) => {
  try {
    const { fecha } = req.params;
    const usuario_id = req.usuario.id;

    // Validar fecha
    if (!fecha) {
      return res.status(400).json({
        success: false,
        message: 'La fecha es requerida'
      });
    }

    // Obtener movimientos del día
    const movimientos = await MovimientoFinanciero.findAll({
      where: {
        usuario_id,
        fecha: fecha
      }
    });

    // Calcular totales
    const totalIngresos = movimientos
      .filter(m => m.tipo === 'ingreso')
      .reduce((sum, m) => sum + parseFloat(m.monto), 0);

    const totalEgresos = movimientos
      .filter(m => m.tipo === 'egreso')
      .reduce((sum, m) => sum + parseFloat(m.monto), 0);

    const balance = totalIngresos - totalEgresos;

    res.json({
      success: true,
      data: {
        fecha,
        totalIngresos,
        totalEgresos,
        balance,
        cantidadMovimientos: movimientos.length,
        movimientos: movimientos.map(m => ({
          id: m.id,
          tipo: m.tipo,
          categoria: m.categoria,
          descripcion: m.descripcion,
          monto: m.monto,
          metodo_pago: m.metodo_pago,
          createdAt: m.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('Error al obtener balance diario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// REQ3 - Obtener historial financiero
const obtenerHistorial = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, tipo, categoria } = req.query;
    const usuario_id = req.usuario.id;

    // Construir filtros
    const filtros = { usuario_id };
    
    if (fechaInicio && fechaFin) {
      filtros.fecha = {
        [Op.between]: [fechaInicio, fechaFin]
      };
    } else if (fechaInicio) {
      filtros.fecha = { [Op.gte]: fechaInicio };
    } else if (fechaFin) {
      filtros.fecha = { [Op.lte]: fechaFin };
    }
    
    if (tipo) {
      filtros.tipo = tipo;
    }
    
    if (categoria) {
      filtros.categoria = { [Op.like]: `%${categoria}%` };
    }

    // Obtener movimientos
    const movimientos = await MovimientoFinanciero.findAll({
      where: filtros,
      include: [
        {
          model: Paciente,
          as: 'paciente',
          attributes: ['id', 'nombre', 'apellido']
        },
        {
          model: Cita,
          as: 'cita',
          attributes: ['id', 'fecha', 'hora']
        }
      ],
      order: [['fecha', 'DESC'], ['createdAt', 'DESC']]
    });

    // Calcular resumen
    const totalIngresos = movimientos
      .filter(m => m.tipo === 'ingreso')
      .reduce((sum, m) => sum + parseFloat(m.monto), 0);

    const totalEgresos = movimientos
      .filter(m => m.tipo === 'egreso')
      .reduce((sum, m) => sum + parseFloat(m.monto), 0);

    const balance = totalIngresos - totalEgresos;

    res.json({
      success: true,
      data: {
        resumen: {
          totalIngresos,
          totalEgresos,
          balance,
          cantidadMovimientos: movimientos.length
        },
        movimientos
      }
    });

  } catch (error) {
    console.error('Error al obtener historial financiero:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener movimiento por ID
const obtenerMovimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.usuario.id;

    const movimiento = await MovimientoFinanciero.findOne({
      where: { id, usuario_id },
      include: [
        {
          model: Paciente,
          as: 'paciente',
          attributes: ['id', 'nombre', 'apellido']
        },
        {
          model: Cita,
          as: 'cita',
          attributes: ['id', 'fecha', 'hora']
        }
      ]
    });

    if (!movimiento) {
      return res.status(404).json({
        success: false,
        message: 'Movimiento financiero no encontrado'
      });
    }

    res.json({
      success: true,
      data: movimiento
    });

  } catch (error) {
    console.error('Error al obtener movimiento financiero:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar movimiento
const actualizarMovimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.usuario.id;
    const { tipo, categoria, descripcion, monto, fecha, paciente_id, cita_id, metodo_pago, comprobante } = req.body;

    const movimiento = await MovimientoFinanciero.findOne({
      where: { id, usuario_id }
    });

    if (!movimiento) {
      return res.status(404).json({
        success: false,
        message: 'Movimiento financiero no encontrado'
      });
    }

    // Validar método de pago si se proporciona
    const metodosValidos = ['efectivo', 'tarjeta', 'transferencia', 'cheque', 'deposito'];
    if (metodo_pago && !metodosValidos.includes(metodo_pago)) {
      return res.status(400).json({
        success: false,
        message: 'Método de pago no válido'
      });
    }

    // Actualizar movimiento
    await movimiento.update({
      tipo: tipo || movimiento.tipo,
      categoria: categoria || movimiento.categoria,
      descripcion: descripcion || movimiento.descripcion,
      monto: monto || movimiento.monto,
      fecha: fecha || movimiento.fecha,
      paciente_id: paciente_id !== undefined ? paciente_id : movimiento.paciente_id,
      cita_id: cita_id !== undefined ? cita_id : movimiento.cita_id,
      metodo_pago: metodo_pago || movimiento.metodo_pago,
      comprobante: comprobante || movimiento.comprobante
    });

    res.json({
      success: true,
      message: 'Movimiento financiero actualizado exitosamente',
      data: movimiento
    });

  } catch (error) {
    console.error('Error al actualizar movimiento financiero:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar movimiento
const eliminarMovimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.usuario.id;

    const movimiento = await MovimientoFinanciero.findOne({
      where: { id, usuario_id }
    });

    if (!movimiento) {
      return res.status(404).json({
        success: false,
        message: 'Movimiento financiero no encontrado'
      });
    }

    await movimiento.destroy();

    res.json({
      success: true,
      message: 'Movimiento financiero eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar movimiento financiero:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  crearMovimiento,
  listarMovimientos,
  obtenerBalanceDiario,
  obtenerHistorial,
  obtenerMovimiento,
  actualizarMovimiento,
  eliminarMovimiento
};
