const express = require('express');
const provinceController = require('../controllers/province.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// Ranking público
router.get('/leaderboard', provinceController.leaderboard);
router.get('/province-ranking', provinceController.provinceLeaderboard);

// Cambio de provincia (requiere auth)
router.post('/change-province', authMiddleware, provinceController.changeProvince);

module.exports = router;
