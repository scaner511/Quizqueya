// Utilidades para mezclar (barajar) las opciones de una pregunta de forma
// reproducible con una semilla. Se usa para que las respuestas no salgan
// siempre en la misma posición y para que el backend pueda regenerar el mismo
// orden al validar la respuesta del usuario.

// PRNG determinista (mulberry32) basado en semilla numérica
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Baraja el array `arr` usando la semilla `seed` (Fisher-Yates determinista).
// Devuelve la copia mezclada.
function seededShuffle(arr, seed) {
  const a = arr.slice();
  const rand = mulberry32(seed);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Mezcla las opciones de la pregunta y recalcula el índice correcto.
// Recibe: options (array original), correctIndex (índice en el array original),
// gameId y questionNum (número de pregunta dentro de la partida) para armar la semilla.
// Devuelve { options: [...mezcladas], correctIndex: nuevaPosición }
function buildShuffledQuestion(options, correctIndex, gameId, questionNum) {
  if (!Array.isArray(options)) {
    return { options: options || [], correctIndex };
  }
  // Semilla reproducible: combina gameId, el índice de pregunta y correctIndex
  const seed = (gameId * 7919 + questionNum * 104729 + correctIndex * 31) >>> 0;
  const indices = options.map((_, i) => i);
  const shuffledIndices = seededShuffle(indices, seed);
  const shuffledOptions = shuffledIndices.map((i) => options[i]);
  const newCorrect = shuffledIndices.indexOf(correctIndex);
  return { options: shuffledOptions, correctIndex: newCorrect };
}

module.exports = {
  seededShuffle,
  buildShuffledQuestion,
};
