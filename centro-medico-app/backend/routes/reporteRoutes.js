// routes/reporteRoutes.js
const express = require('express');
const {
  generarReporteDiario,
  obtenerReportes,
  obtenerReporte
} = require('../controllers/reporteController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// REQ5 - Rutas para reportes
router.post('/generar/:fecha', generarReporteDiario);  // Generar reporte diario
router.get('/', obtenerReportes);                      // Listar reportes con filtros
router.get('/:id', obtenerReporte);                    // Obtener reporte por ID

module.exports = router;
