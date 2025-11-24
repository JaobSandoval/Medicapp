const { Medication, User } = require('../models');
const { validationResult } = require('express-validator');

const medicationController = {
  // Crear medicamento
  create: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const { name, dosage, frequency, instructions, startDate, endDate } = req.body;
      const circleId = req.circleId;
      const userId = req.userId;

      const medication = await Medication.create({
        circleId,
        name,
        dosage,
        frequency,
        instructions,
        startDate,
        endDate,
        createdBy: userId,
      });

      res.status(201).json({
        success: true,
        message: 'Medicamento agregado exitosamente.',
        data: { medication },
      });
    } catch (error) {
      console.error('Error al crear medicamento:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear medicamento.',
      });
    }
  },

  // Obtener todos los medicamentos de un círculo
  getAll: async (req, res) => {
    try {
      const circleId = req.circleId;
      const { active } = req.query;

      const whereClause = { circleId };
      if (active !== undefined) {
        whereClause.isActive = active === 'true';
      }

      const medications = await Medication.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      res.json({
        success: true,
        data: { medications },
      });
    } catch (error) {
      console.error('Error al obtener medicamentos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener medicamentos.',
      });
    }
  },

  // Obtener un medicamento por ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const circleId = req.circleId;

      const medication = await Medication.findOne({
        where: { id, circleId },
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name'],
          },
        ],
      });

      if (!medication) {
        return res.status(404).json({
          success: false,
          message: 'Medicamento no encontrado.',
        });
      }

      res.json({
        success: true,
        data: { medication },
      });
    } catch (error) {
      console.error('Error al obtener medicamento:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener medicamento.',
      });
    }
  },

  // Actualizar medicamento
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const circleId = req.circleId;
      const { name, dosage, frequency, instructions, startDate, endDate, isActive } = req.body;

      const medication = await Medication.findOne({
        where: { id, circleId },
      });

      if (!medication) {
        return res.status(404).json({
          success: false,
          message: 'Medicamento no encontrado.',
        });
      }

      await medication.update({
        name: name || medication.name,
        dosage: dosage !== undefined ? dosage : medication.dosage,
        frequency: frequency !== undefined ? frequency : medication.frequency,
        instructions: instructions !== undefined ? instructions : medication.instructions,
        startDate: startDate !== undefined ? startDate : medication.startDate,
        endDate: endDate !== undefined ? endDate : medication.endDate,
        isActive: isActive !== undefined ? isActive : medication.isActive,
      });

      res.json({
        success: true,
        message: 'Medicamento actualizado.',
        data: { medication },
      });
    } catch (error) {
      console.error('Error al actualizar medicamento:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar medicamento.',
      });
    }
  },

  // Eliminar medicamento
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const circleId = req.circleId;

      const medication = await Medication.findOne({
        where: { id, circleId },
      });

      if (!medication) {
        return res.status(404).json({
          success: false,
          message: 'Medicamento no encontrado.',
        });
      }

      await medication.destroy();

      res.json({
        success: true,
        message: 'Medicamento eliminado.',
      });
    } catch (error) {
      console.error('Error al eliminar medicamento:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar medicamento.',
      });
    }
  },
};

module.exports = medicationController;
