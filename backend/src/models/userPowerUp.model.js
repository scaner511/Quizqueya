const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Inventario de comodines de un usuario (cuántos tiene de cada tipo).
const UserPowerUp = sequelize.define('UserPowerUp', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  powerUpId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  indexes: [
    { unique: true, fields: ['userId', 'powerUpId'] },
  ],
});

module.exports = UserPowerUp;
