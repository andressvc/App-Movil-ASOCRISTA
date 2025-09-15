// services/cronService.js
const cron = require('node-cron');
const { Reporte, User } = require('../models');
// const emailService = require('./emailService'); // Temporalmente deshabilitado
const { generarReporteDiario } = require('../controllers/reporteController');

class CronService {
  constructor() {
    this.tareas = new Map();
  }

  // Inicializar todas las tareas programadas
  iniciar() {
    console.log('🕐 Iniciando tareas programadas...');

    // Tarea 1: Generar y enviar reporte diario a las 18:00
    this.programarReporteDiario();

    // Tarea 2: Enviar recordatorios de citas cada hora
    this.programarRecordatoriosCitas();

    // Tarea 3: Limpieza de archivos antiguos (diariamente a las 02:00)
    this.programarLimpiezaArchivos();

    console.log('✅ Tareas programadas iniciadas correctamente');
  }

  // Programar generación y envío de reporte diario
  programarReporteDiario() {
    const tarea = cron.schedule('0 18 * * *', async () => {
      try {
        console.log('📊 Iniciando generación de reporte diario...');
        
        const fecha = new Date().toISOString().split('T')[0];
        
        // Obtener todos los usuarios activos
        const usuarios = await User.findAll({
          where: { activo: true }
        });

        for (const usuario of usuarios) {
          try {
            // Simular request para el usuario
            const req = {
              usuario: { id: usuario.id },
              params: { fecha }
            };

            const res = {
              json: (data) => {
                if (data.success && data.data.reporte) {
                  this.enviarReporteAutomatico(data.data.reporte, data.data.datos, usuario);
                }
              },
              status: (code) => ({
                json: (data) => console.error('Error en generación de reporte:', data)
              })
            };

            await generarReporteDiario(req, res);

          } catch (error) {
            console.error(`Error generando reporte para usuario ${usuario.id}:`, error);
          }
        }

        console.log('✅ Reporte diario generado y enviado para todos los usuarios');
      } catch (error) {
        console.error('❌ Error en tarea de reporte diario:', error);
      }
    }, {
      scheduled: false,
      timezone: "America/Mexico_City"
    });

    this.tareas.set('reporteDiario', tarea);
    tarea.start();
    console.log('📅 Reporte diario programado para las 18:00');
  }

  // Enviar reporte automático al propietario
  async enviarReporteAutomatico(reporte, datos, usuario) {
    try {
      // Obtener destinatarios del propietario
      const destinatarios = await this.obtenerDestinatariosPropietario();
      
      if (destinatarios.length === 0) {
        console.log('⚠️ No hay destinatarios configurados para el propietario');
        return;
      }

      // Enviar reporte por email
      // await emailService.enviarReporteDiario(reporte, datos, destinatarios); // Temporalmente deshabilitado

      // Marcar reporte como enviado
      await reporte.update({
        enviado_propietario: true,
        fecha_envio: new Date()
      });

      console.log(`✅ Reporte enviado al propietario para usuario ${usuario.id}`);

    } catch (error) {
      console.error('❌ Error enviando reporte automático:', error);
    }
  }

  // Obtener destinatarios del propietario
  async obtenerDestinatariosPropietario() {
    // Por ahora, usar variables de entorno
    // En el futuro, esto podría venir de una configuración en la base de datos
    const destinatarios = [];
    
    if (process.env.PROPIETARIO_EMAIL) {
      destinatarios.push(process.env.PROPIETARIO_EMAIL);
    }

    if (process.env.PROPIETARIO_EMAIL_2) {
      destinatarios.push(process.env.PROPIETARIO_EMAIL_2);
    }

    return destinatarios;
  }

  // Programar recordatorios de citas
  programarRecordatoriosCitas() {
    const tarea = cron.schedule('0 * * * *', async () => {
      try {
        console.log('🔔 Verificando recordatorios de citas...');
        
        const ahora = new Date();
        const proximaHora = new Date(ahora.getTime() + 60 * 60 * 1000);
        
        // Aquí implementarías la lógica para enviar recordatorios
        // Por ahora solo logueamos
        console.log('📅 Verificando citas para recordatorios...');
        
      } catch (error) {
        console.error('❌ Error en recordatorios de citas:', error);
      }
    }, {
      scheduled: false,
      timezone: "America/Mexico_City"
    });

    this.tareas.set('recordatoriosCitas', tarea);
    tarea.start();
    console.log('🔔 Recordatorios de citas programados cada hora');
  }

  // Programar limpieza de archivos antiguos
  programarLimpiezaArchivos() {
    const tarea = cron.schedule('0 2 * * *', async () => {
      try {
        console.log('🧹 Iniciando limpieza de archivos antiguos...');
        
        const fs = require('fs').promises;
        const path = require('path');
        
        const reportesDir = path.join(__dirname, '../reportes');
        
        try {
          const archivos = await fs.readdir(reportesDir);
          const ahora = new Date();
          const hace30Dias = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);
          
          let archivosEliminados = 0;
          
          for (const archivo of archivos) {
            const rutaArchivo = path.join(reportesDir, archivo);
            const stats = await fs.stat(rutaArchivo);
            
            if (stats.mtime < hace30Dias) {
              await fs.unlink(rutaArchivo);
              archivosEliminados++;
            }
          }
          
          console.log(`✅ Limpieza completada: ${archivosEliminados} archivos eliminados`);
          
        } catch (error) {
          if (error.code !== 'ENOENT') {
            throw error;
          }
          console.log('📁 Directorio de reportes no existe, creándolo...');
          await fs.mkdir(reportesDir, { recursive: true });
        }
        
      } catch (error) {
        console.error('❌ Error en limpieza de archivos:', error);
      }
    }, {
      scheduled: false,
      timezone: "America/Mexico_City"
    });

    this.tareas.set('limpiezaArchivos', tarea);
    tarea.start();
    console.log('🧹 Limpieza de archivos programada para las 02:00');
  }

  // Detener todas las tareas
  detener() {
    console.log('🛑 Deteniendo tareas programadas...');
    
    for (const [nombre, tarea] of this.tareas) {
      tarea.stop();
      console.log(`⏹️ Tarea ${nombre} detenida`);
    }
    
    this.tareas.clear();
    console.log('✅ Todas las tareas han sido detenidas');
  }

  // Obtener estado de las tareas
  obtenerEstado() {
    const estado = {};
    
    for (const [nombre, tarea] of this.tareas) {
      estado[nombre] = {
        activa: tarea.running,
        proximaEjecucion: tarea.nextDate()
      };
    }
    
    return estado;
  }
}

module.exports = new CronService();
