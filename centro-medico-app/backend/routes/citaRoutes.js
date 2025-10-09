// routes/citaRoutes.js
const express = require('express');
const {
  crearCita,
  obtenerCitas,
  obtenerCita,
  obtenerCitasDelDia,
  actualizarCita,
  cambiarEstadoCita,
  eliminarCita
} = require('../controllers/citaController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas de citas
router.post('/', crearCita);                           // Crear cita
router.get('/', obtenerCitas);                         // Listar citas con filtros
router.get('/dia/:fecha', obtenerCitasDelDia);         // Citas de un día específico
router.get('/:id', obtenerCita);                       // Obtener cita por ID
router.put('/:id', actualizarCita);                    // Actualizar cita
router.patch('/:id/estado', cambiarEstadoCita);        // Cambiar solo el estado
router.delete('/:id', eliminarCita);                   // Eliminar cita

module.exports = router;