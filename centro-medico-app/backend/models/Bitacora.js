// models/Bitacora.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Bitacora = sequelize.define('Bitacora', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'usuarios', key: 'id' }
  },
  accion: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  entidad: {
    type: DataTypes.STRING(50), // 'cita', 'paciente', 'movimiento', 'reporte', etc.
    allowNull: true
  },
  entidad_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'bitacora'
});

module.exports = Bitacora;


