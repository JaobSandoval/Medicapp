const { sequelize } = require('../config/database');
const User = require('./User');
const Circle = require('./Circle');
const CircleMember = require('./CircleMember');
const Medication = require('./Medication');
const CalendarEvent = require('./CalendarEvent');
const Task = require('./Task');

// Relaciones User - Circle (creador)
User.hasMany(Circle, { foreignKey: 'createdBy', as: 'createdCircles' });
Circle.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// Relaciones Circle - CircleMember
Circle.hasMany(CircleMember, { foreignKey: 'circleId', as: 'members' });
CircleMember.belongsTo(Circle, { foreignKey: 'circleId', as: 'circle' });

// Relaciones User - CircleMember
User.hasMany(CircleMember, { foreignKey: 'userId', as: 'memberships' });
CircleMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Relaciones Circle - Medication
Circle.hasMany(Medication, { foreignKey: 'circleId', as: 'medications' });
Medication.belongsTo(Circle, { foreignKey: 'circleId', as: 'circle' });
User.hasMany(Medication, { foreignKey: 'createdBy', as: 'createdMedications' });
Medication.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// Relaciones Circle - CalendarEvent
Circle.hasMany(CalendarEvent, { foreignKey: 'circleId', as: 'calendarEvents' });
CalendarEvent.belongsTo(Circle, { foreignKey: 'circleId', as: 'circle' });
User.hasMany(CalendarEvent, { foreignKey: 'createdBy', as: 'createdEvents' });
CalendarEvent.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// Relaciones Circle - Task
Circle.hasMany(Task, { foreignKey: 'circleId', as: 'tasks' });
Task.belongsTo(Circle, { foreignKey: 'circleId', as: 'circle' });
User.hasMany(Task, { foreignKey: 'createdBy', as: 'createdTasks' });
Task.belongsTo(User, { foreignKey: 'createdBy', as: 'taskCreator' });
User.hasMany(Task, { foreignKey: 'assignedTo', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });

const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('✅ Base de datos sincronizada correctamente.');
  } catch (error) {
    console.error('❌ Error al sincronizar la base de datos:', error);
  }
};

module.exports = {
  sequelize,
  User,
  Circle,
  CircleMember,
  Medication,
  CalendarEvent,
  Task,
  syncDatabase,
};
