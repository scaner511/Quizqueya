const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { User } = require('../models');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, nickname: user.nickname, email: user.email },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn },
  );
}

function sanitizeUser(user) {
  const { password, ...rest } = user.toJSON();
  return rest;
}

module.exports = { generateToken, sanitizeUser };
