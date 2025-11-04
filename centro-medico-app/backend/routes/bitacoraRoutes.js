// routes/bitacoraRoutes.js
const express = require('express');
const { crearEntrada, listarEntradas } = require('../controllers/bitacoraController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.get('/', listarEntradas);
router.post('/', crearEntrada);

module.exports = router;


