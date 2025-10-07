// migrations/update_metodo_pago_enum.js
const { QueryInterface, DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    // Verificar si la columna existe y actualizar el ENUM
    try {
      await queryInterface.changeColumn('movimientos_financieros', 'metodo_pago', {
        type: DataTypes.ENUM('efectivo', 'tarjeta', 'transferencia', 'cheque', 'deposito'),
        allowNull: true,
        validate: {
          isIn: {
            args: [['efectivo', 'tarjeta', 'transferencia', 'cheque', 'deposito']],
            msg: 'Método de pago no válido'
          }
        }
      });
      console.log('✅ ENUM de método de pago actualizado correctamente');
    } catch (error) {
      console.error('❌ Error actualizando ENUM de método de pago:', error);
      throw error;
    }
  },

  down: async (queryInterface) => {
    // Revertir cambios si es necesario
    try {
      await queryInterface.changeColumn('movimientos_financieros', 'metodo_pago', {
        type: DataTypes.ENUM('efectivo', 'tarjeta', 'transferencia', 'cheque'),
        allowNull: true
      });
      console.log('✅ ENUM de método de pago revertido');
    } catch (error) {
      console.error('❌ Error revirtiendo ENUM de método de pago:', error);
      throw error;
    }
  }
};
