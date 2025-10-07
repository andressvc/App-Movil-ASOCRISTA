// models/MovimientoFinanciero.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MovimientoFinanciero = sequelize.define('MovimientoFinanciero', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  tipo: {
    type: DataTypes.ENUM('ingreso', 'egreso'),
    allowNull: false
  },
  categoria: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  paciente_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'pacientes',
      key: 'id'
    }
  },
  cita_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'citas',
      key: 'id'
    }
  },
  metodo_pago: {
    type: DataTypes.ENUM('efectivo', 'tarjeta', 'transferencia', 'cheque', 'deposito'),
    allowNull: true,
    validate: {
      isIn: {
        args: [['efectivo', 'tarjeta', 'transferencia', 'cheque', 'deposito']],
        msg: 'Método de pago no válido'
      }
    }
  },
  comprobante: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'movimientos_financieros'
});

module.exports = MovimientoFinanciero;