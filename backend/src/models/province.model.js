const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Province = sequelize.define('Province', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  code: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true,
  },
  region: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  mascotId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  flagColor: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
});

module.exports = Province;
