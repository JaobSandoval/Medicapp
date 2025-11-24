const { Task, User } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

const taskController = {
  // Crear tarea
  create: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const { title, description, dueDate, priority, assignedTo } = req.body;
      const circleId = req.circleId;
      const userId = req.userId;

      const task = await Task.create({
        circleId,
        title,
        description,
        dueDate,
        priority,
        assignedTo,
        createdBy: userId,
      });

      const taskWithDetails = await Task.findByPk(task.id, {
        include: [
          { model: User, as: 'taskCreator', attributes: ['id', 'name'] },
          { model: User, as: 'assignee', attributes: ['id', 'name'] },
        ],
      });

      res.status(201).json({
        success: true,
        message: 'Tarea creada exitosamente.',
        data: { task: taskWithDetails },
      });
    } catch (error) {
      console.error('Error al crear tarea:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear tarea.',
      });
    }
  },

  // Obtener todas las tareas de un círculo
  getAll: async (req, res) => {
    try {
      const circleId = req.circleId;
      const { status, priority, assignedTo } = req.query;

      const whereClause = { circleId };

      if (status) {
        whereClause.status = status;
      }
      if (priority) {
        whereClause.priority = priority;
      }
      if (assignedTo) {
        whereClause.assignedTo = assignedTo;
      }

      const tasks = await Task.findAll({
        where: whereClause,
        include: [
          { model: User, as: 'taskCreator', attributes: ['id', 'name'] },
          { model: User, as: 'assignee', attributes: ['id', 'name'] },
        ],
        order: [
          ['status', 'ASC'],
          ['priority', 'DESC'],
          ['dueDate', 'ASC'],
        ],
      });

      res.json({
        success: true,
        data: { tasks },
      });
    } catch (error) {
      console.error('Error al obtener tareas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener tareas.',
      });
    }
  },

  // Obtener mis tareas asignadas
  getMyTasks: async (req, res) => {
    try {
      const circleId = req.circleId;
      const userId = req.userId;

      const tasks = await Task.findAll({
        where: {
          circleId,
          assignedTo: userId,
        },
        include: [
          { model: User, as: 'taskCreator', attributes: ['id', 'name'] },
        ],
        order: [
          ['status', 'ASC'],
          ['priority', 'DESC'],
          ['dueDate', 'ASC'],
        ],
      });

      res.json({
        success: true,
        data: { tasks },
      });
    } catch (error) {
      console.error('Error al obtener mis tareas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener tareas.',
      });
    }
  },

  // Obtener una tarea por ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const circleId = req.circleId;

      const task = await Task.findOne({
        where: { id, circleId },
        include: [
          { model: User, as: 'taskCreator', attributes: ['id', 'name'] },
          { model: User, as: 'assignee', attributes: ['id', 'name'] },
        ],
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Tarea no encontrada.',
        });
      }

      res.json({
        success: true,
        data: { task },
      });
    } catch (error) {
      console.error('Error al obtener tarea:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener tarea.',
      });
    }
  },

  // Actualizar tarea
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const circleId = req.circleId;
      const { title, description, dueDate, priority, status, assignedTo } = req.body;

      const task = await Task.findOne({
        where: { id, circleId },
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Tarea no encontrada.',
        });
      }

      const updateData = {
        title: title || task.title,
        description: description !== undefined ? description : task.description,
        dueDate: dueDate !== undefined ? dueDate : task.dueDate,
        priority: priority || task.priority,
        status: status || task.status,
        assignedTo: assignedTo !== undefined ? assignedTo : task.assignedTo,
      };

      // Si se marca como completada, guardar la fecha
      if (status === 'completed' && task.status !== 'completed') {
        updateData.completedAt = new Date();
      } else if (status !== 'completed') {
        updateData.completedAt = null;
      }

      await task.update(updateData);

      const updatedTask = await Task.findByPk(task.id, {
        include: [
          { model: User, as: 'taskCreator', attributes: ['id', 'name'] },
          { model: User, as: 'assignee', attributes: ['id', 'name'] },
        ],
      });

      res.json({
        success: true,
        message: 'Tarea actualizada.',
        data: { task: updatedTask },
      });
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar tarea.',
      });
    }
  },

  // Cambiar estado de tarea
  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const circleId = req.circleId;
      const { status } = req.body;

      const task = await Task.findOne({
        where: { id, circleId },
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Tarea no encontrada.',
        });
      }

      const updateData = { status };

      if (status === 'completed') {
        updateData.completedAt = new Date();
      } else {
        updateData.completedAt = null;
      }

      await task.update(updateData);

      res.json({
        success: true,
        message: 'Estado de tarea actualizado.',
        data: { task },
      });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar estado.',
      });
    }
  },

  // Eliminar tarea
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const circleId = req.circleId;

      const task = await Task.findOne({
        where: { id, circleId },
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Tarea no encontrada.',
        });
      }

      await task.destroy();

      res.json({
        success: true,
        message: 'Tarea eliminada.',
      });
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar tarea.',
      });
    }
  },
};

module.exports = taskController;
