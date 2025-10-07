// test-deposito.js
const { MovimientoFinanciero } = require('./models');

async function testDeposito() {
  try {
    console.log('🧪 Probando método de pago "deposito"...');
    
    // Crear un movimiento de prueba con método de pago 'deposito'
    const testMovement = await MovimientoFinanciero.create({
      usuario_id: 1, // Ajusta según tu usuario de prueba
      tipo: 'ingreso',
      categoria: 'Transporte',
      descripcion: 'Prueba de depósito',
      monto: 100.00,
      fecha: new Date().toISOString().split('T')[0],
      metodo_pago: 'deposito',
      comprobante: 'TEST-001'
    });

    console.log('✅ Movimiento creado exitosamente:', testMovement.toJSON());
    
    // Buscar el movimiento para verificar que se guardó correctamente
    const foundMovement = await MovimientoFinanciero.findByPk(testMovement.id);
    console.log('✅ Movimiento encontrado:', foundMovement.toJSON());
    
    // Limpiar el movimiento de prueba
    await testMovement.destroy();
    console.log('✅ Movimiento de prueba eliminado');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    if (error.name === 'SequelizeValidationError') {
      console.error('Errores de validación:', error.errors);
    }
  }
}

testDeposito();
