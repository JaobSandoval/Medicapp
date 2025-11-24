const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const circleRoutes = require('./circles');
const medicationRoutes = require('./medications');
const calendarRoutes = require('./calendar');
const taskRoutes = require('./tasks');

// Rutas base
router.use('/auth', authRoutes);
router.use('/circles', circleRoutes);

// Rutas anidadas bajo círculos
router.use('/circles/:circleId/medications', medicationRoutes);
router.use('/circles/:circleId/calendar', calendarRoutes);
router.use('/circles/:circleId/tasks', taskRoutes);

// Ruta de salud
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API funcionando correctamente.',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
