// test-reporte-automatico.js
// Script para probar la generación y envío automático de reportes

require('dotenv').config();
const cronService = require('./services/cronService');
const emailService = require('./services/emailService');
const { generarReporteDiario } = require('./controllers/reporteController');
const { User } = require('./models');

async function probarGeneracionReporte() {
  try {
    console.log('🧪 Iniciando prueba de generación de reporte automático...\n');

    // Obtener un usuario activo para la prueba
    const usuario = await User.findOne({
      where: { activo: true }
    });

    if (!usuario) {
      console.log('❌ No se encontró ningún usuario activo para la prueba');
      return;
    }

    console.log(`👤 Usuario de prueba: ${usuario.nombre} (ID: ${usuario.id})`);

    // Simular request para generar reporte del día actual
    const fecha = new Date().toISOString().split('T')[0];
    console.log(`📅 Fecha del reporte: ${fecha}\n`);

    const req = {
      usuario: { id: usuario.id },
      params: { fecha }
    };

    const res = {
      json: (data) => {
        if (data.success && data.data.reporte) {
          console.log('✅ Reporte generado exitosamente');
          console.log(`📊 Datos del reporte:`);
          console.log(`   - Total pacientes: ${data.data.reporte.total_pacientes}`);
          console.log(`   - Total citas: ${data.data.reporte.total_citas}`);
          console.log(`   - Citas completadas: ${data.data.reporte.citas_completadas}`);
          console.log(`   - Citas canceladas: ${data.data.reporte.citas_canceladas}`);
          console.log(`   - Total ingresos: $${data.data.reporte.total_ingresos}`);
          console.log(`   - Total egresos: $${data.data.reporte.total_egresos}`);
          console.log(`   - Balance diario: $${data.data.reporte.balance_diario}`);
          console.log(`   - Archivo PDF: ${data.data.reporte.ruta_archivo || 'No generado'}\n`);

          // Probar envío de email
          probarEnvioEmail(data.data.reporte, data.data.datos);
        } else {
          console.log('❌ Error al generar reporte:', data.message);
        }
      },
      status: (code) => ({
        json: (data) => {
          console.log(`❌ Error ${code}:`, data.message);
        }
      })
    };

    await generarReporteDiario(req, res);

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

async function probarEnvioEmail(reporte, datos) {
  try {
    console.log('📧 Probando envío de email...');

    // Obtener destinatarios
    const destinatarios = await cronService.obtenerDestinatariosPropietario();
    console.log(`📬 Destinatarios: ${destinatarios.join(', ')}`);

    // Enviar reporte por email
    const resultado = await emailService.enviarReporteDiario(reporte, datos, destinatarios);
    
    if (resultado.success) {
      console.log('✅ Email enviado exitosamente');
      console.log(`📧 Message ID: ${resultado.messageId}`);
      console.log(`👥 Destinatarios: ${resultado.destinatarios}`);
    } else {
      console.log('❌ Error al enviar email:', resultado.message);
    }

  } catch (error) {
    console.error('❌ Error en envío de email:', error);
  }
}

async function probarConfiguracionEmail() {
  try {
    console.log('🔧 Verificando configuración de email...\n');

    const config = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS ? '***configurado***' : 'NO CONFIGURADO'
    };

    console.log(`📧 Configuración SMTP:`);
    console.log(`   - Host: ${config.host}`);
    console.log(`   - Puerto: ${config.port}`);
    console.log(`   - Usuario: ${config.user || 'NO CONFIGURADO'}`);
    console.log(`   - Contraseña: ${config.pass}\n`);

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('⚠️  ADVERTENCIA: Configuración de email incompleta');
      console.log('   Para habilitar el envío automático, configura:');
      console.log('   - SMTP_USER: tu email de Gmail');
      console.log('   - SMTP_PASS: tu contraseña de aplicación de Gmail\n');
    }

    // Verificar destinatarios
    const destinatarios = await cronService.obtenerDestinatariosPropietario();
    console.log(`📬 Destinatarios configurados: ${destinatarios.join(', ')}\n`);

  } catch (error) {
    console.error('❌ Error verificando configuración:', error);
  }
}

async function main() {
  console.log('🚀 PRUEBA DEL SISTEMA DE REPORTES AUTOMÁTICOS\n');
  console.log('=' .repeat(50));

  // Verificar configuración
  await probarConfiguracionEmail();

  // Probar generación de reporte
  await probarGeneracionReporte();

  console.log('\n' + '=' .repeat(50));
  console.log('✅ Prueba completada');
  console.log('\n📋 Para configurar el envío automático:');
  console.log('1. Configura las variables de entorno en tu archivo .env');
  console.log('2. Usa una contraseña de aplicación de Gmail para SMTP_PASS');
  console.log('3. El sistema enviará reportes automáticamente a las 18:00');
  console.log('4. Los reportes se enviarán a: santosgrmz0@gmail.com');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { probarGeneracionReporte, probarEnvioEmail, probarConfiguracionEmail };
