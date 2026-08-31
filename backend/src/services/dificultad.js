// Dificultad adaptativa según la racha de respuestas correctas consecutivas.
// Preguntas 1-5: Fácil | 6-10: Fácil+ (facil) | 11-15: Media | 16-20: Media+ (media)
// 21-25: Difícil | 26-30: Difícil+ (dificil) | 31+: Experto
const DIFFICULTY_LEVELS = ['facil', 'media', 'dificil', 'experto'];

function difficultyForStreak(streak) {
  if (streak >= 31) return 'experto';
  if (streak >= 21) return 'dificil';
  if (streak >= 16) return 'media';
  if (streak >= 11) return 'media';
  if (streak >= 6) return 'facil';
  return 'facil';
}

// Ajuste de dificultad personalizado por edad
function ageDifficultyBias(age) {
  if (age <= 10) return -1; // más fácil
  if (age <= 15) return -0.5;
  if (age <= 25) return 0;
  if (age <= 40) return 0.5;
  return 0; // Mixto inteligente (41+)
}

module.exports = {
  DIFFICULTY_LEVELS,
  difficultyForStreak,
  ageDifficultyBias,
};
