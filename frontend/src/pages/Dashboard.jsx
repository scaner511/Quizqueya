import { useEffect, useRef, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  LinearProgress,
  Chip,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  Paid as PaidIcon,
  LocalFireDepartment as FireIcon,
  SportsEsports as PlayIcon,
  Casino as WheelIcon,
  CardGiftcard as GiftIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/client';
import GameBackground from '../components/game/GameBackground';
import Pet from '../components/game/Pet';

function xpForLevel(level) {
  return level * 100;
}

function CategoryWheel({ categories, onPick }) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);

  const segAngle = 360 / Math.max(1, categories.length);

  const spin = () => {
    if (spinning || categories.length === 0) return;
    // El puntero está arriba (ángulo -90°). Gira para traer la categoría elegida al puntero.
    const targetIndex = Math.floor(Math.random() * categories.length);
    const offset = -90; // ángulo del marcador (arriba)
    const targetAngle = offset - (targetIndex * segAngle + segAngle / 2);
    const fullTurns = 6 * 360;
    setRotation((prev) => prev + (fullTurns + ((((targetAngle - prev) % 360) + 360) % 360)));
    setSpinning(true);
    setTimeout(() => {
      setSpinning(false);
      const cat = categories[targetIndex];
      if (cat) onPick(cat.id);
    }, 2200);
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Box
        sx={{
          position: 'relative',
          width: 300,
          height: 300,
          mx: 'auto',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 35%, #3D6FD0, #123A7F 70%)',
          border: '8px solid #FFC10D',
          boxShadow: '0 14px 40px rgba(0,0,0,0.5), inset 0 6px 16px rgba(255,255,255,0.25)',
        }}
      >
        {/* Capa giratoria con las categorías */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 2.2s cubic-bezier(0.15, 0.9, 0.25, 1)' : 'transform 0.3s ease',
          }}
        >
          {categories.map((cat, i) => {
            const angle = i * segAngle;
            const segColor = i % 2 === 0 ? '#1E4FAF' : '#123A7F';
            return (
              <Box
                key={cat.id}
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: `conic-gradient(from ${angle}deg, ${segColor} 0deg, ${segColor} ${segAngle}deg, transparent ${segAngle}deg)`,
                  opacity: 0.55,
                }}
              />
            );
          })}
          {categories.map((cat, i) => {
            const angle = i * segAngle + segAngle / 2;
            return (
              <Box
                key={cat.id}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: 0,
                  height: 0,
                }}
              >
                <Pet
                  pet={{ emoji: cat.icon, name: cat.name, color: '#FFC10D' }}
                  size={48}
                  animation="none"
                  sx={{
                    position: 'absolute',
                    transform: `rotate(${angle}deg) translateY(-118px) rotate(${-angle}deg) translate(-50%,-50%)`,
                  }}
                />
              </Box>
            );
          })}
        </Box>
        {/* Fijador (puntero arriba) */}
        <Box
          sx={{
            position: 'absolute',
            top: -14,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '14px solid transparent',
            borderRight: '14px solid transparent',
            borderTop: '28px solid #E11D2A',
            filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.4))',
            zIndex: 2,
          }}
        />
        {/* Centro */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 74,
            height: 74,
            borderRadius: '50%',
            bgcolor: '#FFC10D',
            border: '5px solid #fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(0,0,0,0.4)',
            zIndex: 3,
          }}
        >
          {spinning ? (
            <CircularProgress size={30} sx={{ color: '#123A7F' }} />
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
        sx={{ mt: 2, fontSize: '1.05rem', px: 4 }}
      >
        GIRAR
      </Button>
    </Box>
  );
}

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [livesInfo, setLivesInfo] = useState({ lives: user?.lives, nextLifeInMs: 0, regenerating: 0 });
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, stateRes] = await Promise.all([
          api.get('/catalog/categories'),
          api.get('/state'),
        ]);
        setCategories(catRes.data.categories || []);
        const state = stateRes.data.user;
        updateUser({
          lives: state.lives,
          pesos: state.pesos,
          streakDays: state.streakDays,
          level: state.level,
          xp: state.xp,
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
  const xpInLevel = user?.xp ?? 0;
  const totalXp = Array.from({ length: level - 1 }, (_, i) => xpForLevel(i + 1)).reduce((a, b) => a + b, 0);
  const levelProgress = Math.min(100, ((xpInLevel - totalXp) / xpForLevel(level)) * 100);

  const mascot = user?.mascotEvolution || {};

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
      <Container maxWidth="md" sx={{ py: 3, position: 'relative', zIndex: 1 }}>
        {/* Tarjeta del jugador tipo juego */}
        <Card
          sx={{
            mb: 3,
            border: '4px solid rgba(255,193,13,0.6)',
            background: 'linear-gradient(160deg, #1E4FAF, #123A7F)',
            color: '#fff',
          }}
        >
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Pet pet={mascot} size={100} animation="bounce" />
            <Box sx={{ flex: 1, minWidth: 180 }}>
              <Typography variant="h5" fontWeight={900} sx={{ textShadow: '0 3px 0 rgba(0,0,0,0.3)' }}>
                ¡Hola, {user?.nickname}!
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                Representa a {user?.province?.name ?? 'tu provincia'} · {mascot.evolutionName || ''}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
                <Chip icon={<FavoriteIcon sx={{ color: '#ff8fa5 !important' }} />} label={`${livesInfo.lives}/5`} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff' }} />
                <Chip icon={<PaidIcon sx={{ color: '#FFD54F !important' }} />} label={`${user?.pesos ?? 0}`} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff' }} />
                <Chip icon={<FireIcon sx={{ color: '#ff9e80 !important' }} />} label={`${user?.streakDays ?? 0} días`} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff' }} />
              </Box>
              <Box sx={{ mt: 1.5 }}>
                <LinearProgress
                  variant="determinate"
                  value={levelProgress}
                  sx={{ bgcolor: 'rgba(255,255,255,0.25)', '& .MuiLinearProgress-bar': { bgcolor: '#FFC10D' }, height: 12, borderRadius: 6 }}
                />
                <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: 'rgba(255,255,255,0.9)' }}>
                  Nivel {level} · {user?.xp ?? 0} XP
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {livesInfo.lives <= 0 && (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 3 }}>
            Te quedaste sin vidas. Próxima vida en {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')} min.
          </Alert>
        )}

        {/* Acciones rápidas */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<GiftIcon />}
            onClick={() => navigate('/tienda')}
            sx={{ flex: 1, minWidth: 120 }}
          >
            🎁 Cofres
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<PlayIcon />}
            onClick={() => navigate('/jugar')}
            sx={{ flex: 1, minWidth: 120 }}
          >
            🎯 Jugar
          </Button>
        </Box>

        {/* Rueda de categorías */}
        <Typography variant="h6" fontWeight={900} align="center" sx={{ color: '#fff', mb: 2, textShadow: '0 3px 0 rgba(0,0,0,0.35)' }}>
          Gira la rueda y elige tu aventura
        </Typography>
        <Card
          sx={{
            p: 3,
            bgcolor: 'rgba(255,255,255,0.08)',
            border: '3px solid rgba(255,255,255,0.2)',
          }}
        >
          <CategoryWheel categories={categories} onPick={onSpinPick} />
        </Card>
      </Container>
    </GameBackground>
  );
}
