const express = require('express');
const router = express.Router({ mergeParams: true });
const { body } = require('express-validator');
const taskController = require('../controllers/taskController');
const { auth } = require('../middleware/auth');
const { checkCircleMembership } = require('../middleware/circleMembership');

// Validaciones
const createTaskValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('El título de la tarea es requerido.')
    .isLength({ max: 200 })
    .withMessage('El título no puede exceder 200 caracteres.'),
  body('description')
    .optional()
    .trim(),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de vencimiento inválida.'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Prioridad inválida.'),
  body('assignedTo')
    .optional()
    .isInt()
    .withMessage('ID de usuario asignado inválido.'),
];

const updateStatusValidation = [
  body('status')
    .notEmpty()
    .withMessage('El estado es requerido.')
    .isIn(['pending', 'in_progress', 'completed'])
    .withMessage('Estado inválido.'),
];

// Todas las rutas requieren autenticación y membresía al círculo
router.use(auth);
router.use(checkCircleMembership);

// Rutas de tareas
router.post('/', createTaskValidation, taskController.create);
router.get('/', taskController.getAll);
router.get('/my-tasks', taskController.getMyTasks);
router.get('/:id', taskController.getById);
router.put('/:id', taskController.update);
router.patch('/:id/status', updateStatusValidation, taskController.updateStatus);
router.delete('/:id', taskController.delete);

module.exports = router;
