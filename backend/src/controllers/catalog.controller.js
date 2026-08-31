const { Province, Category, Mascot } = require('../models');

// Lista de provincias de República Dominicana (para registro y mapa)
exports.listProvinces = async (req, res, next) => {
  try {
    const provinces = await Province.findAll({ order: [['name', 'ASC']] });
    return res.json({ provinces });
  } catch (err) {
    next(err);
  }
};

// Lista de categorías
exports.listCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    return res.json({ categories });
  } catch (err) {
    next(err);
  }
};

// Lista de mascotas iniciales (nivel Novato, evolutionLevel = 1)
exports.listMascots = async (req, res, next) => {
  try {
    const mascots = await Mascot.findAll({
      where: { evolutionLevel: 1 },
      order: [['name', 'ASC']],
    });
    return res.json({ mascots });
  } catch (err) {
    next(err);
  }
};
