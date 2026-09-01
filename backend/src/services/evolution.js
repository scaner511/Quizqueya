const { Mascot, MascotEvolution } = require('../models');

// Devuelve la evolución de la mascota que corresponde al nivel del jugador.
// Si no hay evolución definida, devuelve null (se mostrará la base).
async function evolutionForLevel(mascotId, level) {
  if (!mascotId || !level) return null;
  const evolutions = await MascotEvolution.findAll({
    where: { mascotId },
    order: [['minLevel', 'DESC']],
  });
  if (!evolutions.length) return null;
  // Elegir la evolución de mayor minLevel que el jugador ya alcanzó
  return evolutions.find((e) => level >= e.minLevel) || evolutions[evolutions.length - 1];
}

module.exports = { evolutionForLevel };
