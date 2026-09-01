const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Comodín / objeto comprable en la tienda con Pesos Quizqueya.
// type: eliminar_dos, congelar, mas_tiempo, saltar, multiplicador_xp, pista
const PowerUp = sequelize.define('PowerUp', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  slug: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  // Precio en Pesos Quizqueya
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  emoji: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

module.exports = PowerUp;
