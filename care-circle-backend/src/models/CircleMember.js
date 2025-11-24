const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CircleMember = sequelize.define('CircleMember', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  circleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'circles',
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  role: {
    type: DataTypes.STRING(10),
    defaultValue: 'member',
    validate: {
      isIn: [['admin', 'member']]
    }
  },
  displayName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  joinedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'circle_members',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['circleId', 'userId'],
    },
  ],
});

module.exports = CircleMember;