const { sequelize } = require('./config/database');
const { User, Paciente, Cita, MovimientoFinanciero, Reporte } = require('./models');

async function syncDatabase() {
  try {
    console.log('🔄 Sincronizando base de datos...');
    
    // Forzar recreación de tablas
    await sequelize.sync({ force: true });
    
    console.log('✅ Base de datos sincronizada correctamente');
    console.log('📋 Tablas creadas:');
    console.log('   - users');
    console.log('   - pacientes');
    console.log('   - citas');
    console.log('   - movimientos_financieros');
    console.log('   - reportes');
    
    // Crear usuario administrador
    const adminUser = await User.create({
      nombre: 'Administrador',
      email: 'admin@asocrista.com',
      password: 'admin123',
      rol: 'admin'
    });
    
    console.log('👤 Usuario administrador creado:');
    console.log(`   Email: admin@asocrista.com`);
    console.log(`   Contraseña: admin123`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al sincronizar base de datos:', error);
    process.exit(1);
  }
}

syncDatabase();

