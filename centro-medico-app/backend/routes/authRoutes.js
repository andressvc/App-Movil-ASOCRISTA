// routes/authRoutes.js
const express = require('express');
const { login, perfil, cambiarPassword, actualizarPerfil } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Rutas públicas
router.post('/login', login);

// Rutas protegidas
router.get('/perfil', authMiddleware, perfil);
router.put('/perfil', authMiddleware, actualizarPerfil);
router.put('/cambiar-password', authMiddleware, cambiarPassword);

module.exports = router;
