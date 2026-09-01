import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Link,
  Avatar,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import GameBackground from '../components/game/GameBackground';
import Pet from '../components/game/Pet';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GameBackground>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
          {/* Logo y mascota */}
          <Box sx={{ mb: 2 }}>
            <Pet
              pet={{ emoji: '🦅', name: 'Aguilita', color: '#F9A825' }}
              size={110}
              animation="bounce"
            />
          </Box>
          <Typography
            variant="h3"
            fontWeight={900}
            sx={{
              color: '#fff',
              textShadow: '0 4px 0 #123A7F, 0 8px 18px rgba(0,0,0,0.5)',
              letterSpacing: 1,
            }}
          >
            QUIZQUEYA
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.85)', mt: 0.5, fontWeight: 600 }}>
            Aprende, compite y conquista la República Dominicana.
          </Typography>

          {/* Cartel del login como "taquilla de juego" */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              mt: 3,
              borderRadius: 4,
              p: 3,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.06))',
              border: '3px solid rgba(255,255,255,0.25)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.25)',
              backdropFilter: 'blur(6px)',
            }}
          >
            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              label="Correo electrónico"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                mb: 2,
                '& .MuiInputBase-root': { bgcolor: 'rgba(255,255,255,0.92)', borderRadius: 2 },
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
              }}
              InputProps={{ sx: { borderRadius: 2 } }}
            />
            <TextField
              label="Contraseña"
              type="password"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                mb: 3,
                '& .MuiInputBase-root': { bgcolor: 'rgba(255,255,255,0.92)', borderRadius: 2 },
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
              }}
              InputProps={{ sx: { borderRadius: 2 } }}
            />

            <Button
              type="submit"
              variant="contained"
              color="warning"
              fullWidth
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={22} color="inherit" /> : <LockIcon />}
              sx={{ fontSize: '1.1rem' }}
            >
              {loading ? 'Entrando...' : '¡Jugar ahora!'}
            </Button>

            <Typography sx={{ color: 'rgba(255,255,255,0.9)', mt: 2 }}>
              ¿Nuevo en quizqueya?{' '}
              <Link onClick={() => navigate('/registro')} sx={{ color: '#FFC10D', fontWeight: 800 }}>
                Crea tu cuenta
              </Link>
            </Typography>
          </Box>

          {/* Insignia demo */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 40, height: 40 }}>🦅</Avatar>
          </Box>
        </Box>
      </Box>
    </GameBackground>
  );
}
