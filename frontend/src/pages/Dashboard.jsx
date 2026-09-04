import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  Paid as PaidIcon,
  LocalFireDepartment as FireIcon,
  SportsEsports as PlayIcon,
  Casino as WheelIcon,
  CardGiftcard as GiftIcon,
  EmojiEvents as TrophyIcon,
  WorkspacePremium as MedalIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/client';
import GameBackground from '../components/game/GameBackground';
import Pet from '../components/game/Pet';

function xpForLevel(level) {
  return level * 100;
}

// Rangos derivados del nivel del jugador (presentacional, no altera el backend)
function rankForLevel(level) {
  if (level <= 3) return { name: 'Curioso Quisqueyano', icon: '🌱' };
  if (level <= 7) return { name: 'Explorador del Caribe', icon: '🧭' };
  if (level <= 12) return { name: 'Guardián de la Historia', icon: '🛡️' };
  if (level <= 20) return { name: 'Campeón Dominicano', icon: '🏅' };
  return { name: 'Leyenda Quisqueyana', icon: '👑' };
}

// Mapeo de categorías a nombres e iconos dominicanos (por slug, orden estable)
const CATEGORY_MAP = [
  { slug: 'historia-dominicana', label: 'Historia Dominicana', emoji: '🇩🇴' },
  { slug: 'provincias', label: 'Provincias', emoji: '🏛' },
  { slug: 'musica-dominicana', label: 'Música Dominicana', emoji: '🎵' },
  { slug: 'deportes', label: 'Deportes', emoji: '⚾' },
  { slug: 'gastronomia', label: 'Gastronomía', emoji: '🍽' },
  { slug: 'cultura-dominicana', label: 'Cultura Popular', emoji: '🎭' },
  { slug: 'personajes-historicos', label: 'Personajes Históricos', emoji: '📖' },
  { slug: 'geografia', label: 'Geografía Dominicana', emoji: '🏝' },
];

function CategoryWheel({ categories, onPick }) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);

  const SIZE = 306;
  const R = SIZE / 2;
  const dist = R - 40; // radio medio de las casillas (iconos)
  const segAngle = 360 / Math.max(1, categories.length);
  const COLORS = ['#E11D2A', '#1E4FAF'];

  let stops = '';
  categories.forEach((_, i) => {
    const c1 = COLORS[i % 2];
    const a0 = i * segAngle;
    const a1 = (i + 1) * segAngle;
    stops += `${c1} ${a0}deg ${a1}deg${i < categories.length - 1 ? ',' : ''}`;
  });

  const pos = (index) => {
    const angle = (index * segAngle + segAngle / 2) * (Math.PI / 180);
    return {
      left: R + dist * Math.cos(angle),
      top: R + dist * Math.sin(angle),
    };
  };

  const spin = () => {
    if (spinning || categories.length === 0) return;
    const targetIndex = Math.floor(Math.random() * categories.length);
    const offset = -90;
    const targetAngle = offset - (targetIndex * segAngle + segAngle / 2);
    const fullTurns = 6 * 360;
    setRotation((prev) => prev + (fullTurns + ((((targetAngle - prev) % 360) + 360) % 360)));
    setSpinning(true);
    setTimeout(() => {
      setSpinning(false);
      const cat = categories[targetIndex];
      if (cat) onPick(cat.id);
    }, 2300);
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Box
        sx={{
          position: 'relative',
          width: SIZE,
          height: SIZE,
          mx: 'auto',
          borderRadius: '50%',
          background: `conic-gradient(${stops})`,
          border: '7px solid #FFC10D',
          outline: '3px solid rgba(255,255,255,0.5)',
          outlineOffset: 5,
          boxShadow: '0 18px 50px rgba(0,0,0,0.6), inset 0 0 30px rgba(255,255,255,0.15)',
        }}
      >
        {/* Capa giratoria */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 2.3s cubic-bezier(0.15, 0.9, 0.25, 1)' : 'transform 0.3s ease',
          }}
        >
          {/* separadores blancos */}
          {categories.map((_, i) => {
            const a = i * segAngle;
            return (
              <Box
                key={`sep-${i}`}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: 3,
                  height: R - 8,
                  background: 'rgba(255,255,255,0.6)',
                  transform: `translate(-50%,-50%) rotate(${a}deg)`,
                  transformOrigin: 'center',
                }}
              />
            );
          })}
          {/* iconos de cada categoría */}
          {categories.map((cat, i) => {
            const { left, top } = pos(i);
            return (
              <Box key={cat.id} sx={{ position: 'absolute', left, top, transform: 'translate(-50%,-50%)', zIndex: 1 }}>
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 50% 30%, #FFD75E, #FFC10D 70%)',
                    border: '2px solid #fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 5px 12px rgba(0,0,0,0.5)',
                  }}
                >
                  <Box sx={{ fontSize: 23, lineHeight: 1 }}>{cat.emoji}</Box>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Fijador (puntero arriba) */}
        <Box sx={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', zIndex: 4 }}>
          <Box
            sx={{
              width: 0,
              height: 0,
              borderLeft: '16px solid transparent',
              borderRight: '16px solid transparent',
              borderTop: '32px solid #FFC10D',
              filter: 'drop-shadow(0 5px 5px rgba(0,0,0,0.45))',
            }}
          />
        </Box>

        {/* Centro */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 84,
            height: 84,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 50% 30%, #FFD75E, #FFC10D 72%)',
            border: '5px solid #fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(0,0,0,0.5), inset 0 -5px 10px rgba(0,0,0,0.2)',
            zIndex: 3,
          }}
        >
          {spinning ? (
            <CircularProgress size={34} sx={{ color: '#123A7F' }} />
          ) : (
            <Typography variant="h5" sx={{ color: '#123A7F', fontWeight: 900 }}>
              ?
            </Typography>
          )}
        </Box>
      </Box>

      <Button
        variant="contained"
        color="warning"
        size="large"
        onClick={spin}
        disabled={spinning || categories.length === 0}
        startIcon={<WheelIcon />}
        sx={{ mt: 2.5, fontSize: '1.05rem', px: 5, fontWeight: 900 }}
      >
        GIRAR
      </Button>
    </Box>
  );
}

const styles = {
  glassCard: {
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,193,13,0.28)',
    borderRadius: 4,
    boxShadow: '0 14px 34px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.15)',
  },
  sectionTitle: {
    color: '#FFC10D',
    fontWeight: 900,
    letterSpacing: 0.5,
    textShadow: '0 2px 0 rgba(0,0,0,0.4)',
  },
};

function StatTile({ icon, label, value, color, highlight }) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 70,
        textAlign: 'center',
        px: 1,
        py: 1.4,
        borderRadius: 3,
        background: highlight ? 'rgba(255,193,13,0.18)' : 'rgba(255,255,255,0.08)',
        border: `1px solid ${highlight ? 'rgba(255,193,13,0.45)' : 'rgba(255,255,255,0.14)'}`,
        backdropFilter: 'blur(8px)',
      }}
    >
      <Box sx={{ fontSize: 22, color }}>{icon}</Box>
      <Typography variant="h6" fontWeight={900} sx={{ color: '#fff', lineHeight: 1.1, mt: 0.4 }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>
        {label}
      </Typography>
    </Box>
  );
}

function MissionRow({ emoji, title, progress, target }) {
  const pct = Math.min(100, (progress / target) * 100);
  const done = progress >= target;
  return (
    <Box sx={{ mb: 1.6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700 }}>
          {emoji} {title}
        </Typography>
        {done ? (
          <CheckIcon sx={{ color: '#2EBD59', fontSize: 20 }} />
        ) : (
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            {progress}/{target}
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          width: '100%',
          height: 10,
          borderRadius: 6,
          background: 'rgba(255,255,255,0.14)',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: `${pct}%`,
            height: '100%',
            background: done
              ? 'linear-gradient(90deg,#2EBD59,#58D87F)'
              : 'linear-gradient(90deg,#FFC10D,#FFD75E)',
            borderRadius: 6,
            boxShadow: '0 0 8px rgba(255,193,13,0.5)',
          }}
        />
      </Box>
    </Box>
  );
}

function AchievementCard({ emoji, title, desc, unlocked }) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 96,
        textAlign: 'center',
        px: 1,
        py: 1.6,
        borderRadius: 3,
        background: unlocked ? 'rgba(46,189,89,0.14)' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${unlocked ? 'rgba(46,189,89,0.5)' : 'rgba(255,255,255,0.14)'}`,
        opacity: unlocked ? 1 : 0.8,
      }}
    >
      <Box sx={{ fontSize: 26, mb: 0.5, filter: unlocked ? 'none' : 'grayscale(1)' }}>
        {unlocked ? emoji : '🔒'}
      </Box>
      <Typography variant="body2" fontWeight={800} sx={{ color: '#fff', fontSize: 12, lineHeight: 1.15 }}>
        {title}
      </Typography>
      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>{desc}</Typography>
    </Box>
  );
}

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [topProvinces, setTopProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [livesInfo, setLivesInfo] = useState({ lives: user?.lives, nextLifeInMs: 0, regenerating: 0 });
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, stateRes, provRes] = await Promise.all([
          api.get('/catalog/categories'),
          api.get('/state'),
          api.get('/provinces/province-ranking').catch(() => null),
        ]);
        // Filtrar y mapear solo las categorías destacadas en español
        const mapped = (catRes.data.categories || [])
          .map((c) => {
            const m = CATEGORY_MAP.find((x) => x.slug === c.slug);
            return m ? { id: c.id, slug: c.slug, label: m.label, emoji: m.emoji } : null;
          })
          .filter(Boolean);
        setCategories(mapped);
        if (Array.isArray(provRes?.data?.ranking)) setTopProvinces(provRes.data.ranking.slice(0, 3));

        const state = stateRes.data.user;
        updateUser({
          lives: state.lives,
          pesos: state.pesos,
          streakDays: state.streakDays,
          level: state.level,
          xp: state.xp,
          totalCorrect: state.totalCorrect,
          totalWrong: state.totalWrong,
          totalGames: state.totalGames,
          province: state.province,
          mascotEvolution: state.mascotEvolution,
        });
        setLivesInfo({
          lives: state.lives,
          nextLifeInMs: stateRes.data.nextLifeInMs || 0,
          regenerating: stateRes.data.regenerating || 0,
        });
        if (stateRes.data.nextLifeInMs) setCountdown(Math.ceil(stateRes.data.nextLifeInMs / 1000));
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(id);
          setLivesInfo((li) => ({ ...li, lives: Math.min(5, (li.lives || 0) + 1) }));
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [countdown]);

  const startGame = async (categoryId) => {
    try {
      const { data } = await api.post('/games', { categoryId });
      navigate('/jugar', { state: { gameId: data.game.id, categoryId } });
    } catch (err) {
      if (err.response?.status === 429) {
        setLivesInfo((li) => ({ ...li, lives: 0 }));
      }
    }
  };

  const onSpinPick = async (categoryId) => {
    await startGame(categoryId);
  };

  const level = user?.level ?? 1;
  const xpTotal = user?.xp ?? 0;
  const totalXp = Array.from({ length: level - 1 }, (_, i) => xpForLevel(i + 1)).reduce((a, b) => a + b, 0);
  const xpInLevel = Math.max(0, xpTotal - totalXp);
  const levelTarget = xpForLevel(level);
  const levelProgress = Math.min(100, (xpInLevel / levelTarget) * 100);
  const xpToNext = Math.max(0, levelTarget - xpInLevel);

  const mascot = user?.mascotEvolution || {};
  const rank = rankForLevel(level);
  const province = user?.province?.name ?? 'tu provincia';
  const avatarUrl = user?.profilePic;
  const initial = user?.nickname?.charAt(0)?.toUpperCase() || 'Q';

  // Misiones diarias (progreso derivado de datos reales del jugador)
  const missions = [
    { emoji: '✅', title: 'Responde 5 preguntas', progress: user?.totalCorrect ?? 0, target: 5 },
    { emoji: '💰', title: 'Consigue 100 monedas', progress: Math.min(100, user?.pesos ?? 0), target: 100 },
    { emoji: '🏆', title: 'Gana una batalla', progress: user?.totalGames ?? 0, target: 1 },
  ];

  // Logros recientes (desbloqueo derivado de datos reales)
  const achievements = [
    { emoji: '🏆', title: 'Historiador Novato', desc: '3 correcta', unlocked: (user?.totalCorrect ?? 0) >= 3 },
    { emoji: '🏆', title: 'Maestro del Merengue', desc: 'Categoría música', unlocked: (user?.totalCorrect ?? 0) >= 5 },
    { emoji: '🏆', title: 'Explorador de Provincias', desc: '5 provincias', unlocked: (user?.totalGames ?? 0) >= 2 },
  ];

  const medalEmojis = ['🥇', '🥈', '🥉'];

  if (loading) {
    return (
      <GameBackground>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <CircularProgress color="warning" />
        </Box>
      </GameBackground>
    );
  }

  return (
    <GameBackground minHeight="auto">
      {/* Contenido principal */}
      <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 560, mx: 'auto', px: 2, py: 3 }}>

        {/* ===== TARJETA DEL JUGADOR (glass) ===== */}
        <Box
          sx={{
            ...styles.glassCard,
            p: 2.5,
            display: 'flex',
            flexDirection: 'row',
            gap: 2,
            alignItems: 'center',
            mb: 2.5,
            background: 'linear-gradient(150deg, rgba(30,79,175,0.5), rgba(11,31,75,0.7))',
          }}
        >
          {/* Avatar real con borde dorado */}
          <Box sx={{ position: 'relative', flexShrink: 0 }}>
            <Box
              sx={{
                width: 86,
                height: 86,
                borderRadius: '50%',
                p: 3,
                background: 'linear-gradient(135deg,#FFD75E,#FFC10D)',
                boxShadow: '0 8px 20px rgba(255,193,13,0.45)',
              }}
            >
              <Avatar
                src={avatarUrl || undefined}
                sx={{
                  width: '100%',
                  height: '100%',
                  bgcolor: 'primary.dark',
                  fontSize: 40,
                  fontWeight: 900,
                  border: '3px solid #fff',
                }}
              >
                {initial}
              </Avatar>
            </Box>
            <Box
              sx={{
                position: 'absolute',
                bottom: -6,
                left: '50%',
                transform: 'translateX(-50%)',
                bgcolor: '#FFC10D',
                color: '#123A7F',
                borderRadius: 20,
                px: 1.2,
                py: 0.2,
                fontSize: 13,
                fontWeight: 900,
                border: '2px solid #fff',
                boxShadow: '0 3px 8px rgba(0,0,0,0.4)',
                whiteSpace: 'nowrap',
              }}
            >
              Nivel {level}
            </Box>
          </Box>

          {/* Datos del jugador */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" fontWeight={900} sx={{ color: '#fff', textShadow: '0 2px 0 rgba(0,0,0,0.35)', lineHeight: 1.2 }}>
              {user?.nickname || 'Jugador'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#FFD75E', fontWeight: 700 }}>
              {rank.icon} {rank.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', display: 'block', mt: 0.3 }}>
              🇩🇴 {province}
            </Typography>

            {/* Barra de XP */}
            <Box sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700 }}>
                  {xpInLevel} / {levelTarget} XP
                </Typography>
                <Typography variant="caption" sx={{ color: '#FFD75E', fontWeight: 800 }}>
                  {xpToNext} XP para Nivel {level + 1}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: '100%',
                  height: 14,
                  borderRadius: 7,
                  background: 'rgba(255,255,255,0.22)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    width: `${levelProgress}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg,#FFC10D,#FFD75E)',
                    borderRadius: 7,
                    boxShadow: '0 0 12px rgba(255,193,13,0.7)',
                    transition: 'width 0.6s ease',
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* ===== BANDA DE ESTADÍSTICAS RÁPIDAS ===== */}
        <Box sx={{ display: 'flex', gap: 1.2, mb: 2.5 }}>
          <StatTile icon="❤️" label="Vidas" value={livesInfo.lives} color="#ff8fa5" />
          <StatTile icon="💰" label="Monedas" value={user?.pesos ?? 0} color="#FFD54F" />
          <StatTile icon="🔥" label="Racha" value={`${user?.streakDays ?? 0}d`} color="#ff9e80" />
          <StatTile icon="🎁" label="Cofres" value={user?.totalGames ?? 0} color="#b39ddb" highlight />
        </Box>

        {livesInfo.lives <= 0 && (
          <Box
            sx={{
              mb: 2,
              px: 2,
              py: 1.4,
              borderRadius: 3,
              background: 'rgba(225,29,42,0.18)',
              border: '1px solid rgba(255,150,110,0.5)',
            }}
          >
            <Typography variant="body2" sx={{ color: '#ffb074', fontWeight: 700 }}>
              Te quedaste sin vidas. Próxima vida en {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')} min
            </Typography>
          </Box>
        )}

        {/* ===== BOTONES PRINCIPALES ===== */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 3, alignItems: 'stretch' }}>
          {/* Cofres (secundario) */}
          <Button
            variant="contained"
            color="secondary"
            startIcon={<GiftIcon />}
            onClick={() => navigate('/tienda')}
            sx={{ flex: 1, py: 1.8, fontSize: '1.05rem', fontWeight: 900 }}
          >
            🎁 Cofres
          </Button>
          {/* Jugar (CTA principal pulsante) */}
          <Button
            variant="contained"
            color="warning"
            startIcon={<PlayIcon />}
            onClick={() => {
              if (categories.length) {
                const rand = categories[Math.floor(Math.random() * categories.length)];
                startGame(rand.id);
              } else {
                startGame(undefined);
              }
            }}
            sx={{
              flex: 1.35,
              py: 1.8,
              fontSize: '1.15rem',
              fontWeight: 900,
              background: 'linear-gradient(180deg,#FFD75E,#FFC10D)',
              color: '#123A7F',
              boxShadow: '0 8px 22px rgba(255,193,13,0.45)',
              animation: 'pulseCta 1.8s ease-in-out infinite',
              '@keyframes pulseCta': {
                '0%,100%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.04)' },
              },
            }}
          >
            🎮 Jugar
          </Button>
        </Box>

        {/* ===== HERO DE MARCA ===== */}
        <Box
          sx={{
            textAlign: 'center',
            mb: 3,
            px: 1,
          }}
        >
          <Typography
            variant="h4"
            fontWeight={900}
            sx={{
              color: '#FFC10D',
              letterSpacing: 0.5,
              textShadow: '0 4px 0 #0B1F4B, 0 0 30px rgba(255,193,13,0.4)',
              lineHeight: 1.15,
            }}
          >
            🏆 Bienvenido a Quizqueya
          </Typography>
          <Typography
            variant="h6"
            fontWeight={800}
            sx={{ color: '#fff', mt: 1, textShadow: '0 2px 0 rgba(0,0,0,0.4)' }}
          >
            ¿Conoces realmente la República Dominicana?
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: 'rgba(255,255,255,0.85)', mt: 0.8, fontWeight: 600 }}
          >
            Pon a prueba tu conocimiento y representa a tu provincia.
          </Typography>
          {/* Divider con colores patrios */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 1.5 }}>
            <Box sx={{ height: 3, width: 44, borderRadius: 2, background: '#E11D2A' }} />
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: '#fff', border: '2px solid #FFC10D' }} />
            <Box sx={{ height: 3, width: 44, borderRadius: 2, background: '#1E4FAF' }} />
          </Box>
        </Box>

        {/* ===== RULETA DE CATEGORÍAS ===== */}
        <Typography variant="h6" sx={{ ...styles.sectionTitle, textAlign: 'center', mb: 2 }}>
          Gira la rueda y elige tu aventura
        </Typography>
        <Box
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 4,
            background: 'rgba(255,255,255,0.05)',
            border: '2px solid rgba(255,193,13,0.25)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 14px 34px rgba(0,0,0,0.45)',
          }}
        >
          <CategoryWheel categories={categories} onPick={onSpinPick} />
        </Box>

        {/* ===== SECCIÓN MISIONES DIARIAS ===== */}
        <Box sx={{ ...styles.glassCard, p: 2.5, mb: 3 }}>
          <Typography variant="h6" sx={{ ...styles.sectionTitle, mb: 1.8, display: 'flex', alignItems: 'center', gap: 1 }}>
            <MedalIcon sx={{ color: '#FFC10D' }} /> Misiones Diarias
          </Typography>
          {missions.map((m, i) => (
            <MissionRow key={i} {...m} />
          ))}
        </Box>

        {/* ===== SECCIÓN LOGROS RECIENTES ===== */}
        <Box sx={{ ...styles.glassCard, p: 2.5, mb: 3 }}>
          <Typography variant="h6" sx={{ ...styles.sectionTitle, mb: 1.8, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrophyIcon sx={{ color: '#FFC10D' }} /> Logros Recientes
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.2, flexWrap: 'wrap' }}>
            {achievements.map((a, i) => (
              <AchievementCard key={i} {...a} />
            ))}
          </Box>
        </Box>

        {/* ===== SECCIÓN RANKING RÁPIDO ===== */}
        <Box sx={{ ...styles.glassCard, p: 2.5 }}>
          <Typography variant="h6" sx={{ ...styles.sectionTitle, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrophyIcon sx={{ color: '#FFC10D' }} /> Ranking de Provincias
          </Typography>
          {topProvinces.length === 0 ? (
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Aún no hay datos de ranking.
            </Typography>
          ) : (
            topProvinces.map((p, i) => (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  py: 1.2,
                  px: 1.5,
                  my: 0.8,
                  borderRadius: 3,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <Box sx={{ fontSize: 26, width: 34, textAlign: 'center' }}>{medalEmojis[i]}</Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" fontWeight={800} sx={{ color: '#fff' }}>
                    {p.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    {p.players ?? 0} jugadores · {p.totalXp ?? 0} XP
                  </Typography>
                </Box>
                <Typography variant="h6" fontWeight={900} sx={{ color: '#FFC10D' }}>
                  #{i + 1}
                </Typography>
              </Box>
            ))
          )}
        </Box>

        {/* Mascota decorativa */}
        <Pet pet={mascot} size={78} animation="bounce" sx={{ mx: 'auto', my: 3 }} />
      </Box>
    </GameBackground>
  );
}
