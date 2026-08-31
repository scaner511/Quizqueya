const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Registro de cada respuesta que da un usuario a una pregunta
const UserAnswer = sequelize.define('UserAnswer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  questionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // Índice elegido por el usuario
  selectedIndex: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  isCorrect: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  // Tiempo restante en segundos (para puntuación)
  timeLeft: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  // XP ganada en esta respuesta
  xpEarned: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  // Pesos ganados
  pesosEarned: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  indexes: [
    { fields: ['userId'] },
    { fields: ['questionId'] },
  ],
});

module.exports = UserAnswer;
