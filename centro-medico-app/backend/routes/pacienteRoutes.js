// routes/pacienteRoutes.js
const express = require('express');
const {
  crearPaciente,
  obtenerPacientes,
  obtenerPacientePorId,
  actualizarPaciente,
  eliminarPaciente,
  buscarPacientes
} = require('../controllers/pacienteController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas de pacientes
router.post('/', crearPaciente);                    // Crear paciente
router.get('/', obtenerPacientes);                  // Listar pacientes con paginación
router.get('/buscar', buscarPacientes);             // Búsqueda rápida
router.get('/:id', obtenerPacientePorId);           // Obtener por ID
router.put('/:id', actualizarPaciente);             // Actualizar
router.delete('/:id', eliminarPaciente);            // Eliminar (soft delete)

module.exports = router;