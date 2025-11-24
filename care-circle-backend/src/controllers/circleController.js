const { Circle, CircleMember, User } = require('../models');
const { validationResult } = require('express-validator');

const circleController = {
  // Crear un nuevo círculo
  create: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const { name, patientName, displayName } = req.body;
      const userId = req.userId;

      // Crear el círculo
      const circle = await Circle.create({
        name,
        patientName,
        createdBy: userId,
      });

      // Agregar al creador como miembro admin
      await CircleMember.create({
        circleId: circle.id,
        userId,
        role: 'admin',
        displayName: displayName || req.user.name,
      });

      res.status(201).json({
        success: true,
        message: 'Círculo creado exitosamente.',
        data: {
          circle,
          code: circle.code,
        },
      });
    } catch (error) {
      console.error('Error al crear círculo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear círculo.',
      });
    }
  },

  // Unirse a un círculo existente
  join: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const { code, displayName } = req.body;
      const userId = req.userId;

      // Buscar el círculo por código
      const circle = await Circle.findOne({ where: { code: code.toUpperCase() } });
      if (!circle) {
        return res.status(404).json({
          success: false,
          message: 'Código de círculo inválido.',
        });
      }

      // Verificar si ya es miembro
      const existingMembership = await CircleMember.findOne({
        where: { circleId: circle.id, userId },
      });

      if (existingMembership) {
        return res.status(400).json({
          success: false,
          message: 'Ya eres miembro de este círculo.',
        });
      }

      // Agregar como miembro
      await CircleMember.create({
        circleId: circle.id,
        userId,
        role: 'member',
        displayName: displayName || req.user.name,
      });

      res.json({
        success: true,
        message: 'Te has unido al círculo exitosamente.',
        data: { circle },
      });
    } catch (error) {
      console.error('Error al unirse al círculo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al unirse al círculo.',
      });
    }
  },

  // Obtener todos los círculos del usuario
  getMyCircles: async (req, res) => {
    try {
      const userId = req.userId;

      const memberships = await CircleMember.findAll({
        where: { userId },
        include: [
          {
            model: Circle,
            as: 'circle',
            include: [
              {
                model: User,
                as: 'creator',
                attributes: ['id', 'name', 'email'],
              },
            ],
          },
        ],
      });

      const circles = memberships.map((m) => ({
        ...m.circle.toJSON(),
        myRole: m.role,
        myDisplayName: m.displayName,
        joinedAt: m.joinedAt,
      }));

      res.json({
        success: true,
        data: { circles },
      });
    } catch (error) {
      console.error('Error al obtener círculos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener círculos.',
      });
    }
  },

  // Obtener detalles de un círculo específico
  getById: async (req, res) => {
    try {
      const { circleId } = req.params;

      const circle = await Circle.findByPk(circleId, {
        include: [
          {
            model: CircleMember,
            as: 'members',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email'],
              },
            ],
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email'],
          },
        ],
      });

      if (!circle) {
        return res.status(404).json({
          success: false,
          message: 'Círculo no encontrado.',
        });
      }

      res.json({
        success: true,
        data: { circle },
      });
    } catch (error) {
      console.error('Error al obtener círculo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener círculo.',
      });
    }
  },

  // Salir de un círculo
  leave: async (req, res) => {
    try {
      const { circleId } = req.params;
      const userId = req.userId;

      const membership = await CircleMember.findOne({
        where: { circleId, userId },
      });

      if (!membership) {
        return res.status(404).json({
          success: false,
          message: 'No eres miembro de este círculo.',
        });
      }

      // Verificar si es el único admin
      if (membership.role === 'admin') {
        const adminCount = await CircleMember.count({
          where: { circleId, role: 'admin' },
        });

        if (adminCount === 1) {
          const memberCount = await CircleMember.count({
            where: { circleId },
          });

          if (memberCount > 1) {
            return res.status(400).json({
              success: false,
              message: 'Debes asignar otro administrador antes de salir.',
            });
          }
        }
      }

      await membership.destroy();

      // Si no quedan miembros, eliminar el círculo
      const remainingMembers = await CircleMember.count({ where: { circleId } });
      if (remainingMembers === 0) {
        await Circle.destroy({ where: { id: circleId } });
      }

      res.json({
        success: true,
        message: 'Has salido del círculo.',
      });
    } catch (error) {
      console.error('Error al salir del círculo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al salir del círculo.',
      });
    }
  },
};

module.exports = circleController;
