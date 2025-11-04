// models/index.js
const User = require('./User');
const Paciente = require('./Paciente');
const Cita = require('./Cita');
const MovimientoFinanciero = require('./MovimientoFinanciero');
const Reporte = require('./Reporte');
const Bitacora = require('./Bitacora');

// Definir relaciones entre modelos
// Relaciones de Usuario
User.hasMany(Paciente, { foreignKey: 'usuario_id', as: 'pacientes' });
User.hasMany(Cita, { foreignKey: 'usuario_id', as: 'citas' });
User.hasMany(MovimientoFinanciero, { foreignKey: 'usuario_id', as: 'movimientos' });
User.hasMany(Reporte, { foreignKey: 'usuario_id', as: 'reportes' });
User.hasMany(Bitacora, { foreignKey: 'usuario_id', as: 'bitacora' });

// Relaciones de Paciente
Paciente.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });
Paciente.hasMany(Cita, { foreignKey: 'paciente_id', as: 'citas' });
Paciente.hasMany(MovimientoFinanciero, { foreignKey: 'paciente_id', as: 'movimientos' });

// Relaciones de Cita
Cita.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });
Cita.belongsTo(Paciente, { foreignKey: 'paciente_id', as: 'paciente' });
Cita.hasMany(MovimientoFinanciero, { foreignKey: 'cita_id', as: 'pagos' });

// Relaciones de MovimientoFinanciero
MovimientoFinanciero.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });
MovimientoFinanciero.belongsTo(Paciente, { foreignKey: 'paciente_id', as: 'paciente' });
MovimientoFinanciero.belongsTo(Cita, { foreignKey: 'cita_id', as: 'cita' });

// Relaciones de Reporte
Reporte.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });
Bitacora.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });

module.exports = {
  User,
  Paciente,
  Cita,
  MovimientoFinanciero,
  Reporte,
  Bitacora
};