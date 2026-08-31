const { User } = require('../models');

// Tiempo de regeneración por cada vida (en minutos), indexado desde la 5ta hacia abajo
// Vida 1: 25 min, Vida 2: 30 min, Vida 3: 35 min, Vida 4: 40 min, Vida 5: 45 min
const LIFE_REGEN_MINUTES = [25, 30, 35, 40, 45];
const MAX_LIVES = 5;

// Umbral de nivel: XP necesaria por nivel (acumulativo básico)
function xpForLevel(level) {
  return level * 100;
}

function levelFromXp(xp) {
  let level = 1;
  let remaining = xp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level += 1;
  }
  return { level, remaining };
}

// Aplica regeneración de vidas basada en el tiempo transcurrido.
// Cada vida perdida tiene su propio temporizador. Recalcula las vidas disponibles.
async function regenerateLives(user) {
  if (user.lives >= MAX_LIVES) {
    user.lastLifeLostAt = null;
    return user;
  }
  if (!user.lastLifeLostAt) {
    return user;
  }

  const now = Date.now();
  const elapsedMs = now - new Date(user.lastLifeLostAt).getTime();
  const lost = MAX_LIVES - user.lives;

  // Sumar minutos de cada vida perdida
  let needMs = 0;
  for (let i = 0; i < lost; i++) {
    // La vida perdida más reciente usa el índice más bajo
    needMs += LIFE_REGEN_MINUTES[i] * 60 * 1000;
  }

  if (elapsedMs >= needMs) {
    // Se regeneró todo
    user.lives = MAX_LIVES;
    user.lastLifeLostAt = null;
  } else {
    // Calcular cuántas vidas se recuperaron parcialmente
    let remainingElapsed = elapsedMs;
    let recovered = 0;
    for (let i = 0; i < lost; i++) {
      const thisLifeMs = LIFE_REGEN_MINUTES[i] * 60 * 1000;
      if (remainingElapsed >= thisLifeMs) {
        remainingElapsed -= thisLifeMs;
        recovered += 1;
      }
    }
    user.lives = Math.min(MAX_LIVES, user.lives + recovered);
    if (recovered > 0) {
      user.lastLifeLostAt = new Date(now - remainingElapsed);
    }
  }

  return user;
}

// Devuelve el tiempo restante (ms) hasta la próxima vida y la vida que se está regenerando
function nextLifeInfo(user) {
  if (user.lives >= MAX_LIVES) return { nextLifeInMs: 0, regenerating: 0 };
  if (!user.lastLifeLostAt) return { nextLifeInMs: 0, regenerating: 0 };

  const now = Date.now();
  const elapsedMs = now - new Date(user.lastLifeLostAt).getTime();
  const lost = MAX_LIVES - user.lives;
  // La vida que se está regenerando es la más reciente perdida (índice lost-1)
  let cumulativeRemaining = 0;
  for (let i = 0; i < lost; i++) {
    cumulativeRemaining += LIFE_REGEN_MINUTES[i] * 60 * 1000;
  }
  const remainingMs = Math.max(0, cumulativeRemaining - elapsedMs);
  return { nextLifeInMs: remainingMs, regenerating: lost };
}

module.exports = {
  MAX_LIVES,
  LIFE_REGEN_MINUTES,
  regenerateLives,
  nextLifeInfo,
  levelFromXp,
  xpForLevel,
};
