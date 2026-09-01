import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Avatar,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/client';

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [city, setCity] = useState(user?.city ?? '');
  const [country, setCountry] = useState(user?.country ?? 'República Dominicana');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const [saveErr, setSaveErr] = useState(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changing, setChanging] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);
  const [pwErr, setPwErr] = useState(null);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    setSaveErr(null);
    try {
      const { data } = await api.put('/auth/profile', { nickname, city, country });
      updateUser(data.user);
      setSaveMsg(data.message || 'Perfil actualizado');
    } catch (err) {
      setSaveErr(err.response?.data?.message || 'No se pudo actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg(null);
    setPwErr(null);
    if (newPassword !== confirmPassword) {
      setPwErr('Las contraseñas no coinciden');
      return;
    }
    setChanging(true);
    try {
      const { data } = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setPwMsg(data.message || 'Contraseña actualizada');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwErr(err.response?.data?.message || 'No se pudo cambiar la contraseña');
    } finally {
      setChanging(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>
        Mi perfil
      </Typography>

      {/* Resumen */}
      <Card sx={{ mb: 3, bgcolor: 'primary.main', color: '#fff' }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Avatar sx={{ bgcolor: 'secondary.main', width: 80, height: 80, fontSize: 36 }}>
            {user?.nickname?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={800}>{user?.nickname}</Typography>
            <Typography variant="body2">
              {user?.province?.name} · Mascota {user?.mascot?.name}
            </Typography>
            <Typography variant="body2">Nivel {user?.level ?? 1}</Typography>
          </Box>
        </CardContent>
      </Card>

      {saveMsg && <Alert severity="success" sx={{ mb: 2 }}>{saveMsg}</Alert>}
      {saveErr && <Alert severity="error" sx={{ mb: 2 }}>{saveErr}</Alert>}
      {pwMsg && <Alert severity="success" sx={{ mb: 2 }}>{pwMsg}</Alert>}
      {pwErr && <Alert severity="error" sx={{ mb: 2 }}>{pwErr}</Alert>}

      <Grid container spacing={3}>
        {/* Editar perfil */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Editar información
              </Typography>
              <Box component="form" onSubmit={handleSaveProfile}>
                <TextField
                  label="Nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  fullWidth
                  required
                  margin="normal"
                />
                <TextField
                  label="Ciudad"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="País"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} disabled={saving}>
                  {saving ? <CircularProgress size={20} color="inherit" /> : 'Guardar cambios'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Cambiar contraseña */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Cambiar contraseña
              </Typography>
              <Box component="form" onSubmit={handleChangePassword}>
                <TextField
                  label="Contraseña actual"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  fullWidth
                  required
                  margin="normal"
                />
                <TextField
                  label="Nueva contraseña"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  fullWidth
                  required
                  margin="normal"
                  helperText="Mínimo 6 caracteres"
                />
                <TextField
                  label="Confirmar nueva contraseña"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  fullWidth
                  required
                  margin="normal"
                />
                <Divider sx={{ my: 1 }} />
                <Button type="submit" variant="contained" color="secondary" fullWidth disabled={changing}>
                  {changing ? <CircularProgress size={20} color="inherit" /> : 'Cambiar contraseña'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
