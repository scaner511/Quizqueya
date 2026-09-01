const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Una partida activa con racha de respuestas correctas y dificultad adaptativa
const Game = sequelize.define('Game', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'activa', // activa | terminada
  },
  // Racha de respuestas correctas consecutivas (para dificultad adaptativa)
  correctStreak: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  // Dificultad actual determinada por la racha
  currentDifficulty: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'facil',
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  totalQuestions: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  correctAnswers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  // Comodín "multiplicador de XP" activo para la siguiente respuesta
  powerUpMult: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  indexes: [
    { fields: ['userId'] },
    { fields: ['status'] },
  ],
});

module.exports = Game;
