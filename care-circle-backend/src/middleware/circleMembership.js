const { CircleMember } = require('../models');

const checkCircleMembership = async (req, res, next) => {
  try {
    const circleId = req.params.circleId || req.body.circleId;
    const userId = req.userId;

    if (!circleId) {
      return res.status(400).json({
        success: false,
        message: 'ID del círculo es requerido.',
      });
    }

    const membership = await CircleMember.findOne({
      where: { circleId, userId },
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a este círculo.',
      });
    }

    req.membership = membership;
    req.circleId = parseInt(circleId);
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al verificar membresía.',
    });
  }
};

const checkCircleAdmin = async (req, res, next) => {
  try {
    const circleId = req.params.circleId || req.body.circleId;
    const userId = req.userId;

    const membership = await CircleMember.findOne({
      where: { circleId, userId },
    });

    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Se requieren permisos de administrador.',
      });
    }

    req.membership = membership;
    req.circleId = parseInt(circleId);
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al verificar permisos.',
    });
  }
};

module.exports = { checkCircleMembership, checkCircleAdmin };
