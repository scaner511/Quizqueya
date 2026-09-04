import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Casino as WheelIcon,
  Lock as LockIcon,
  Checklist as MissionsIcon,
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

function useWheelSize() {
  const [size, setSize] = useState(() =>
    typeof window === 'undefined' ? 310 : Math.min(310, Math.max(230, window.innerWidth - 52)),
  );
  useEffect(() => {
    const onResize = () => setSize(Math.min(310, Math.max(230, window.innerWidth - 52)));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return size;
}

function CategoryWheel({ categories, onPick }) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);

  const SIZE = useWheelSize();
  const R = SIZE / 2;
  const dist = R - Math.max(34, SIZE * 0.13); // radio medio de las casillas (iconos)
  const iconBox = Math.max(36, SIZE * 0.15); // tamaño de cada casilla de icono
  const centerSize = Math.max(58, SIZE * 0.27); // centro de la rueda
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
                  height: R - 6,
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
                    width: iconBox,
                    height: iconBox,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 50% 30%, #FFD75E, #FFC10D 70%)',
                    border: '2px solid #fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 5px 12px rgba(0,0,0,0.5)',
                  }}
                >
                  <Box sx={{ fontSize: iconBox * 0.5, lineHeight: 1 }}>{cat.emoji}</Box>
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
            width: centerSize,
            height: centerSize,
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
            <CircularProgress size={Math.max(26, centerSize * 0.4)} sx={{ color: '#123A7F' }} />
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

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [livesInfo, setLivesInfo] = useState({ lives: user?.lives, nextLifeInMs: 0, regenerating: 0 });
  const [countdown, setCountdown] = useState(0);

  const [pwOpen, setPwOpen] = useState(false);
  const [pwCur, setPwCur] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);
  const [pwErr, setPwErr] = useState(null);

  const submitPassword = async (e) => {
    e.preventDefault();
    setPwSaving(true);
    setPwMsg(null);
    setPwErr(null);
    if (pwNew !== pwConfirm) {
      setPwErr('Las contraseñas no coinciden');
      setPwSaving(false);
      return;
    }
    try {
      const { data } = await api.post('/auth/change-password', { currentPassword: pwCur, newPassword: pwNew });
      setPwMsg(data.message || 'Contraseña actualizada correctamente');
      setPwCur('');
      setPwNew('');
      setPwConfirm('');
      setTimeout(() => setPwOpen(false), 1200);
    } catch (err) {
      setPwErr(err.response?.data?.message || 'No se pudo cambiar la contraseña');
    } finally {
      setPwSaving(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, stateRes] = await Promise.all([
          api.get('/catalog/categories'),
          api.get('/state'),
        ]);
        // Filtrar y mapear solo las categorías destacadas en español
        const mapped = (catRes.data.categories || [])
          .map((c) => {
            const m = CATEGORY_MAP.find((x) => x.slug === c.slug);
            return m ? { id: c.id, slug: c.slug, label: m.label, emoji: m.emoji } : null;
          })
          .filter(Boolean);
        setCategories(mapped);

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

  const mascot = user?.mascotEvolution || {};
  const rank = rankForLevel(level);
  const avatarUrl = user?.profilePic;
  const initial = user?.nickname?.charAt(0)?.toUpperCase() || 'Q';

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
      <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 520, mx: 'auto', px: 1.5, py: 2 }}>

        {/* ===== BARRA SUPERIOR DEL JUGADOR (compacta, arriba) ===== */}
        <Box
          sx={{
            ...styles.glassCard,
            p: 1.2,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            background: 'linear-gradient(120deg, rgba(30,79,175,0.92), rgba(11,31,75,0.95))',
            borderRadius: 3,
          }}
        >
          <Box sx={{ position: 'relative', flexShrink: 0 }}>
            <Avatar
              src={avatarUrl || undefined}
              sx={{
                width: 52,
                height: 52,
                bgcolor: 'primary.dark',
                fontSize: 24,
                fontWeight: 900,
                border: '3px solid #FFC10D',
                boxShadow: '0 4px 10px rgba(255,193,13,0.35)',
              }}
            >
              {initial}
            </Avatar>
            <Box
              sx={{
                position: 'absolute',
                bottom: -5,
                left: '50%',
                transform: 'translateX(-50%)',
                bgcolor: '#FFC10D',
                color: '#123A7F',
                borderRadius: 20,
                px: 0.9,
                py: 0.1,
                fontSize: 11,
                fontWeight: 900,
                border: '2px solid #fff',
                whiteSpace: 'nowrap',
              }}
            >
              Nv.{level}
            </Box>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Typography variant="body1" fontWeight={900} sx={{ color: '#fff', lineHeight: 1.15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.nickname || 'Jugador'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#FFD75E', fontWeight: 700, whiteSpace: 'nowrap' }}>
                {rank.icon} {rank.name}
              </Typography>
            </Box>
            <Box sx={{ mt: 0.8, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ flex: 1, height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.22)', overflow: 'hidden' }}>
                <Box
                  sx={{
                    width: `${levelProgress}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg,#FFC10D,#FFD75E)',
                    borderRadius: 5,
                    transition: 'width 0.6s ease',
                  }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700, whiteSpace: 'nowrap' }}>
                {xpInLevel}/{levelTarget} XP
              </Typography>
            </Box>
          </Box>

          <IconButton
            size="small"
            onClick={() => navigate('/misiones')}
            sx={{ color: '#FFD75E', border: '1px solid rgba(255,193,13,0.4)', bgcolor: 'rgba(255,193,13,0.12)' }}
            title="Misiones diarias"
          >
            <MissionsIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setPwOpen(true)}
            sx={{ color: '#FFD75E', border: '1px solid rgba(255,193,13,0.4)', bgcolor: 'rgba(255,193,13,0.12)' }}
            title="Cambiar contraseña"
          >
            <LockIcon fontSize="small" />
          </IconButton>
        </Box>

        {livesInfo.lives <= 0 && (
          <Box
            sx={{
              mb: 2,
              px: 2,
              py: 1.2,
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

        {/* ===== HERO DE MARCA (compacto) ===== */}
        <Box sx={{ textAlign: 'center', mb: 2, px: 1 }}>
          <Typography
            variant="h5"
            fontWeight={900}
            sx={{
              color: '#FFC10D',
              textShadow: '0 3px 0 #0B1F4B, 0 0 24px rgba(255,193,13,0.4)',
              lineHeight: 1.15,
              fontSize: { xs: '1.35rem', sm: '1.6rem' },
            }}
          >
            🏆 Bienvenido a Quizqueya
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'rgba(255,255,255,0.85)', mt: 0.5, fontWeight: 600 }}
          >
            Gira la rueda, elige tu aventura y representa a tu provincia.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 1 }}>
            <Box sx={{ height: 3, width: 44, borderRadius: 2, background: '#E11D2A' }} />
            <Box sx={{ width: 9, height: 9, borderRadius: '50%', background: '#fff', border: '2px solid #FFC10D' }} />
            <Box sx={{ height: 3, width: 44, borderRadius: 2, background: '#1E4FAF' }} />
          </Box>
        </Box>

        {/* ===== RULETA DE CATEGORÍAS (protagonista, centrada) ===== */}
        <Box
          sx={{
            position: 'relative',
            p: { xs: 1.5, sm: 2 },
            mb: 2,
            borderRadius: 4,
            background: 'rgba(255,255,255,0.06)',
            border: '2px solid rgba(255,193,13,0.3)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 14px 34px rgba(0,0,0,0.45)',
          }}
        >
          <Typography variant="h6" sx={{ ...styles.sectionTitle, textAlign: 'center', mb: 1.5 }}>
            Gira la rueda y elige tu aventura
          </Typography>
          <CategoryWheel categories={categories} onPick={onSpinPick} />
        </Box>

        {/* ===== BOTONES PRINCIPALES ===== */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, alignItems: 'stretch' }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate('/tienda')}
            sx={{ flex: 1, py: 1.6, fontSize: '1rem', fontWeight: 900 }}
          >
            🎁 Cofres
          </Button>
          <Button
            variant="contained"
            color="warning"
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
              py: 1.6,
              fontSize: '1.1rem',
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

        {/* Mascota decorativa */}
        <Pet pet={mascot} size={78} animation="bounce" sx={{ mx: 'auto', my: 3 }} />
      </Box>

      {/* ===== MODAL CAMBIAR CONTRASEÑA ===== */}
      <Dialog open={pwOpen} onClose={() => setPwOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 900, textAlign: 'center' }}>
          🔐 Cambiar contraseña
        </DialogTitle>
        <DialogContent>
          {pwMsg && <Alert severity="success" sx={{ mb: 2 }}>{pwMsg}</Alert>}
          {pwErr && <Alert severity="error" sx={{ mb: 2 }}>{pwErr}</Alert>}
          <Box component="form" onSubmit={submitPassword} id="pw-form">
            <TextField
              label="Contraseña actual"
              type="password"
              fullWidth
              required
              margin="normal"
              value={pwCur}
              onChange={(e) => setPwCur(e.target.value)}
            />
            <TextField
              label="Nueva contraseña"
              type="password"
              fullWidth
              required
              margin="normal"
              helperText="Mínimo 6 caracteres"
              value={pwNew}
              onChange={(e) => setPwNew(e.target.value)}
            />
            <TextField
              label="Confirmar nueva contraseña"
              type="password"
              fullWidth
              required
              margin="normal"
              value={pwConfirm}
              onChange={(e) => setPwConfirm(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setPwOpen(false); setPwMsg(null); setPwErr(null); }} color="inherit">
            Cancelar
          </Button>
          <Button type="submit" form="pw-form" variant="contained" color="warning" disabled={pwSaving} sx={{ fontWeight: 900 }}>
            {pwSaving ? 'Guardando...' : 'Cambiar contraseña'}
          </Button>
        </DialogActions>
      </Dialog>
    </GameBackground>
  );
}
