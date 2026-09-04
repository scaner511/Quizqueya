import { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Collapse,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/client';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('es-DO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function GameDialog({ game, open, onClose }) {
  const [answers, setAnswers] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !game) return;
    setAnswers(null);
    setError(null);
    api
      .get(`/history/${game.id}`)
      .then(({ data }) => setAnswers(data.answers))
      .catch((err) => setError(err.response?.data?.message || 'No se pudo cargar el detalle'));
  }, [open, game]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Detalle de partida
        <Typography variant="body2" color="text.secondary">
          {game?.category?.name} · {game?.status}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {!answers && !error && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}
        {answers && (
          <List dense>
            {answers.map((a) => (
              <ListItem key={a.id} alignItems="flex-start" sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: a.isCorrect ? 'success.main' : 'error.main' }}>
                    {a.isCorrect ? '✓' : '✗'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={a.question?.text}
                  secondary={
                    <>
                      {a.isCorrect ? `+${a.xpEarned} XP · +${a.pesosEarned} Pesos` : 'Respuesta incorrecta'}
                      {a.question?.explanation && (
                        <>
                          <br />
                          <em>{a.question.explanation}</em>
                        </>
                      )}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function History() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    api
      .get('/history')
      .then(({ data }) => setHistory(data.history || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 3, color: '#fff' }}>
        Historial de partidas
      </Typography>
      {history.length === 0 ? (
        <Card variant="outlined">
          <CardContent>
            <Typography color="text.secondary" align="center">
              Aún no has terminado ninguna partida. ¡Ve a jugar!
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card variant="outlined">
          <List disablePadding>
            {history.map((g, i) => (
              <Box key={g.id}>
                {i > 0 && <Divider component="li" />}
                <ListItemButton onClick={() => setOpen(g)}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {g.category?.icon?.charAt(0)?.toUpperCase() || 'Q'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={g.category?.name ?? 'Partida'}
                    secondary={`${formatDate(g.updatedAt)} · ${g.status}`}
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                    <Chip
                      size="small"
                      label={`Puntuación: ${g.score}`}
                      color={g.score >= (g.correctAnswers / Math.max(1, g.totalQuestions)) * 100 ? 'primary' : 'default'}
                    />
                    <Chip size="small" label={`${g.correctAnswers}/${g.totalQuestions} correctas`} variant="outlined" />
                  </Box>
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <ExpandMoreIcon />
                  </IconButton>
                </ListItemButton>
              </Box>
            ))}
          </List>
        </Card>
      )}
      {open && <GameDialog game={open} open={!!open} onClose={() => setOpen(null)} />}
    </Container>
  );
}
