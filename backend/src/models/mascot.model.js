const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Mascot = sequelize.define('Mascot', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  animal: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  // Nivel evolutivo: Novato, Guerrero, Capitán, Legendario
  evolutionLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  evolutionName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
});

module.exports = Mascot;
