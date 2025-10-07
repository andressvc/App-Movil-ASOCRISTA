// run-migration.js
const { QueryInterface, DataTypes } = require('sequelize');
const sequelize = require('./config/database');

async function runMigration() {
  try {
    console.log('🔄 Iniciando migración de método de pago...');
    
    // Verificar si la tabla existe
    const tableExists = await sequelize.getQueryInterface().showAllTables();
    if (!tableExists.includes('movimientos_financieros')) {
      console.log('❌ La tabla movimientos_financieros no existe');
      return;
    }

    // Verificar la estructura actual de la columna
    const tableDescription = await sequelize.getQueryInterface().describeTable('movimientos_financieros');
    console.log('📋 Estructura actual de metodo_pago:', tableDescription.metodo_pago);

    // Actualizar el ENUM
    await sequelize.getQueryInterface().changeColumn('movimientos_financieros', 'metodo_pago', {
      type: DataTypes.ENUM('efectivo', 'tarjeta', 'transferencia', 'cheque', 'deposito'),
      allowNull: true
    });

    console.log('✅ Migración completada exitosamente');
    
    // Verificar la nueva estructura
    const newTableDescription = await sequelize.getQueryInterface().describeTable('movimientos_financieros');
    console.log('📋 Nueva estructura de metodo_pago:', newTableDescription.metodo_pago);

  } catch (error) {
    console.error('❌ Error en la migración:', error);
  } finally {
    await sequelize.close();
  }
}

runMigration();
