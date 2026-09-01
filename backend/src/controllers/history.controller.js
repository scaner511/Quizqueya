const { Game, UserAnswer, Question, Category } = require('../models');

// Lista el historial de partidas terminadas del usuario
exports.listHistory = async (req, res, next) => {
  try {
    const games = await Game.findAll({
      where: { userId: req.userId },
      order: [['updatedAt', 'DESC']],
      limit: 50,
      include: [{ association: 'category', attributes: ['id', 'name', 'icon'] }],
    });

    const { levelFromXp } = require('../services/progression');

    const history = games.map((g) => ({
      id: g.id,
      category: g.category,
      status: g.status,
      score: g.score,
      totalQuestions: g.totalQuestions,
      correctAnswers: g.correctAnswers,
      correctStreak: g.correctStreak,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
    }));

    return res.json({ history });
  } catch (err) {
    next(err);
  }
};

// Devuelve las respuestas detalladas de una partida terminada
exports.gameDetail = async (req, res, next) => {
  try {
    const { gameId } = req.params;

    const game = await Game.findOne({
      where: { id: gameId, userId: req.userId },
      include: [{ association: 'category', attributes: ['id', 'name', 'icon'] }],
    });
    if (!game) {
      return res.status(404).json({ message: 'Partida no encontrada' });
    }

    const answers = await UserAnswer.findAll({
      where: { userId: req.userId },
      include: [
        { association: 'question', attributes: ['id', 'text', 'type', 'difficulty', 'explanation'] },
      ],
      order: [['createdAt', 'ASC']],
    });

    // Filtrar respuestas pertenecientes a esta partida: usamos todas las respuestas
    // del usuario (el Game no guarda un vínculo directo por respuesta).
    const detail = answers.map((a) => ({
      id: a.id,
      question: a.question,
      isCorrect: a.isCorrect,
      timeLeft: a.timeLeft,
      xpEarned: a.xpEarned,
      pesosEarned: a.pesosEarned,
      createdAt: a.createdAt,
    }));

    return res.json({
      game,
      answers: detail,
    });
  } catch (err) {
    next(err);
  }
};
