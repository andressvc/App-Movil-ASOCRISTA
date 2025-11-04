// services/notificationService.js
const { Cita, Paciente } = require('../models');
const { Op } = require('sequelize');
const emailService = require('./emailService');

class NotificationService {
  constructor() {
    this.enabled = true;
  }

  // Enviar recordatorios de citas
  async enviarRecordatoriosCitas() {
    try {
      if (!this.enabled) {
        console.log('Servicio de notificaciones deshabilitado');
        return;
      }

      console.log('🔔 Enviando recordatorios de citas...');

      // Obtener citas del día siguiente que no han recibido recordatorio
      const { DEFAULT_TZ, getTomorrowISO } = require('../utils/dateUtils');
      const fechaManana = getTomorrowISO(DEFAULT_TZ);

      const citasParaRecordatorio = await Cita.findAll({
        where: {
          fecha: fechaManana,
          estado: 'programada',
          recordatorio_enviado: false
        },
        include: [
          {
            model: Paciente,
            as: 'paciente',
            attributes: ['id', 'nombre', 'apellido', 'telefono', 'email']
          }
        ]
      });

      console.log(`Encontradas ${citasParaRecordatorio.length} citas para recordatorio`);

      let recordatoriosEnviados = 0;

      for (const cita of citasParaRecordatorio) {
        try {
          // Simular envío de notificación push
          await this.enviarNotificacionPush(cita);
          
          // Simular envío de SMS si tiene teléfono
          if (cita.paciente.telefono) {
            await this.enviarSMS(cita);
          }

          // Enviar email si tiene email
          if (cita.paciente.email) {
            await this.enviarEmailRecordatorio(cita);
          }

          // Marcar recordatorio como enviado
          await cita.update({ recordatorio_enviado: true });
          recordatoriosEnviados++;

        } catch (error) {
          console.error(`Error enviando recordatorio para cita ${cita.id}:`, error.message);
        }
      }

      console.log(`✅ Recordatorios enviados: ${recordatoriosEnviados}/${citasParaRecordatorio.length}`);

      return {
        success: true,
        total: citasParaRecordatorio.length,
        enviados: recordatoriosEnviados
      };

    } catch (error) {
      console.error('Error en envío de recordatorios:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Simular envío de notificación push
  async enviarNotificacionPush(cita) {
    // En una implementación real, aquí se usaría Firebase Cloud Messaging o similar
    console.log(`📱 Notificación push enviada para cita ${cita.id}: ${cita.titulo} - ${cita.hora_inicio}`);
    
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      success: true,
      type: 'push',
      cita_id: cita.id
    };
  }

  // Simular envío de SMS
  async enviarSMS(cita) {
    // En una implementación real, aquí se usaría Twilio o similar
    const mensaje = `Recordatorio: Tienes una cita mañana a las ${cita.hora_inicio} - ${cita.titulo}. Centro Médico ASOCRISTA`;
    
    console.log(`📱 SMS enviado a ${cita.paciente.telefono}: ${mensaje}`);
    
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 150));
    
    return {
      success: true,
      type: 'sms',
      telefono: cita.paciente.telefono,
      mensaje
    };
  }

  // Enviar email de recordatorio
  async enviarEmailRecordatorio(cita) {
    try {
      const paciente = cita.paciente;
      const fechaFormateada = new Date(cita.fecha).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const mailOptions = {
        from: process.env.SMTP_USER || 'noreply@asocrista.com',
        to: paciente.email,
        subject: `Recordatorio de Cita - Centro Médico ASOCRISTA`,
        html: this.generarHTMLEmailRecordatorio(cita, fechaFormateada)
      };

      // En una implementación real, se usaría el emailService
      console.log(`📧 Email de recordatorio enviado a ${paciente.email}`);
      
      // Simular delay de envío
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return {
        success: true,
        type: 'email',
        email: paciente.email
      };

    } catch (error) {
      console.error('Error enviando email de recordatorio:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generar HTML para email de recordatorio
  generarHTMLEmailRecordatorio(cita, fechaFormateada) {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Recordatorio de Cita</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 20px;
                  background-color: #f5f5f5;
              }
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background: white;
                  padding: 30px;
                  border-radius: 10px;
                  box-shadow: 0 0 10px rgba(0,0,0,0.1);
              }
              .header {
                  text-align: center;
                  border-bottom: 3px solid #007bff;
                  padding-bottom: 20px;
                  margin-bottom: 30px;
              }
              .header h1 {
                  color: #007bff;
                  margin: 0;
                  font-size: 24px;
              }
              .cita-info {
                  background: #f8f9fa;
                  padding: 20px;
                  border-radius: 8px;
                  margin-bottom: 20px;
                  border-left: 4px solid #007bff;
              }
              .cita-detail {
                  margin-bottom: 10px;
                  font-size: 16px;
              }
              .cita-detail strong {
                  color: #333;
                  margin-right: 10px;
              }
              .footer {
                  text-align: center;
                  margin-top: 30px;
                  padding-top: 20px;
                  border-top: 1px solid #ddd;
                  color: #666;
                  font-size: 12px;
              }
              .important {
                  background: #fff3cd;
                  border: 1px solid #ffeaa7;
                  padding: 15px;
                  border-radius: 5px;
                  margin: 20px 0;
                  color: #856404;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Recordatorio de Cita</h1>
                  <p>Centro Médico ASOCRISTA</p>
              </div>

              <div class="cita-info">
                  <div class="cita-detail">
                      <strong>Paciente:</strong> ${cita.paciente.nombre} ${cita.paciente.apellido}
                  </div>
                  <div class="cita-detail">
                      <strong>Fecha:</strong> ${fechaFormateada}
                  </div>
                  <div class="cita-detail">
                      <strong>Hora:</strong> ${cita.hora_inicio} - ${cita.hora_fin}
                  </div>
                  <div class="cita-detail">
                      <strong>Tipo:</strong> ${cita.tipo.replace('_', ' ').toUpperCase()}
                  </div>
                  <div class="cita-detail">
                      <strong>Descripción:</strong> ${cita.titulo}
                  </div>
                  ${cita.descripcion ? `<div class="cita-detail"><strong>Detalles:</strong> ${cita.descripcion}</div>` : ''}
              </div>

              <div class="important">
                  <strong>Importante:</strong> Por favor llegue 10 minutos antes de su cita. Si necesita reprogramar, contacte con anticipación.
              </div>

              <div class="footer">
                  <p>Este es un recordatorio automático del Centro Médico ASOCRISTA</p>
                  <p>Si tiene alguna pregunta, no dude en contactarnos</p>
                  <p>Teléfono: (555) 123-4567 | Email: info@asocrista.com</p>
              </div>
          </div>
      </body>
      </html>
    `;
  }

  // Habilitar/deshabilitar notificaciones
  habilitar() {
    this.enabled = true;
    console.log('🔔 Servicio de notificaciones habilitado');
  }

  deshabilitar() {
    this.enabled = false;
    console.log('🔕 Servicio de notificaciones deshabilitado');
  }

  // Obtener estado del servicio
  obtenerEstado() {
    return {
      enabled: this.enabled,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new NotificationService();

