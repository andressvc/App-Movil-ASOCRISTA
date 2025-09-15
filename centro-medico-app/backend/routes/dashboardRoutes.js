// routes/dashboardRoutes.js
const express = require('express');
const {
  obtenerResumen,
  obtenerEstadisticas
} = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// REQ9 - Rutas para dashboard
router.get('/resumen', obtenerResumen);           // Obtener resumen del dashboard
router.get('/estadisticas', obtenerEstadisticas); // Obtener estadísticas por período

module.exports = router;
