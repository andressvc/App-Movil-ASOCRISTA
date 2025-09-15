// services/emailService.js
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  async initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false, // true para 465, false para otros puertos
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      // Verificar conexión
      await this.transporter.verify();
      console.log('✅ Servicio de email configurado correctamente');
    } catch (error) {
      console.error('❌ Error al configurar servicio de email:', error);
    }
  }

  // REQ6 - Enviar reporte diario por email
  async enviarReporteDiario(reporte, datos, destinatarios) {
    try {
      if (!this.transporter) {
        throw new Error('Servicio de email no configurado');
      }

      const fechaFormateada = new Date(reporte.fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Leer archivo PDF si existe
      let attachments = [];
      if (reporte.ruta_archivo && await this.archivoExiste(reporte.ruta_archivo)) {
        attachments = [{
          filename: `reporte_diario_${reporte.fecha}.pdf`,
          path: reporte.ruta_archivo,
          contentType: 'application/pdf'
        }];
      }

      const mailOptions = {
        from: process.env.SMTP_USER,
        to: destinatarios.join(', '),
        subject: `Reporte Diario - Centro Médico ASOCRISTA - ${fechaFormateada}`,
        html: this.generarHTMLReporte(reporte, datos),
        attachments
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Reporte enviado por email:', result.messageId);
      
      return {
        success: true,
        messageId: result.messageId,
        destinatarios: destinatarios.length
      };

    } catch (error) {
      console.error('❌ Error al enviar reporte por email:', error);
      throw error;
    }
  }

  // Generar HTML para el email
  generarHTMLReporte(reporte, datos) {
    const fechaFormateada = new Date(reporte.fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reporte Diario</title>
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
              .header h2 {
                  color: #666;
                  margin: 10px 0 0 0;
                  font-size: 16px;
                  font-weight: normal;
              }
              .stats-grid {
                  display: grid;
                  grid-template-columns: repeat(2, 1fr);
                  gap: 15px;
                  margin-bottom: 30px;
              }
              .stat-card {
                  background: #f8f9fa;
                  padding: 15px;
                  border-radius: 8px;
                  border-left: 4px solid #007bff;
                  text-align: center;
              }
              .stat-card h3 {
                  margin: 0 0 10px 0;
                  color: #333;
                  font-size: 14px;
              }
              .stat-value {
                  font-size: 20px;
                  font-weight: bold;
                  color: #007bff;
              }
              .section {
                  margin-bottom: 25px;
              }
              .section h3 {
                  color: #333;
                  border-bottom: 2px solid #007bff;
                  padding-bottom: 8px;
                  margin-bottom: 15px;
                  font-size: 16px;
              }
              .table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-bottom: 15px;
                  font-size: 14px;
              }
              .table th, .table td {
                  padding: 8px;
                  text-align: left;
                  border-bottom: 1px solid #ddd;
              }
              .table th {
                  background-color: #007bff;
                  color: white;
                  font-weight: bold;
              }
              .table tr:nth-child(even) {
                  background-color: #f8f9fa;
              }
              .status-completada { color: #28a745; font-weight: bold; }
              .status-cancelada { color: #dc3545; font-weight: bold; }
              .status-programada { color: #ffc107; font-weight: bold; }
              .footer {
                  text-align: center;
                  margin-top: 30px;
                  padding-top: 20px;
                  border-top: 1px solid #ddd;
                  color: #666;
                  font-size: 12px;
              }
              .highlight {
                  background-color: #e3f2fd;
                  padding: 15px;
                  border-radius: 8px;
                  margin: 20px 0;
                  border-left: 4px solid #2196f3;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Reporte Diario</h1>
                  <h2>Centro Médico ASOCRISTA - ${fechaFormateada}</h2>
              </div>

              <div class="highlight">
                  <strong>Resumen del Día:</strong> Se atendieron ${reporte.total_pacientes} pacientes 
                  en ${reporte.total_citas} citas, con un balance de $${reporte.balance_diario.toFixed(2)}.
              </div>

              <div class="stats-grid">
                  <div class="stat-card">
                      <h3>Pacientes Atendidos</h3>
                      <div class="stat-value">${reporte.total_pacientes}</div>
                  </div>
                  <div class="stat-card">
                      <h3>Total de Citas</h3>
                      <div class="stat-value">${reporte.total_citas}</div>
                  </div>
                  <div class="stat-card">
                      <h3>Citas Completadas</h3>
                      <div class="stat-value">${reporte.citas_completadas}</div>
                  </div>
                  <div class="stat-card">
                      <h3>Citas Canceladas</h3>
                      <div class="stat-value">${reporte.citas_canceladas}</div>
                  </div>
                  <div class="stat-card">
                      <h3>Total Ingresos</h3>
                      <div class="stat-value">$${reporte.total_ingresos.toFixed(2)}</div>
                  </div>
                  <div class="stat-card">
                      <h3>Total Egresos</h3>
                      <div class="stat-value">$${reporte.total_egresos.toFixed(2)}</div>
                  </div>
                  <div class="stat-card">
                      <h3>Balance Diario</h3>
                      <div class="stat-value" style="color: ${reporte.balance_diario >= 0 ? '#28a745' : '#dc3545'}">
                          $${reporte.balance_diario.toFixed(2)}
                      </div>
                  </div>
              </div>

              <div class="section">
                  <h3>Citas del Día</h3>
                  <table class="table">
                      <thead>
                          <tr>
                              <th>Hora</th>
                              <th>Paciente</th>
                              <th>Tipo</th>
                              <th>Estado</th>
                          </tr>
                      </thead>
                      <tbody>
                          ${datos.citas.map(cita => `
                              <tr>
                                  <td>${cita.hora_inicio} - ${cita.hora_fin}</td>
                                  <td>${cita.paciente.nombre} ${cita.paciente.apellido}</td>
                                  <td>${cita.tipo.replace('_', ' ').toUpperCase()}</td>
                                  <td class="status-${cita.estado}">${cita.estado.replace('_', ' ').toUpperCase()}</td>
                              </tr>
                          `).join('')}
                      </tbody>
                  </table>
              </div>

              <div class="section">
                  <h3>Movimientos Financieros</h3>
                  <table class="table">
                      <thead>
                          <tr>
                              <th>Tipo</th>
                              <th>Descripción</th>
                              <th>Monto</th>
                              <th>Método de Pago</th>
                          </tr>
                      </thead>
                      <tbody>
                          ${datos.movimientos.map(mov => `
                              <tr>
                                  <td>${mov.tipo.toUpperCase()}</td>
                                  <td>${mov.descripcion}</td>
                                  <td>$${parseFloat(mov.monto).toFixed(2)}</td>
                                  <td>${mov.metodo_pago || 'N/A'}</td>
                              </tr>
                          `).join('')}
                      </tbody>
                  </table>
              </div>

              <div class="footer">
                  <p>Reporte generado automáticamente el ${new Date().toLocaleString('es-ES')}</p>
                  <p>Centro Médico ASOCRISTA - Sistema de Gestión</p>
                  <p>Este es un reporte automático, no responder a este email.</p>
              </div>
          </div>
      </body>
      </html>
    `;
  }

  // Verificar si un archivo existe
  async archivoExiste(ruta) {
    try {
      await fs.access(ruta);
      return true;
    } catch {
      return false;
    }
  }

  // Enviar notificación simple
  async enviarNotificacion(destinatarios, asunto, mensaje) {
    try {
      if (!this.transporter) {
        throw new Error('Servicio de email no configurado');
      }

      const mailOptions = {
        from: process.env.SMTP_USER,
        to: destinatarios.join(', '),
        subject: asunto,
        text: mensaje,
        html: `<p>${mensaje}</p>`
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Notificación enviada:', result.messageId);
      
      return {
        success: true,
        messageId: result.messageId
      };

    } catch (error) {
      console.error('❌ Error al enviar notificación:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();
