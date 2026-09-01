const { PowerUp, UserPowerUp, User } = require('../models');

// Lista los comodines disponibles en la tienda
exports.listItems = async (req, res, next) => {
  try {
    const items = await PowerUp.findAll({ where: { active: true }, order: [['price', 'ASC']] });
    return res.json({ items });
  } catch (err) {
    next(err);
  }
};

// Devuelve el inventario de comodines del usuario (con cantidad)
exports.inventory = async (req, res, next) => {
  try {
    const rows = await UserPowerUp.findAll({
      where: { userId: req.userId, quantity: { [require('sequelize').Op.gt]: 0 } },
      include: [{ association: 'powerUp' }],
    });
    const inventory = rows.map((r) => ({
      powerUpId: r.powerUpId,
      slug: r.powerUp.slug,
      name: r.powerUp.name,
      type: r.powerUp.type,
      emoji: r.powerUp.emoji,
      quantity: r.quantity,
    }));
    return res.json({ inventory });
  } catch (err) {
    next(err);
  }
};

// Compra un comodín restando Pesos Quizqueya
exports.buy = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { powerUpId, quantity = 1 } = req.body;

    const item = await PowerUp.findByPk(powerUpId);
    if (!item || !item.active) {
      return res.status(404).json({ message: 'Comodín no disponible' });
    }

    const qty = Math.max(1, Math.min(99, Math.floor(quantity)));
    const total = item.price * qty;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    if (user.pesos < total) {
      return res.status(400).json({
        message: `No tienes suficientes Pesos. Necesitas ${total} y tienes ${user.pesos}.`,
        pesos: user.pesos,
        needed: total,
      });
    }

    user.pesos -= total;
    await user.save();

    const [row] = await UserPowerUp.findOrCreate({
      where: { userId, powerUpId: item.id },
      defaults: { quantity: 0 },
    });
    row.quantity += qty;
    await row.save();

    const fresh = await User.findByPk(userId, { attributes: ['id', 'pesos'] });
    return res.json({
      message: `Comprado: ${qty} x ${item.name}`,
      pesos: fresh.pesos,
      updatedPowerUp: {
        powerUpId: item.id,
        slug: item.slug,
        name: item.name,
        quantity: row.quantity,
      },
    });
  } catch (err) {
    next(err);
  }
};
