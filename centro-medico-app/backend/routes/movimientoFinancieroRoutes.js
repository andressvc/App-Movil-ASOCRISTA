// routes/movimientoFinancieroRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  crearMovimiento,
  listarMovimientos,
  obtenerBalanceDiario,
  obtenerHistorial,
  obtenerMovimiento,
  actualizarMovimiento,
  eliminarMovimiento
} = require('../controllers/movimientoFinancieroController');

// Aplicar middleware de autenticación a todas las rutas
router.use(auth);

// REQ3 - Rutas para movimientos financieros
router.post('/', crearMovimiento); // Crear movimiento financiero
router.get('/', listarMovimientos); // Listar movimientos con filtros
router.get('/balance/:fecha', obtenerBalanceDiario); // Obtener balance diario
router.get('/historial', obtenerHistorial); // Obtener historial financiero
router.get('/:id', obtenerMovimiento); // Obtener movimiento por ID
router.put('/:id', actualizarMovimiento); // Actualizar movimiento
router.delete('/:id', eliminarMovimiento); // Eliminar movimiento

module.exports = router;
