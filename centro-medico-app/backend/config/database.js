//configuraciónbd
const { Sequelize } = require('sequelize');
const fs = require('fs');
require('dotenv').config();

// Opciones de dialecto (SSL) para MySQL gestionado
const dialectOptions = {};
if (process.env.DB_SSL === 'true' || process.env.DB_CA_CERT) {
  dialectOptions.ssl = {
    require: true,
    // Permite desactivar la verificación estricta si es necesario: DB_SSL_REJECT_UNAUTHORIZED=false
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
    // Soporta certificado desde archivo (DB_CA_PATH) o desde variable de entorno (DB_CA_CERT)
    ca: process.env.DB_CA_CERT || (process.env.DB_CA_PATH ? fs.readFileSync(process.env.DB_CA_PATH, 'utf8') : undefined),
  };
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 60000,
      idle: 10000
    },
    dialectOptions,
  }
);

module.exports = sequelize;