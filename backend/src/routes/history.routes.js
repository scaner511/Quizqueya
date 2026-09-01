const express = require('express');
const historyController = require('../controllers/history.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', historyController.listHistory);
router.get('/:gameId', historyController.gameDetail);

module.exports = router;
