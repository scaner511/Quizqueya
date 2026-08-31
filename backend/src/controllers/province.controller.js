const { Op } = require('sequelize');
const { User, Province, Game } = require('../models');

const CHANGE_COOLDOWN_DAYS = 90;

// Ranking global de jugadores por XP
exports.leaderboard = async (req, res, next) => {
  try {
    const users = await User.findAll({
      order: [['xp', 'DESC']],
      limit: 100,
      include: [{ association: 'province' }, { association: 'mascot' }],
      attributes: ['id', 'nickname', 'xp', 'level', 'streakDays', 'provinceId', 'mascotId'],
    });

    // Nivel no está en el modelo; lo calculamos aquí
    const { levelFromXp } = require('../services/progression');
    const ranked = users.map((u, i) => ({
      rank: i + 1,
      id: u.id,
      nickname: u.nickname,
      xp: u.xp,
      level: levelFromXp(u.xp).level,
      streakDays: u.streakDays,
      province: u.province,
      mascot: u.mascot,
    }));

    return res.json({ ranking: ranked });
  } catch (err) {
    next(err);
  }
};

// Ranking por provincia (puntos acumulados de sus jugadores)
exports.provinceLeaderboard = async (req, res, next) => {
  try {
    const provinces = await Province.findAll({
      attributes: ['id', 'name', 'code', 'region', 'flagColor'],
    });

    const result = [];
    for (const p of provinces) {
      const users = await User.findAll({ where: { provinceId: p.id }, attributes: ['xp'] });
      const players = users.length;
      const totalXp = users.reduce((sum, u) => sum + u.xp, 0);
      result.push({
        provinceId: p.id,
        name: p.name,
        code: p.code,
        region: p.region,
        flagColor: p.flagColor,
        players,
        totalXp,
      });
    }

    result.sort((a, b) => b.totalXp - a.totalXp);
    const ranked = result.map((p, i) => ({ rank: i + 1, ...p }));

    return res.json({ ranking: ranked });
  } catch (err) {
    next(err);
  }
};

// Cambio de provincia (restringido a cada 90 días)
exports.changeProvince = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { provinceId } = req.body;

    const province = await Province.findByPk(provinceId);
    if (!province) {
      return res.status(400).json({ message: 'Provincia no válida' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (user.provinceId === provinceId) {
      return res.status(400).json({ message: 'Ya representas esta provincia' });
    }

    // Verificar restricción de 90 días
    const now = new Date();
    if (user.provinceChangedAt) {
      const cooldownMs = CHANGE_COOLDOWN_DAYS * 86400000;
      const elapsed = now - new Date(user.provinceChangedAt).getTime();
      if (elapsed < cooldownMs) {
        const daysLeft = Math.ceil((cooldownMs - elapsed) / 86400000);
        return res.status(429).json({
          message: `Solo puedes cambiar de provincia cada 90 días. Te faltan ${daysLeft} días.`,
          daysLeft,
        });
      }
    }

    user.provinceId = provinceId;
    user.provinceChangedAt = now;
    await user.save();

    const fresh = await User.findByPk(userId, { include: [{ association: 'province' }] });
    return res.json({ user: fresh, message: 'Provincia actualizada' });
  } catch (err) {
    next(err);
  }
};

module.exports.CHANGE_COOLDOWN_DAYS = CHANGE_COOLDOWN_DAYS;
