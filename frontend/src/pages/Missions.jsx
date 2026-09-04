import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';
import { AssignmentTurnedIn as MissionIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/client';
import GameBackground from '../components/game/GameBackground';

function MissionCard({ emoji, title, desc, progress, target }) {
  const pct = Math.min(100, (progress / target) * 100);
  const done = progress >= target;
  return (
    <Box
      sx={{
        px: 2.5,
        py: 2,
        mb: 2,
        borderRadius: 4,
        background: done
          ? 'linear-gradient(135deg, rgba(46,189,89,0.3), rgba(11,31,75,0.7))'
          : 'rgba(255,255,255,0.08)',
        border: `2px solid ${done ? 'rgba(46,189,89,0.55)' : 'rgba(255,193,13,0.3)'}`,
        backdropFilter: 'blur(10px)',
        boxShadow: '0 10px 24px rgba(0,0,0,0.4)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.2 }}>
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 50% 30%, #FFD75E, #FFC10D 72%)',
            border: '2px solid #fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            flexShrink: 0,
          }}
        >
          {done ? '✅' : emoji}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body1" fontWeight={900} sx={{ color: '#fff', lineHeight: 1.2 }}>
            {title}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
            {desc}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.6 }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>
          {done ? '¡Completada!' : 'Progreso'}
        </Typography>
        <Typography variant="caption" sx={{ color: done ? '#58D87F' : '#FFD75E', fontWeight: 900 }}>
          {Math.min(progress, target)}/{target}
        </Typography>
      </Box>
      <Box sx={{ width: '100%', height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.14)', overflow: 'hidden' }}>
        <Box
          sx={{
            width: `${pct}%`,
            height: '100%',
            background: done
              ? 'linear-gradient(90deg,#2EBD59,#58D87F)'
              : 'linear-gradient(90deg,#FFC10D,#FFD75E)',
            borderRadius: 6,
            boxShadow: '0 0 10px rgba(255,193,13,0.5)',
            transition: 'width 0.6s ease',
          }}
        />
      </Box>
    </Box>
  );
}

export default function Missions() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/state');
      setState(data);
      updateUser({
        lives: data.user.lives,
        pesos: data.user.pesos,
        streakDays: data.user.streakDays,
        level: data.user.level,
        xp: data.user.xp,
        totalCorrect: data.user.totalCorrect,
        totalWrong: data.user.totalWrong,
        totalGames: data.user.totalGames,
        mascotEvolution: data.user.mascotEvolution,
      });
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const u = state?.user ?? user ?? {};
  const missions = [
    {
      emoji: '💡',
      title: 'Responde 5 preguntas correctas',
      desc: 'Demuestra que conoces la República Dominicana',
      progress: u.totalCorrect ?? 0,
      target: 5,
    },
    {
      emoji: '💰',
      title: 'Junta 100 monedas',
      desc: 'Acumula monedas jugando batallas',
      progress: Math.min(100, u.pesos ?? 0),
      target: 100,
    },
    {
      emoji: '🏆',
      title: 'Gana una batalla',
      desc: 'Completa una partida con victoria',
      progress: u.totalGames ?? 0,
      target: 1,
    },
    {
      emoji: '🔥',
      title: 'Mantén una racha de 3 días',
      desc: 'Juega al menos un día seguido para mantener la racha',
      progress: Math.min(3, u.streakDays ?? 0),
      target: 3,
    },
  ];

  return (
    <GameBackground minHeight="auto">
      <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 520, mx: 'auto', px: 1.5, py: 2.5 }}>
        <Box sx={{ textAlign: 'center', mb: 2.5 }}>
          <Typography
            variant="h4"
            fontWeight={900}
            sx={{
              color: '#FFC10D',
              textShadow: '0 3px 0 #0B1F4B, 0 0 26px rgba(255,193,13,0.4)',
              lineHeight: 1.15,
              fontSize: { xs: '1.5rem', sm: '1.9rem' },
            }}
          >
            🎯 Misiones Diarias
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', mt: 0.6, fontWeight: 600 }}>
            Cumple las misiones para seguir avanzando en tu aventura.
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="warning" />
          </Box>
        ) : (
          <>
            {missions.map((m, i) => (
              <MissionCard key={i} {...m} />
            ))}

            <Button
              variant="contained"
              color="warning"
              fullWidth
              startIcon={<RefreshIcon />}
              onClick={load}
              sx={{ py: 1.6, fontSize: '1rem', fontWeight: 900, mt: 1 }}
            >
              Actualizar progreso
            </Button>
          </>
        )}
      </Box>
    </GameBackground>
  );
}