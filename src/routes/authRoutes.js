const express = require('express');
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { registerSchema, loginSchema, updateProfileSchema } = require('../utils/validators');

const router = express.Router();

// Rutas públicas
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

// ✅ Cambiar a GET para validar token desde otros servicios
router.get('/validate-token', authController.validateToken);
// También mantener POST por compatibilidad si es necesario
router.post('/validate-token', authController.validateToken);

// Rutas protegidas
router.get('/profile', requireAuth, authController.getProfile);
router.put('/profile', requireAuth, validate(updateProfileSchema), authController.updateProfile);
router.post('/logout', requireAuth, authController.logout);
router.get('/sessions', requireAuth, authController.getSessions);


router.get('/users/:id', requireAuth, authController.getUserById);
// Ruta pública para obtener información básica de usuario
router.get('/public/users/:id', authController.getPublicUserById);

module.exports = router;