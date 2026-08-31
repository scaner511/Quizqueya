import { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Link,
  Card,
  CardActionArea,
  CardContent,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PetsIcon from '@mui/icons-material/Pets';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/client';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [provinces, setProvinces] = useState([]);
  const [mascots, setMascots] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nickname: '',
    age: '',
    email: '',
    password: '',
    country: 'República Dominicana',
    city: '',
    provinceId: '',
    mascotId: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [p, m] = await Promise.all([
          api.get('/catalog/provinces'),
          api.get('/catalog/mascots'),
        ]);
        setProvinces(p.data.provinces || []);
        setMascots(m.data.mascots || []);
      } catch {
        setError('No se pudieron cargar los datos. Intenta de nuevo.');
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.provinceId) return setError('Selecciona tu provincia');
    if (!form.mascotId) return setError('Elige tu mascota');
    setLoading(true);
    try {
      await register({
        nickname: form.nickname,
        age: parseInt(form.age, 10),
        email: form.email,
        password: form.password,
        country: form.country,
        city: form.city || undefined,
        provinceId: parseInt(form.provinceId, 10),
        mascotId: parseInt(form.mascotId, 10),
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarte');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight={800} color="primary.main">
            Crea tu cuenta
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Elige tu provincia y tu mascota para comenzar la aventura.
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField label="Nickname" fullWidth required value={form.nickname} onChange={set('nickname')} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Edad" type="number" fullWidth required inputProps={{ min: 6, max: 120 }} value={form.age} onChange={set('age')} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Correo electrónico" type="email" fullWidth required value={form.email} onChange={set('email')} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Contraseña" type="password" fullWidth required value={form.password} onChange={set('password')} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="País de residencia" fullWidth value={form.country} onChange={set('country')} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Ciudad" fullWidth value={form.city} onChange={set('city')} />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Provincia a representar</InputLabel>
                <Select label="Provincia a representar" value={form.provinceId} onChange={set('provinceId')}>
                  {provinces.map((p) => (
                    <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Elige tu mascota inicial</Typography>
              <Grid container spacing={1}>
                {mascots.map((m) => (
                  <Grid item xs={6} sm={4} key={m.id}>
                    <Card
                      variant="outlined"
                      sx={{
                        borderColor: form.mascotId === m.id ? 'primary.main' : '#ddd',
                        bgcolor: form.mascotId === m.id ? 'primary.light' : 'transparent',
                        color: form.mascotId === m.id ? '#fff' : 'inherit',
                      }}
                    >
                      <CardActionArea onClick={() => setForm((f) => ({ ...f, mascotId: m.id }))}>
                        <CardContent sx={{ textAlign: 'center', p: 2 }}>
                          <PetsIcon sx={{ fontSize: 40, color: m.color }} />
                          <Typography variant="body2" fontWeight={700}>{m.name}</Typography>
                          <Typography variant="caption" color={form.mascotId === m.id ? '#fff' : 'text.secondary'}>
                            {m.evolutionName}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>

          <Button type="submit" variant="contained" color="primary" fullWidth size="large" sx={{ mt: 3 }} disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Crear cuenta y jugar'}
          </Button>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2">
            ¿Ya tienes cuenta?{' '}
            <Link component="button" onClick={() => navigate('/login')} sx={{ fontWeight: 700 }}>
              Inicia sesión
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
