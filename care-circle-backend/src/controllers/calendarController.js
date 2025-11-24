const { CalendarEvent, User } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

const calendarController = {
  // Crear evento
  create: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const { title, description, eventDate, eventEndDate, location, eventType, reminderTime } = req.body;
      const circleId = req.circleId;
      const userId = req.userId;

      const event = await CalendarEvent.create({
        circleId,
        title,
        description,
        eventDate,
        eventEndDate,
        location,
        eventType,
        reminderTime,
        createdBy: userId,
      });

      res.status(201).json({
        success: true,
        message: 'Evento creado exitosamente.',
        data: { event },
      });
    } catch (error) {
      console.error('Error al crear evento:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear evento.',
      });
    }
  },

  // Obtener todos los eventos de un círculo
  getAll: async (req, res) => {
    try {
      const circleId = req.circleId;
      const { startDate, endDate, eventType } = req.query;

      const whereClause = { circleId };

      // Filtrar por rango de fechas
      if (startDate && endDate) {
        whereClause.eventDate = {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        };
      } else if (startDate) {
        whereClause.eventDate = {
          [Op.gte]: new Date(startDate),
        };
      } else if (endDate) {
        whereClause.eventDate = {
          [Op.lte]: new Date(endDate),
        };
      }

      if (eventType) {
        whereClause.eventType = eventType;
      }

      const events = await CalendarEvent.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name'],
          },
        ],
        order: [['eventDate', 'ASC']],
      });

      res.json({
        success: true,
        data: { events },
      });
    } catch (error) {
      console.error('Error al obtener eventos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener eventos.',
      });
    }
  },

  // Obtener eventos por mes
  getByMonth: async (req, res) => {
    try {
      const circleId = req.circleId;
      const { year, month } = req.params;

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const events = await CalendarEvent.findAll({
        where: {
          circleId,
          eventDate: {
            [Op.between]: [startDate, endDate],
          },
        },
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name'],
          },
        ],
        order: [['eventDate', 'ASC']],
      });

      res.json({
        success: true,
        data: { events, year, month },
      });
    } catch (error) {
      console.error('Error al obtener eventos del mes:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener eventos.',
      });
    }
  },

  // Obtener un evento por ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const circleId = req.circleId;

      const event = await CalendarEvent.findOne({
        where: { id, circleId },
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name'],
          },
        ],
      });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado.',
        });
      }

      res.json({
        success: true,
        data: { event },
      });
    } catch (error) {
      console.error('Error al obtener evento:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener evento.',
      });
    }
  },

  // Actualizar evento
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const circleId = req.circleId;
      const { title, description, eventDate, eventEndDate, location, eventType, reminderTime } = req.body;

      const event = await CalendarEvent.findOne({
        where: { id, circleId },
      });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado.',
        });
      }

      await event.update({
        title: title || event.title,
        description: description !== undefined ? description : event.description,
        eventDate: eventDate || event.eventDate,
        eventEndDate: eventEndDate !== undefined ? eventEndDate : event.eventEndDate,
        location: location !== undefined ? location : event.location,
        eventType: eventType || event.eventType,
        reminderTime: reminderTime !== undefined ? reminderTime : event.reminderTime,
      });

      res.json({
        success: true,
        message: 'Evento actualizado.',
        data: { event },
      });
    } catch (error) {
      console.error('Error al actualizar evento:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar evento.',
      });
    }
  },

  // Eliminar evento
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const circleId = req.circleId;

      const event = await CalendarEvent.findOne({
        where: { id, circleId },
      });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado.',
        });
      }

      await event.destroy();

      res.json({
        success: true,
        message: 'Evento eliminado.',
      });
    } catch (error) {
      console.error('Error al eliminar evento:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar evento.',
      });
    }
  },
};

module.exports = calendarController;
