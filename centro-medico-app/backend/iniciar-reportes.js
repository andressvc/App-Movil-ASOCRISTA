// iniciar-reportes.js
// Script para iniciar el sistema de reportes automáticos

require('dotenv').config();
const { configurarReportes } = require('./configurar-reportes');
const cronService = require('./services/cronService');

async function iniciarSistemaReportes() {
  try {
    console.log('🚀 INICIANDO SISTEMA DE REPORTES AUTOMÁTICOS\n');
    console.log('=' .repeat(60));

    // Configurar el sistema
    configurarReportes();

    // Verificar configuración de email
    const emailConfigurado = process.env.SMTP_USER && process.env.SMTP_PASS;
    
    if (!emailConfigurado) {
      console.log('\n⚠️  CONFIGURACIÓN INCOMPLETA');
      console.log('Para habilitar el envío automático de reportes:');
      console.log('1. Edita el archivo .env');
      console.log('2. Configura SMTP_USER y SMTP_PASS');
      console.log('3. Reinicia el servidor\n');
    } else {
      console.log('\n✅ CONFIGURACIÓN DE EMAIL COMPLETA');
      console.log(`📧 Email configurado: ${process.env.SMTP_USER}`);
      console.log('📬 Reportes se enviarán a: santosgrmz0@gmail.com');
    }

    // Iniciar tareas programadas
    console.log('\n🕐 Iniciando tareas programadas...');
    cronService.iniciar();

    // Mostrar estado de las tareas
    const estado = cronService.obtenerEstado();
    console.log('\n📊 Estado de las tareas:');
    for (const [nombre, info] of Object.entries(estado)) {
      const estadoTexto = info.activa ? '✅ Activa' : '❌ Inactiva';
      const proximaEjecucion = info.proximaEjecucion ? 
        info.proximaEjecucion.toLocaleString('es-ES') : 'No programada';
      console.log(`   ${nombre}: ${estadoTexto} - Próxima: ${proximaEjecucion}`);
    }

    console.log('\n🎯 SISTEMA DE REPORTES CONFIGURADO');
    console.log('Los reportes diarios se generarán automáticamente a las 18:00');
    console.log('y se enviarán por email a santosgrmz0@gmail.com');
    
    if (!emailConfigurado) {
      console.log('\n⚠️  Recuerda configurar las credenciales de email para el envío automático');
    }

    // Mantener el proceso activo
    console.log('\n⏳ Sistema ejecutándose... (Ctrl+C para detener)');
    
    // Manejar cierre graceful
    process.on('SIGINT', () => {
      console.log('\n🛑 Deteniendo sistema de reportes...');
      cronService.detener();
      console.log('✅ Sistema detenido correctamente');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error al iniciar el sistema de reportes:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  iniciarSistemaReportes();
}

module.exports = { iniciarSistemaReportes };
