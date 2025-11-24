const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const circleController = require('../controllers/circleController');
const { auth } = require('../middleware/auth');
const { checkCircleMembership } = require('../middleware/circleMembership');

// Validaciones
const createCircleValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre del círculo es requerido.')
    .isLength({ max: 100 })
    .withMessage('El nombre no puede exceder 100 caracteres.'),
  body('patientName')
    .trim()
    .notEmpty()
    .withMessage('El nombre del paciente es requerido.')
    .isLength({ max: 100 })
    .withMessage('El nombre del paciente no puede exceder 100 caracteres.'),
  body('displayName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('El nombre de display no puede exceder 100 caracteres.'),
];

const joinCircleValidation = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('El código del círculo es requerido.')
    .isLength({ min: 8, max: 8 })
    .withMessage('El código debe tener 8 caracteres.'),
  body('displayName')
    .trim()
    .notEmpty()
    .withMessage('Tu nombre para el círculo es requerido.')
    .isLength({ max: 100 })
    .withMessage('El nombre no puede exceder 100 caracteres.'),
];

// Todas las rutas requieren autenticación
router.use(auth);

// Rutas de círculos
router.post('/', createCircleValidation, circleController.create);
router.post('/join', joinCircleValidation, circleController.join);
router.get('/', circleController.getMyCircles);
router.get('/:circleId', checkCircleMembership, circleController.getById);
router.delete('/:circleId/leave', circleController.leave);

module.exports = router;
