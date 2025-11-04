// services/cronService.js
const cron = require('node-cron');
const { Reporte, Cita, Paciente, MovimientoFinanciero, User } = require('../models');
const { DEFAULT_TZ, getYesterdayISO } = require('../utils/dateUtils');
const { Op } = require('sequelize');
const reporteController = require('../controllers/reporteController');
const notificationService = require('./notificationService');

class CronService {
  constructor() {
    this.tareas = new Map();
  }

  // Inicializar todas las tareas programadas
  iniciar() {
    console.log('Iniciando tareas programadas...');

    // Envío de recordatorios de citas (diariamente a las 18:00)
    this.programarRecordatorios();
    
    // Generación automática de reportes diarios (diariamente a las 23:00)
    this.programarGeneracionReportes();
    
    // Limpieza de archivos antiguos (diariamente a las 02:00)
    this.programarLimpiezaArchivos();

    console.log('Tareas programadas iniciadas correctamente');
  }


  // Programar envío de recordatorios de citas
  programarRecordatorios() {
    const tarea = cron.schedule('0 18 * * *', async () => {
      try {
        console.log('🔔 Iniciando envío de recordatorios de citas...');
        
        const resultado = await notificationService.enviarRecordatoriosCitas();
        
        if (resultado.success) {
          console.log(`✅ Recordatorios enviados: ${resultado.enviados}/${resultado.total}`);
        } else {
          console.error(`❌ Error en envío de recordatorios: ${resultado.message}`);
        }
        
      } catch (error) {
        console.error('Error en envío de recordatorios:', error);
      }
    }, {
      scheduled: true,
      timezone: "America/Mexico_City"
    });

    this.tareas.set('recordatorios', tarea);
    console.log('Envío de recordatorios programado para las 18:00');
  }

  // Programar generación automática de reportes diarios
  programarGeneracionReportes() {
    const tarea = cron.schedule('0 23 * * *', async () => {
      try {
        console.log('📊 Iniciando generación automática de reporte diario...');
        
        // Obtener fecha de ayer en TZ consistente
        const fechaAyer = getYesterdayISO(DEFAULT_TZ);
        
        // Verificar si ya existe un reporte para esa fecha
        const reporteExistente = await Reporte.findOne({
          where: { fecha: fechaAyer }
        });
        
        if (reporteExistente) {
          console.log(`Reporte para ${fechaAyer} ya existe, saltando generación`);
          return;
        }
        
        // Generar reporte para la fecha anterior por cada usuario activo
        const usuarios = await User.findAll({ where: { activo: true } });
        for (const usuario of usuarios) {
          const req = {
            params: { fecha: fechaAyer },
            usuario: { id: usuario.id }
          };
          const res = {
            status: (code) => ({
              json: (data) => {
                if (code === 201 || code === 200) {
                  console.log(`✅ Reporte diario generado para usuario ${usuario.id} en ${fechaAyer}`);
                } else {
                  console.error(`❌ Error al generar reporte para usuario ${usuario.id}: ${data && data.message}`);
                }
              }
            })
          };
          try {
            await reporteController.generarReporteDiario(req, res);
          } catch (e) {
            console.error(`Error generando reporte para usuario ${usuario.id}:`, e.message);
          }
        }
        
      } catch (error) {
        console.error('Error en generación automática de reportes:', error);
      }
    }, {
      scheduled: true,
      timezone: "America/Mexico_City"
    });

    this.tareas.set('generacionReportes', tarea);
    console.log('Generación automática de reportes programada para las 23:00');
  }

  // Programar limpieza de archivos antiguos
  programarLimpiezaArchivos() {
    const tarea = cron.schedule('0 2 * * *', async () => {
      try {
        console.log('🧹 Iniciando limpieza de archivos antiguos...');
        
        // Eliminar reportes más antiguos de 30 días
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - 30);
        
        const reportesEliminados = await Reporte.destroy({
          where: {
            fecha: {
              [require('sequelize').Op.lt]: fechaLimite
            }
          }
        });

        console.log(`Eliminados ${reportesEliminados} reportes antiguos`);
        console.log('Limpieza de archivos completada');

      } catch (error) {
        console.error('Error en limpieza de archivos:', error);
      }
    }, {
      scheduled: true,
      timezone: "America/Mexico_City"
    });

    this.tareas.set('limpiezaArchivos', tarea);
    console.log('Limpieza de archivos programada para las 02:00');
  }

  // Detener todas las tareas
  detener() {
    console.log('Deteniendo tareas programadas...');
    
    this.tareas.forEach((tarea, nombre) => {
      tarea.destroy();
      console.log(`Tarea ${nombre} detenida`);
    });
    
    this.tareas.clear();
    console.log('Todas las tareas han sido detenidas');
  }

  // Obtener estado de las tareas
  obtenerEstado() {
    const estado = {};
    this.tareas.forEach((tarea, nombre) => {
      estado[nombre] = {
        activa: tarea.running,
        proximaEjecucion: tarea.nextDate ? tarea.nextDate().toISOString() : null
      };
    });
    return estado;
  }
}

module.exports = new CronService();