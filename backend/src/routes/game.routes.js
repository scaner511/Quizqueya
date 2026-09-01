const express = require('express');
const gameController = require('../controllers/game.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/state', gameController.playerState);
router.post('/games', gameController.startGame);
router.get('/games/:gameId/question', gameController.nextQuestion);
router.post('/games/:gameId/answer', gameController.answer);
router.post('/games/:gameId/powerup', gameController.usePowerUp);
router.post('/games/:gameId/end', gameController.endGame);

module.exports = router;
