// routes/reporteRoutes.js
const express = require('express');
const {
  generarReporteDiario,
  obtenerReportes,
  obtenerReporte,
  actualizarReporte,
  descargarPDFReporte,
  eliminarReporte
} = require('../controllers/reporteController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// REQ5 - Rutas para reportes
router.post('/generar/:fecha', generarReporteDiario);  // Generar reporte diario
router.get('/', obtenerReportes);                      // Listar reportes con filtros
// IMPORTANTE: La ruta /:id/pdf debe ir ANTES de /:id para evitar conflictos
router.get('/:id/pdf', descargarPDFReporte);          // Descargar PDF del reporte
router.put('/:id', actualizarReporte);                 // Actualizar reporte
router.delete('/:id', eliminarReporte);               // Eliminar reporte
router.get('/:id', obtenerReporte);                    // Obtener reporte por ID

module.exports = router;
