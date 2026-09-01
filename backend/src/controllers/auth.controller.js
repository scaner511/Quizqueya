const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User, Province, Mascot } = require('../models');
const { generateToken, sanitizeUser } = require('../services/auth.service');
const { levelFromXp } = require('../services/progression');
const { evolutionForLevel } = require('../services/evolution');

// Registro de nuevo jugador
// Campos requeridos: nickname, age, email, password, provinceId, mascotId
// Opcionales: country, city, profilePic
exports.register = async (req, res, next) => {
  try {
    const {
      nickname,
      age,
      email,
      password,
      provinceId,
      mascotId,
      country,
      city,
      profilePic,
    } = req.body;

    // Validar que la provincia exista
    const province = await Province.findByPk(provinceId);
    if (!province) {
      return res.status(400).json({ message: 'Provincia no válida' });
    }

    // Validar que la mascota exista
    const mascot = await Mascot.findByPk(mascotId);
    if (!mascot) {
      return res.status(400).json({ message: 'Mascota no válida' });
    }

    // Comprobar unicidad de nickname y email
    const existing = await User.findOne({
      where: {
        [Op.or]: [{ nickname }, { email }],
      },
    });
    if (existing) {
      if (existing.nickname === nickname) {
        return res.status(409).json({ message: 'El nickname ya está en uso' });
      }
      return res.status(409).json({ message: 'El correo ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      nickname,
      age,
      email,
      password: hashedPassword,
      provinceId,
      mascotId,
      country: country || 'República Dominicana',
      city: city || null,
      profilePic: profilePic || null,
      provinceChangedAt: new Date(),
    });

    const token = generateToken(user);
    return res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};

// Inicio de sesión por email + contraseña
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const token = generateToken(user);
    return res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};

// Obtener perfil del usuario autenticado con su provincia, mascota y nivel
exports.me = async (req, res, next) => {
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
    const { level } = levelFromXp(user.xp);
    const mascotEvolution = await evolutionForLevel(user.mascotId, level);
    const data = sanitizeUser(user);
    data.level = level;
    data.mascotEvolution = mascotEvolution;
    return res.json({ user: data });
  } catch (err) {
    next(err);
  }
};

// Actualizar perfil (nickname, ciudad, país, foto de perfil)
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { nickname, city, country, profilePic } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Si se cambia el nickname, verificar unicidad (excluyendo al propio usuario)
    if (nickname && nickname !== user.nickname) {
      const exists = await User.findOne({ where: { nickname } });
      if (exists) {
        return res.status(409).json({ message: 'El nickname ya está en uso' });
      }
      user.nickname = nickname;
    }
    if (typeof city === 'string') user.city = city;
    if (typeof country === 'string') user.country = country || 'República Dominicana';
    if (typeof profilePic === 'string') user.profilePic = profilePic;

    await user.save();

    const fresh = await User.findByPk(userId, {
      include: [{ association: 'province' }, { association: 'mascot' }],
    });
    const { level } = levelFromXp(fresh.xp);
    const data = sanitizeUser(fresh);
    data.level = level;
    return res.json({ user: data, message: 'Perfil actualizado' });
  } catch (err) {
    next(err);
  }
};

// Cambiar contraseña (requiere la contraseña actual)
exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Debes enviar la contraseña actual y la nueva' });
    }
    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'La contraseña actual es incorrecta' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    next(err);
  }
};
