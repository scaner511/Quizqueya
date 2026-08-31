import { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  CircularProgress,
  LinearProgress,
  Avatar,
  Chip,
  Alert,
} from '@mui/material';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PaidIcon from '@mui/icons-material/Paid';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/client';

// Umbral de XP para niveles (replicado del backend para UI)
function xpForLevel(level) {
  return level * 100;
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

  // Cuenta regresiva para la próxima vida
  useEffect(() => {
    if (countdown <= 0) return;
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(id);
          setLivesInfo((li) => ({ ...li, lives: Math.min(5, (li.lives || 0) + 1), regenerating: Math.max(0, (li.regenerating || 1) - 1) }));
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [countdown]);

  const level = user?.level ?? 1;
  const xpInLevel = user?.xp ?? 0;
  const totalXp = Array.from({ length: level - 1 }, (_, i) => xpForLevel(i + 1)).reduce((a, b) => a + b, 0);
  const levelProgress = Math.min(100, ((xpInLevel - totalXp) / xpForLevel(level)) * 100);

  const startGame = async (categoryId) => {
    try {
      const { data } = await api.post('/games', { categoryId });
      navigate('/jugar', { state: { gameId: data.game.id, categoryId } });
    } catch (err) {
      if (err.response?.status === 429) {
        setLivesInfo((li) => ({ ...li, lives: 0, nextLifeInMs: err.response.data.nextLifeInMs || 0 }));
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      {/* Tarjeta de bienvenida */}
      <Card sx={{ mb: 3, bgcolor: 'primary.main', color: '#fff' }}>
        <CardContent>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={12} md={7}>
              <Typography variant="h5" fontWeight={800}>
                ¡Hola, {user?.nickname}!
              </Typography>
              <Typography variant="subtitle1">
                Representa a {user?.province?.name ?? 'tu provincia'} y llévala a la cima.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                <Chip icon={<FavoriteIcon />} label={`${livesInfo.lives}/5 vidas`} sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff' }} />
                <Chip icon={<PaidIcon />} label={`${user?.pesos ?? 0} Pesos`} sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff' }} />
                <Chip icon={<LocalFireDepartmentIcon />} label={`Racha ${user?.streakDays ?? 0} días`} sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff' }} />
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Avatar sx={{ bgcolor: 'secondary.main', width: 90, height: 90, mx: 'auto', fontSize: 40 }}>
                {user?.mascot?.name?.charAt(0)?.toUpperCase() ?? 'Q'}
              </Avatar>
              <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                Nivel {level} · {user?.mascot?.evolutionName ?? ''}
              </Typography>
            </Grid>
          </Grid>
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={levelProgress} sx={{ bgcolor: 'rgba(255,255,255,0.3)', '& .MuiLinearProgress-bar': { bgcolor: '#ffd54f' }, height: 10, borderRadius: 5 }} />
            <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
              XP: {user?.xp ?? 0}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {livesInfo.lives <= 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Te quedaste sin vidas. Próxima vida en {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')} minutos.
        </Alert>
      )}

      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Elige una categoría para jugar
      </Typography>
      <Grid container spacing={2}>
        {categories.map((cat) => (
          <Grid item xs={12} sm={6} md={4} key={cat.id}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>{cat.icon?.charAt(0)?.toUpperCase() || 'Q'}</Avatar>
                  <Typography variant="subtitle1" fontWeight={700}>{cat.name}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                  {cat.description}
                </Typography>
                <Button
                  variant="contained"
                  color={livesInfo.lives > 0 ? 'primary' : 'disabled'}
                  fullWidth
                  sx={{ mt: 2 }}
                  startIcon={<SportsEsportsIcon />}
                  disabled={livesInfo.lives <= 0}
                  onClick={() => startGame(cat.id)}
                >
                  {livesInfo.lives > 0 ? 'Jugar' : 'Sin vidas'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
