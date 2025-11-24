const express = require('express');
const router = express.Router({ mergeParams: true });
const { body } = require('express-validator');
const medicationController = require('../controllers/medicationController');
const { auth } = require('../middleware/auth');
const { checkCircleMembership } = require('../middleware/circleMembership');

// Validaciones
const createMedicationValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre del medicamento es requerido.')
    .isLength({ max: 150 })
    .withMessage('El nombre no puede exceder 150 caracteres.'),
  body('dosage')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La dosis no puede exceder 100 caracteres.'),
  body('frequency')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La frecuencia no puede exceder 100 caracteres.'),
  body('instructions')
    .optional()
    .trim(),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de inicio inválida.'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin inválida.'),
];

// Todas las rutas requieren autenticación y membresía al círculo
router.use(auth);
router.use(checkCircleMembership);

// Rutas de medicamentos
router.post('/', createMedicationValidation, medicationController.create);
router.get('/', medicationController.getAll);
router.get('/:id', medicationController.getById);
router.put('/:id', medicationController.update);
router.delete('/:id', medicationController.delete);

module.exports = router;
