const sequelize = require('../config/database');
const User = require('./user.model');
const Province = require('./province.model');
const Category = require('./category.model');
const Question = require('./question.model');
const UserAnswer = require('./userAnswer.model');
const Game = require('./game.model');
const Mascot = require('./mascot.model');

// Usuario - Provincia
Province.hasMany(User, { foreignKey: 'provinceId', as: 'users' });
User.belongsTo(Province, { foreignKey: 'provinceId', as: 'province' });

// Usuario - Mascota
Mascot.hasMany(User, { foreignKey: 'mascotId', as: 'users' });
User.belongsTo(Mascot, { foreignKey: 'mascotId', as: 'mascot' });

// Usuario - Respuestas
User.hasMany(UserAnswer, { foreignKey: 'userId', as: 'answers' });
UserAnswer.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Pregunta - Respuestas
Question.hasMany(UserAnswer, { foreignKey: 'questionId', as: 'answers' });
UserAnswer.belongsTo(Question, { foreignKey: 'questionId', as: 'question' });

// Categoría - Preguntas
Category.hasMany(Question, { foreignKey: 'categoryId', as: 'questions' });
Question.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Usuario - Partidas
User.hasMany(Game, { foreignKey: 'userId', as: 'games' });
Game.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Categoría - Partidas
Category.hasMany(Game, { foreignKey: 'categoryId', as: 'games' });
Game.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

module.exports = {
  sequelize,
  User,
  Province,
  Category,
  Question,
  UserAnswer,
  Game,
  Mascot,
};
