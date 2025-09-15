// controllers/dashboardController.js
const { Paciente, Cita, MovimientoFinanciero, User } = require('../models');
const { Op } = require('sequelize');

// REQ9 - Obtener resumen del dashboard
const obtenerResumen = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const hoy = new Date().toISOString().split('T')[0];

    // Obtener datos del día actual
    const [
      totalPacientes,
      citasHoy,
      movimientosHoy,
      citasProximas,
      ultimosMovimientos
    ] = await Promise.all([
      // Total de pacientes activos
      Paciente.count({
        where: { activo: true }
      }),

      // Citas del día actual
      Cita.findAll({
        where: { fecha: hoy },
        include: [{
          model: Paciente,
          as: 'paciente',
          attributes: ['id', 'nombre', 'apellido', 'telefono']
        }],
        order: [['hora_inicio', 'ASC']]
      }),

      // Movimientos financieros del día
      MovimientoFinanciero.findAll({
        where: { fecha: hoy, usuario_id },
        order: [['createdAt', 'DESC']],
        limit: 10
      }),

      // Próximas citas (próximos 7 días)
      Cita.findAll({
        where: {
          fecha: {
            [Op.between]: [hoy, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]]
          },
          estado: { [Op.not]: 'cancelada' }
        },
        include: [{
          model: Paciente,
          as: 'paciente',
          attributes: ['id', 'nombre', 'apellido']
        }],
        order: [['fecha', 'ASC'], ['hora_inicio', 'ASC']],
        limit: 10
      }),

      // Últimos movimientos financieros
      MovimientoFinanciero.findAll({
        where: { usuario_id },
        order: [['createdAt', 'DESC']],
        limit: 5,
        include: [{
          model: Paciente,
          as: 'paciente',
          attributes: ['id', 'nombre', 'apellido']
        }]
      })
    ]);

    // Calcular estadísticas del día
    const estadisticasHoy = {
      totalCitas: citasHoy.length,
      citasCompletadas: citasHoy.filter(c => c.estado === 'completada').length,
      citasCanceladas: citasHoy.filter(c => c.estado === 'cancelada').length,
      citasEnProceso: citasHoy.filter(c => c.estado === 'en_proceso').length,
      citasProgramadas: citasHoy.filter(c => c.estado === 'programada').length
    };

    // Calcular balance del día
    const totalIngresos = movimientosHoy
      .filter(m => m.tipo === 'ingreso')
      .reduce((sum, m) => sum + parseFloat(m.monto), 0);

    const totalEgresos = movimientosHoy
      .filter(m => m.tipo === 'egreso')
      .reduce((sum, m) => sum + parseFloat(m.monto), 0);

    const balanceDiario = totalIngresos - totalEgresos;

    // Obtener estadísticas de la semana
    const inicioSemana = new Date();
    inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
    const finSemana = new Date(inicioSemana);
    finSemana.setDate(finSemana.getDate() + 6);

    const [citasSemana, movimientosSemana] = await Promise.all([
      Cita.count({
        where: {
          fecha: {
            [Op.between]: [
              inicioSemana.toISOString().split('T')[0],
              finSemana.toISOString().split('T')[0]
            ]
          }
        }
      }),
      MovimientoFinanciero.findAll({
        where: {
          fecha: {
            [Op.between]: [
              inicioSemana.toISOString().split('T')[0],
              finSemana.toISOString().split('T')[0]
            ]
          },
          usuario_id
        }
      })
    ]);

    const balanceSemanal = movimientosSemana
      .filter(m => m.tipo === 'ingreso')
      .reduce((sum, m) => sum + parseFloat(m.monto), 0) -
      movimientosSemana
        .filter(m => m.tipo === 'egreso')
        .reduce((sum, m) => sum + parseFloat(m.monto), 0);

    // Obtener alertas y notificaciones
    const alertas = await generarAlertas(citasHoy, citasProximas, movimientosHoy);

    res.json({
      success: true,
      data: {
        resumen: {
          totalPacientes,
          estadisticasHoy,
          balanceDiario,
          totalIngresos,
          totalEgresos,
          citasSemana,
          balanceSemanal
        },
        citasHoy,
        citasProximas,
        ultimosMovimientos,
        alertas
      }
    });

  } catch (error) {
    console.error('Error al obtener resumen del dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Función para generar alertas
const generarAlertas = async (citasHoy, citasProximas, movimientosHoy) => {
  const alertas = [];

  // Alerta de citas próximas (próximas 2 horas)
  const ahora = new Date();
  const proximas2Horas = new Date(ahora.getTime() + 2 * 60 * 60 * 1000);
  
  const citasProximas2Horas = citasProximas.filter(cita => {
    const fechaHoraCita = new Date(`${cita.fecha}T${cita.hora_inicio}`);
    return fechaHoraCita >= ahora && fechaHoraCita <= proximas2Horas;
  });

  if (citasProximas2Horas.length > 0) {
    alertas.push({
      tipo: 'info',
      titulo: 'Citas Próximas',
      mensaje: `Tienes ${citasProximas2Horas.length} cita(s) en las próximas 2 horas`,
      datos: citasProximas2Horas
    });
  }

  // Alerta de citas sin completar
  const citasSinCompletar = citasHoy.filter(cita => 
    ['programada', 'en_proceso'].includes(cita.estado)
  );

  if (citasSinCompletar.length > 0) {
    alertas.push({
      tipo: 'warning',
      titulo: 'Citas Pendientes',
      mensaje: `Hay ${citasSinCompletar.length} cita(s) pendientes de completar hoy`,
      datos: citasSinCompletar
    });
  }

  // Alerta de balance negativo
  const totalIngresos = movimientosHoy
    .filter(m => m.tipo === 'ingreso')
    .reduce((sum, m) => sum + parseFloat(m.monto), 0);

  const totalEgresos = movimientosHoy
    .filter(m => m.tipo === 'egreso')
    .reduce((sum, m) => sum + parseFloat(m.monto), 0);

  const balance = totalIngresos - totalEgresos;

  if (balance < 0) {
    alertas.push({
      tipo: 'error',
      titulo: 'Balance Negativo',
      mensaje: `El balance del día es negativo: $${balance.toFixed(2)}`,
      datos: { balance }
    });
  }

  return alertas;
};

// Obtener estadísticas por período
const obtenerEstadisticas = async (req, res) => {
  try {
    const { periodo } = req.query; // 'dia', 'semana', 'mes'
    const usuario_id = req.usuario.id;

    let fechaInicio, fechaFin;
    const hoy = new Date();

    switch (periodo) {
      case 'dia':
        fechaInicio = fechaFin = hoy.toISOString().split('T')[0];
        break;
      case 'semana':
        fechaInicio = new Date(hoy);
        fechaInicio.setDate(hoy.getDate() - hoy.getDay());
        fechaFin = new Date(fechaInicio);
        fechaFin.setDate(fechaInicio.getDate() + 6);
        fechaInicio = fechaInicio.toISOString().split('T')[0];
        fechaFin = fechaFin.toISOString().split('T')[0];
        break;
      case 'mes':
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
        fechaFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0];
        break;
      default:
        fechaInicio = fechaFin = hoy.toISOString().split('T')[0];
    }

    const [citas, movimientos] = await Promise.all([
      Cita.findAll({
        where: {
          fecha: {
            [Op.between]: [fechaInicio, fechaFin]
          }
        },
        include: [{
          model: Paciente,
          as: 'paciente',
          attributes: ['id', 'nombre', 'apellido']
        }]
      }),
      MovimientoFinanciero.findAll({
        where: {
          fecha: {
            [Op.between]: [fechaInicio, fechaFin]
          },
          usuario_id
        }
      })
    ]);

    // Calcular estadísticas
    const estadisticas = {
      periodo,
      fechaInicio,
      fechaFin,
      totalCitas: citas.length,
      citasCompletadas: citas.filter(c => c.estado === 'completada').length,
      citasCanceladas: citas.filter(c => c.estado === 'cancelada').length,
      citasEnProceso: citas.filter(c => c.estado === 'en_proceso').length,
      totalIngresos: movimientos
        .filter(m => m.tipo === 'ingreso')
        .reduce((sum, m) => sum + parseFloat(m.monto), 0),
      totalEgresos: movimientos
        .filter(m => m.tipo === 'egreso')
        .reduce((sum, m) => sum + parseFloat(m.monto), 0)
    };

    estadisticas.balance = estadisticas.totalIngresos - estadisticas.totalEgresos;

    res.json({
      success: true,
      data: { estadisticas, citas, movimientos }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  obtenerResumen,
  obtenerEstadisticas
};
