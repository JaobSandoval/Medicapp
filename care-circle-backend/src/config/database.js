const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './care_circle.sqlite',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log(' Conexión a SQLite establecida correctamente.');
  } catch (error) {
    console.error(' Error al conectar con la base de datos:', error);
  }
};

module.exports = { sequelize, testConnection };