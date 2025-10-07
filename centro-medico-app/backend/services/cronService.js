// services/cronService.js
const cron = require('node-cron');
const { Reporte } = require('../models');

class CronService {
  constructor() {
    this.tareas = new Map();
  }

  // Inicializar todas las tareas programadas
  iniciar() {
    console.log('Iniciando tareas programadas...');

    // Solo limpieza de archivos antiguos (diariamente a las 02:00)
    this.programarLimpiezaArchivos();

    console.log('Tareas programadas iniciadas correctamente');
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