// configurar-reportes.js
// Script para configurar el sistema de reportes automáticos

const fs = require('fs');
const path = require('path');

function configurarReportes() {
  console.log('🔧 CONFIGURACIÓN DEL SISTEMA DE REPORTES AUTOMÁTICOS\n');
  console.log('=' .repeat(60));

  const envPath = path.join(__dirname, '.env');
  const envExamplePath = path.join(__dirname, 'env.example');

  // Verificar si existe el archivo .env
  if (!fs.existsSync(envPath)) {
    console.log('📄 Creando archivo .env desde env.example...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Archivo .env creado\n');
  }

  // Leer el archivo .env actual
  let envContent = fs.readFileSync(envPath, 'utf8');

  // Configurar email específico para reportes
  if (!envContent.includes('REPORTES_EMAIL=santosgrmz0@gmail.com')) {
    envContent += '\n# Email específico para reportes diarios\nREPORTES_EMAIL=santosgrmz0@gmail.com\n';
  }

  // Configurar SMTP si no está configurado
  if (!envContent.includes('SMTP_HOST=')) {
    envContent += '\n# Configuración SMTP para envío de emails\nSMTP_HOST=smtp.gmail.com\nSMTP_PORT=587\nSMTP_USER=\nSMTP_PASS=\n';
  }

  // Escribir el archivo actualizado
  fs.writeFileSync(envPath, envContent);

  console.log('✅ Configuración actualizada en .env');
  console.log('\n📋 CONFIGURACIÓN REQUERIDA:');
  console.log('Para habilitar el envío automático de reportes, configura:');
  console.log('1. SMTP_USER: tu email de Gmail');
  console.log('2. SMTP_PASS: tu contraseña de aplicación de Gmail');
  console.log('\n📧 Los reportes se enviarán automáticamente a: santosgrmz0@gmail.com');
  console.log('⏰ Horario de envío: Todos los días a las 18:00 (6:00 PM) - Zona horaria: Guatemala');
  console.log('\n🔐 Para obtener una contraseña de aplicación de Gmail:');
  console.log('1. Ve a tu cuenta de Google');
  console.log('2. Seguridad > Verificación en 2 pasos');
  console.log('3. Contraseñas de aplicaciones');
  console.log('4. Genera una nueva contraseña para "Centro Médico ASOCRISTA"');
  console.log('\n🧪 Para probar la configuración, ejecuta:');
  console.log('   node test-reporte-automatico.js');
}

if (require.main === module) {
  configurarReportes();
}

module.exports = { configurarReportes };
