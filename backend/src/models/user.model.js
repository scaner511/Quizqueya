const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nickname: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 6, max: 120 },
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  profilePic: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  provinceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  mascotId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // Fecha del último cambio de provincia (restringido a 90 días)
  provinceChangedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // Progresión
  xp: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  // Moneda del juego
  pesos: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100,
  },
  // Sistema de vidas (máx 5)
  lives: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5,
  },
  lastLifeLostAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // Rachas en días
  streakDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  lastPlayedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // Estadísticas
  totalCorrect: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  totalWrong: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  totalGames: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
});

module.exports = User;
