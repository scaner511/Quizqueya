const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // Tipo: opcion_multiple, verdadero_falso, completar, imagen, audio, emparejar, ordenar
  type: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'opcion_multiple',
  },
  // Dificultad: facil, media, dificil, experto
  difficulty: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'facil',
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  // Opciones de respuesta (array de strings en JSON)
  options: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  // Índice de la respuesta correcta en `options`
  correctIndex: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // Explicación educativa (se muestra al responder mal o agotar tiempo)
  explanation: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Enlace opcional a imagen/audio
  mediaUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  indexes: [
    { fields: ['categoryId'] },
    { fields: ['difficulty'] },
    { fields: ['active'] },
  ],
});

module.exports = Question;
