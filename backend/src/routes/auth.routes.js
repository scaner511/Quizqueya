const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { validate } = require('../utils/validate');

const router = express.Router();

router.post(
  '/register',
  [
    body('nickname').isString().notEmpty().withMessage('El nickname es requerido').isLength({ min: 3, max: 50 }),
    body('age').isInt({ min: 6, max: 120 }).withMessage('Edad entre 6 y 120 años'),
    body('email').isEmail().withMessage('Correo inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('provinceId').isInt().withMessage('Provincia requerida'),
    body('mascotId').isInt().withMessage('Mascota requerida'),
  ],
  validate,
  authController.register,
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Correo inválido'),
    body('password').notEmpty().withMessage('Contraseña requerida'),
  ],
  validate,
  authController.login,
);

router.get('/me', authMiddleware, authController.me);

router.put(
  '/profile',
  authMiddleware,
  [
    body('nickname').optional().isString().isLength({ min: 3, max: 50 }).withMessage('Nickname entre 3 y 50 caracteres'),
  ],
  validate,
  authController.updateProfile,
);

router.post(
  '/change-password',
  authMiddleware,
  [
    body('currentPassword').notEmpty().withMessage('Contraseña actual requerida'),
    body('newPassword').isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres'),
  ],
  validate,
  authController.changePassword,
);

module.exports = router;
