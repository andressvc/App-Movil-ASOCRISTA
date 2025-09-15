// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Importar la configuración de la base de datos
const sequelize = require('./config/database');
const models = require('./models');
const crearUsuarioInicial = require('./utils/crearUsuarioInicial');
const cronService = require('./services/cronService');


// Importar rutas
const authRoutes = require('./routes/authRoutes');
const pacienteRoutes = require('./routes/pacienteRoutes');
const citaRoutes = require('./routes/citaRoutes');
const movimientoFinancieroRoutes = require('./routes/movimientoFinancieroRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');


const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de seguridad
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/citas', citaRoutes);
app.use('/api/movimientos', movimientoFinancieroRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API de ASOCRISTA funcionando' });
});

// Función para iniciar el servidor
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
    
    await sequelize.sync();
    console.log('Modelos sincronizados con la base de datos.');
    
    await crearUsuarioInicial();
    
    // Iniciar tareas programadas
    cronService.iniciar();
    
    app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log('📚 Rutas disponibles:');
  console.log('🔐 AUTENTICACIÓN:');
  console.log('   POST /api/auth/login - Iniciar sesión');
  console.log('   GET  /api/auth/perfil - Obtener perfil');
  console.log('   PUT  /api/auth/cambiar-password - Cambiar contraseña');
  console.log('👥 PACIENTES:');
  console.log('   POST /api/pacientes - Crear paciente');
  console.log('   GET  /api/pacientes - Listar pacientes');
  console.log('   GET  /api/pacientes/buscar - Buscar pacientes');
  console.log('   GET  /api/pacientes/:id - Obtener paciente');
  console.log('   PUT  /api/pacientes/:id - Actualizar paciente');
  console.log('   DELETE /api/pacientes/:id - Eliminar paciente');
  console.log('📅 CITAS:');
  console.log('   POST /api/citas - Crear cita/evento');
  console.log('   GET  /api/citas - Listar citas');
  console.log('   GET  /api/citas/dia/:fecha - Citas del día');
  console.log('   PUT  /api/citas/:id - Actualizar cita');
  console.log('   PATCH /api/citas/:id/estado - Cambiar estado');
  console.log('   DELETE /api/citas/:id - Eliminar cita');
  console.log('💰 MOVIMIENTOS FINANCIEROS:');
  console.log('   POST /api/movimientos - Crear movimiento');
  console.log('   GET  /api/movimientos - Listar movimientos');
  console.log('   GET  /api/movimientos/balance/:fecha - Balance diario');
  console.log('   GET  /api/movimientos/historial - Historial financiero');
  console.log('   PUT  /api/movimientos/:id - Actualizar movimiento');
  console.log('   DELETE /api/movimientos/:id - Eliminar movimiento');
  console.log('📊 REPORTES:');
  console.log('   POST /api/reportes/generar/:fecha - Generar reporte diario');
  console.log('   GET  /api/reportes - Listar reportes');
  console.log('   GET  /api/reportes/:id - Obtener reporte');
  console.log('🏠 DASHBOARD:');
  console.log('   GET  /api/dashboard/resumen - Resumen del dashboard');
  console.log('   GET  /api/dashboard/estadisticas - Estadísticas por período');
});
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
  }
};

startServer();