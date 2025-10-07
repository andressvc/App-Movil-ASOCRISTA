// services/emailService.js
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  async initializeTransporter() {
    try {
      // Solo inicializar si hay credenciales configuradas
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
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
        console.log('Servicio de email configurado correctamente');
      } else {
        console.log('Servicio de email no configurado - SMTP_USER o SMTP_PASS faltantes');
      }
    } catch (error) {
      console.error('Error al configurar servicio de email:', error.message);
      this.transporter = null;
    }
  }

  // Enviar reporte diario por email
  async enviarReporteDiario(reporte, datos, destinatarios) {
    try {
      if (!this.transporter) {
        return {
          success: false,
          message: 'Servicio de email no configurado'
        };
      }

      const fechaFormateada = new Date(reporte.fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const mailOptions = {
        from: process.env.SMTP_USER,
        to: destinatarios.join(', '),
        subject: `Reporte Diario - Centro Médico ASOCRISTA - ${fechaFormateada}`,
        html: this.generarHTMLReporte(reporte, datos)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Reporte enviado por email:', result.messageId);
      
      return {
        success: true,
        messageId: result.messageId,
        destinatarios: destinatarios.length
      };

    } catch (error) {
      console.error('Error al enviar reporte por email:', error.message);
      return {
        success: false,
        message: error.message
      };
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
              .footer {
                  text-align: center;
                  margin-top: 30px;
                  padding-top: 20px;
                  border-top: 1px solid #ddd;
                  color: #666;
                  font-size: 12px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Reporte Diario</h1>
                  <h2>Centro Médico ASOCRISTA - ${fechaFormateada}</h2>
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

              <div class="footer">
                  <p>Reporte generado automáticamente el ${new Date().toLocaleString('es-ES')}</p>
                  <p>Centro Médico ASOCRISTA - Sistema de Gestión</p>
              </div>
          </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();
