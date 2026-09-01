const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Etapas evolutivas de una mascota (Novato, Guerrero, Capitán, Legendario).
// Cada registro define la evolución que corresponde a partir de un nivel del jugador.
const MascotEvolution = sequelize.define('MascotEvolution', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  mascotId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // Nivel dentro de la mascota (1=Novato, 2=Guerrero, 3=Capitán, 4=Legendario)
  evolutionLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  evolutionName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  // Nivel mínimo del jugador para alcanzar esta evolución
  minLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  emoji: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
}, {
  indexes: [
    { unique: true, fields: ['mascotId', 'evolutionLevel'] },
  ],
});

module.exports = MascotEvolution;
