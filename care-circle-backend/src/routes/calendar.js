const express = require('express');
const router = express.Router({ mergeParams: true });
const { body } = require('express-validator');
const calendarController = require('../controllers/calendarController');
const { auth } = require('../middleware/auth');
const { checkCircleMembership } = require('../middleware/circleMembership');

// Validaciones
const createEventValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('El título del evento es requerido.')
    .isLength({ max: 200 })
    .withMessage('El título no puede exceder 200 caracteres.'),
  body('description')
    .optional()
    .trim(),
  body('eventDate')
    .notEmpty()
    .withMessage('La fecha del evento es requerida.')
    .isISO8601()
    .withMessage('Fecha inválida.'),
  body('eventEndDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin inválida.'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('La ubicación no puede exceder 255 caracteres.'),
  body('eventType')
    .optional()
    .isIn(['appointment', 'checkup', 'therapy', 'other'])
    .withMessage('Tipo de evento inválido.'),
  body('reminderTime')
    .optional()
    .isISO8601()
    .withMessage('Hora de recordatorio inválida.'),
];

// Todas las rutas requieren autenticación y membresía al círculo
router.use(auth);
router.use(checkCircleMembership);

// Rutas de calendario
router.post('/', createEventValidation, calendarController.create);
router.get('/', calendarController.getAll);
router.get('/month/:year/:month', calendarController.getByMonth);
router.get('/:id', calendarController.getById);
router.put('/:id', calendarController.update);
router.delete('/:id', calendarController.delete);

module.exports = router;
