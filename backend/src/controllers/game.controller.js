const { Op } = require('sequelize');
const {
  sequelize,
  User,
  Question,
  Game,
  UserAnswer,
  Province,
  Mascot,
  Category,
  PowerUp,
  UserPowerUp,
} = require('../models');
const {
  MAX_LIVES,
  regenerateLives,
  nextLifeInfo,
  levelFromXp,
} = require('../services/progression');
const { difficultyForStreak } = require('../services/dificultad');
const { buildShuffledQuestion } = require('../services/opciones');
const { evolutionForLevel } = require('../services/evolution');

const SECONDS_PER_QUESTION = 30;

// Construye el payload de la pregunta que se muestra al usuario con las
// opciones mezcladas (orden aleatorio reproducible) y el correctIndex recalculado.
function questionPayload(game, question) {
  const shuffled = buildShuffledQuestion(
    question.options,
    question.correctIndex,
    game.id,
    game.totalQuestions,
  );
  return {
    id: question.id,
    type: question.type,
    text: question.text,
    options: shuffled.options,
    mediaUrl: question.mediaUrl,
    difficulty: question.difficulty,
    secondsPerQuestion: SECONDS_PER_QUESTION,
  };
}

// Determina XP según dificultad
function xpForDifficulty(difficulty, timeBonus) {
  const base = { facil: 10, media: 20, dificil: 35, experto: 50 }[difficulty] || 10;
  return base + timeBonus;
}

function pesosFor(difficulty) {
  return { facil: 5, media: 10, dificil: 15, experto: 25 }[difficulty] || 5;
}

// Inicia una nueva partida en una categoría
exports.startGame = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { categoryId } = req.body;

    // Verificar que haya vidas
    const user = await User.findByPk(userId);
    await regenerateLives(user);
    await user.save();

    if (user.lives <= 0) {
      const info = nextLifeInfo(user);
      return res.status(429).json({
        message: 'Sin vidas disponibles',
        lives: 0,
        nextLifeInMs: info.nextLifeInMs,
      });
    }

    // Crear partida activa
    const game = await Game.create({ userId, categoryId });

    // Cargar datos del jugador para el frontend
    const freshUser = await User.findByPk(userId, {
      include: [
        { association: 'province' },
        { association: 'mascot' },
      ],
    });

    return res.status(201).json({
      game,
      user: freshUser,
      secondsPerQuestion: SECONDS_PER_QUESTION,
    });
  } catch (err) {
    next(err);
  }
};

// Obtiene la siguiente pregunta de la partida usando dificultad adaptativa
exports.nextQuestion = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { gameId } = req.params;

    const game = await Game.findOne({
      where: { id: gameId, userId, status: 'activa' },
    });
    if (!game) {
      return res.status(404).json({ message: 'Partida no encontrada o finalizada' });
    }

    // Dificultad adaptativa según racha
    const difficulty = difficultyForStreak(game.correctStreak);
    game.currentDifficulty = difficulty;

    // Excluir preguntas ya respondidas en esta partida
    const answered = await UserAnswer.findAll({
      where: { userId },
      attributes: ['questionId'],
    });
    const answeredIds = answered.map((a) => a.questionId);

    const where = {
      categoryId: game.categoryId,
      difficulty,
      active: true,
    };
    if (answeredIds.length) {
      where.id = { [Op.notIn]: answeredIds };
    }

    const question = await Question.findOne({
      where,
      order: sequelize.random(),
    });

    if (!question) {
      // No hay más preguntas en esta dificultad; intentar cualquier pregunta sin responder
      const altWhere = { categoryId: game.categoryId, active: true };
      if (answeredIds.length) {
        altWhere.id = { [Op.notIn]: answeredIds };
      }
      const anyQuestion = await Question.findOne({
        where: altWhere,
        order: sequelize.random(),
      });
      if (!anyQuestion) {
        return res.status(404).json({ message: 'No hay más preguntas en esta categoría' });
      }
      await game.save();
      return res.json({
        game,
        question: questionPayload(game, anyQuestion),
      });
    }

    await game.save();
    return res.json({
      game,
      question: questionPayload(game, question),
    });
  } catch (err) {
    next(err);
  }
};

// Procesa la respuesta del usuario; devuelve el feedback y actualiza progresión
exports.answer = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { gameId } = req.params;
    const { questionId, selectedIndex, timeLeft } = req.body;

    const game = await Game.findOne({
      where: { id: gameId, userId, status: 'activa' },
    });
    if (!game) {
      return res.status(404).json({ message: 'Partida no encontrada o finalizada' });
    }

    const question = await Question.findByPk(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Pregunta no encontrada' });
    }

    const user = await User.findByPk(userId);
    await regenerateLives(user);

    // Regenerar el mismo orden mezclado que se mostró al usuario (misma semilla
    // basada en game.id y game.totalQuestions) y recalcular el índice correcto.
    const shuffled = buildShuffledQuestion(
      question.options,
      question.correctIndex,
      game.id,
      game.totalQuestions,
    );
    const correctIndex = shuffled.correctIndex;

    // Tiempo agotado => incorrecto y pierde una vida
    const timedOut = typeof timeLeft === 'number' && timeLeft <= 0;
    const isCorrect = !timedOut && selectedIndex === correctIndex;

    // Calcular bonificación por tiempo (0-40% extra sobre la XP base)
    const t = typeof timeLeft === 'number' ? Math.min(timeLeft, SECONDS_PER_QUESTION) : 0;
    const timeBonus = Math.round(xpForDifficulty(question.difficulty, 0) * (t / SECONDS_PER_QUESTION) * 0.4);
    let xpEarned = isCorrect ? xpForDifficulty(question.difficulty, timeBonus) : 0;
    const pesosEarned = isCorrect ? pesosFor(question.difficulty) : 0;

    // Comodín "multiplicador de XP": duplica la XP de esta respuesta y se desactiva
    const multiplierUsed = isCorrect && game.powerUpMult;
    if (multiplierUsed) {
      xpEarned *= 2;
      game.powerUpMult = false;
    }

    let livesLost = 0;
    if (!isCorrect && user.lives > 0) {
      // Pierde una vida al fallar (incluye agotar tiempo)
      user.lives = Math.max(0, user.lives - 1);
      livesLost = 1;
      if (user.lives === 0) {
        user.lastLifeLostAt = new Date();
      }
    }

    // Actualizar estadísticas y racha
    if (isCorrect) {
      game.correctStreak += 1;
      game.score += xpEarned;
      game.correctAnswers += 1;
      user.totalCorrect += 1;
      user.xp += xpEarned;
      user.pesos += pesosEarned;
    } else {
      game.correctStreak = 0;
      user.totalWrong += 1;
    }
    game.totalQuestions += 1;

    await UserAnswer.create({
      userId,
      questionId,
      selectedIndex: timedOut ? null : selectedIndex,
      isCorrect,
      timeLeft: timedOut ? 0 : t,
      xpEarned,
      pesosEarned,
    });

    // Actualizar racha de días
    const today = new Date();
    const todayStr = today.toDateString();
    const lastPlayed = user.lastPlayedAt ? new Date(user.lastPlayedAt).toDateString() : null;
    if (lastPlayed !== todayStr) {
      const yesterday = new Date(today.getTime() - 86400000).toDateString();
      if (lastPlayed === yesterday) {
        user.streakDays += 1;
      } else {
        user.streakDays = isCorrect ? 1 : Math.max(0, user.streakDays);
      }
      user.lastPlayedAt = today;
    }

    // Detectar subida de nivel (antes de guardar, calculamos el nivel previo desde el XP anterior)
    const prevLevelInfo = levelFromXp(user.xp - (isCorrect ? xpEarned : 0));
    const nextLevelInfo = levelFromXp(user.xp);
    const levelUp = nextLevelInfo.level > prevLevelInfo.level;

    await user.save();
    await game.save();

    // Devolver resultado con explicación
    return res.json({
      result: {
        isCorrect,
        timedOut,
        correctIndex,
        explanation: question.explanation,
        xpEarned,
        pesosEarned,
        selectedIndex: timedOut ? null : selectedIndex,
      },
      lives: user.lives,
      livesLost,
      nextLifeInMs: user.lives < MAX_LIVES && user.lastLifeLostAt
        ? nextLifeInfo(user).nextLifeInMs
        : 0,
      game: {
        id: game.id,
        correctStreak: game.correctStreak,
        currentDifficulty: game.currentDifficulty,
        score: game.score,
        totalQuestions: game.totalQuestions,
        correctAnswers: game.correctAnswers,
      },
      userStats: {
        xp: user.xp,
        pesos: user.pesos,
        streakDays: user.streakDays,
        level: nextLevelInfo.level,
        levelUp,
        totalCorrect: user.totalCorrect,
        totalWrong: user.totalWrong,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Aplica un comodín (power-up) durante la partida activa
exports.usePowerUp = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { gameId } = req.params;
    const { powerUpId, questionId } = req.body;

    const game = await Game.findOne({
      where: { id: gameId, userId, status: 'activa' },
    });
    if (!game) {
      return res.status(404).json({ message: 'Partida no encontrada o finalizada' });
    }

    const item = await PowerUp.findByPk(powerUpId);
    if (!item) {
      return res.status(404).json({ message: 'Comodín no disponible' });
    }

    // Verificar inventario del usuario
    const stash = await UserPowerUp.findOne({
      where: { userId, powerUpId, quantity: { [Op.gt]: 0 } },
    });
    if (!stash) {
      return res.status(400).json({ message: 'No tienes este comodín en tu inventario' });
    }

    // Para comodines que dependen de la pregunta actual, reconstruir el orden mezclado
    let shuffled = null;
    if (['eliminar_dos', 'pista'].includes(item.slug)) {
      if (!questionId) {
        return res.status(400).json({ message: 'Falta la pregunta actual' });
      }
      const question = await Question.findByPk(questionId);
      if (!question) {
        return res.status(404).json({ message: 'Pregunta no encontrada' });
      }
      shuffled = buildShuffledQuestion(
        question.options,
        question.correctIndex,
        game.id,
        game.totalQuestions,
      );
    }

    switch (item.slug) {
      case 'eliminar_dos': {
        const opts = shuffled.options.length;
        if (opts < 3) {
          return res.status(400).json({ message: 'La pregunta no tiene suficientes opciones' });
        }
        // Quitar 2 opciones incorrectas (distintas del correctIndex)
        const remove = [];
        for (let i = 0; i < opts && remove.length < 2; i++) {
          if (i !== shuffled.correctIndex) remove.push(i);
        }
        stash.quantity -= 1;
        await stash.save();
        return res.json({ type: 'eliminar_dos', removeIndices: remove });
      }
      case 'pista': {
        const correctText = shuffled.options[shuffled.correctIndex];
        stash.quantity -= 1;
        await stash.save();
        return res.json({
          type: 'pista',
          hint: typeof correctText === 'string' ? correctText.charAt(0) : '?',
        });
      }
      case 'mas_tiempo': {
        stash.quantity -= 1;
        await stash.save();
        return res.json({ type: 'mas_tiempo', extraSeconds: 15 });
      }
      case 'congelar': {
        stash.quantity -= 1;
        await stash.save();
        return res.json({ type: 'congelar', frozenQuestions: 3 });
      }
      case 'saltar': {
        // Salta la pregunta sin afectar racha ni vida
        game.totalQuestions += 1;
        await game.save();
        stash.quantity -= 1;
        await stash.save();
        return res.json({ type: 'saltar', skip: true });
      }
      case 'multiplicador_xp': {
        game.powerUpMult = true;
        await game.save();
        stash.quantity -= 1;
        await stash.save();
        return res.json({ type: 'multiplicador_xp', active: true });
      }
      default:
        return res.status(400).json({ message: 'Comodín no soportado' });
    }
  } catch (err) {
    next(err);
  }
};

// Termina la partida
exports.endGame = async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const game = await Game.findOne({
      where: { id: gameId, userId: req.userId, status: 'activa' },
    });
    if (!game) {
      return res.status(404).json({ message: 'Partida no encontrada o finalizada' });
    }
    game.status = 'terminada';
    await game.save();

    const user = await User.findByPk(req.userId);
    await regenerateLives(user);
    user.totalGames += 1;
    await user.save();

    return res.json({ game });
  } catch (err) {
    next(err);
  }
};

// Devuelve el estado actual del jugador (vidas, racha, nivel, pesos)
exports.playerState = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId, {
      include: [
        { association: 'province' },
        { association: 'mascot' },
      ],
    });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    await regenerateLives(user);
    await user.save();

    const info = nextLifeInfo(user);
    const { level } = levelFromXp(user.xp);
    const mascotEvolution = await evolutionForLevel(user.mascotId, level);

    return res.json({
      user: {
        id: user.id,
        nickname: user.nickname,
        level,
        xp: user.xp,
        pesos: user.pesos,
        lives: user.lives,
        maxLives: MAX_LIVES,
        streakDays: user.streakDays,
        province: user.province,
        mascot: user.mascot,
        mascotEvolution,
        totalCorrect: user.totalCorrect,
        totalWrong: user.totalWrong,
        totalGames: user.totalGames,
      },
      nextLifeInMs: info.nextLifeInMs,
      regenerating: info.regenerating,
    });
  } catch (err) {
    next(err);
  }
};
