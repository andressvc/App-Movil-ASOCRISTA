// models/Reporte.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reporte = sequelize.define('Reporte', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  total_pacientes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_citas: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  citas_completadas: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  citas_canceladas: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_ingresos: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  total_egresos: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  balance_diario: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  ruta_archivo: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  enviado_propietario: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  fecha_envio: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'reportes'
});

module.exports = Reporte;