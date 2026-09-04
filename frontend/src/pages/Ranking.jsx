import { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Chip,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import api from '../api/client';

export default function Ranking() {
  const [tab, setTab] = useState(0);
  const [players, setPlayers] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (tab === 0) {
          const { data } = await api.get('/provinces/leaderboard');
          setPlayers(data.ranking || []);
        } else {
          const { data } = await api.get('/provinces/province-ranking');
          setProvinces(data.ranking || []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tab]);

  const medal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}.`;
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <EmojiEventsIcon color="primary" />
        <Typography variant="h5" fontWeight={800} sx={{ color: '#fff' }}>
          Ranking
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="fullWidth">
          <Tab label="Jugadores" />
          <Tab label="Provincias" />
        </Tabs>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : tab === 0 ? (
        <List>
          {players.map((p) => (
            <ListItem key={p.id} divider>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: p.rank === 1 ? '#FFD700' : p.rank === 2 ? '#C0C0C0' : p.rank === 3 ? '#CD7F32' : 'primary.main' }}>
                  {p.rank}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography fontWeight={700} sx={{ color: '#fff' }}>{p.nickname}</Typography>
                    <Chip size="small" label={`${p.province?.name ?? ''}`} variant="outlined" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }} />
                  </Box>
                }
                secondary={
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                    {`Nivel ${p.level} · Racha ${p.streakDays} días`}
                  </Typography>
                }
              />
              <Typography fontWeight={700} sx={{ color: '#FFC10D' }}>
                {p.xp} XP
              </Typography>
            </ListItem>
          ))}
        </List>
      ) : (
        <List>
          {provinces.map((p) => (
            <ListItem key={p.provinceId} divider>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: p.rank === 1 ? '#FFD700' : p.rank === 2 ? '#C0C0C0' : p.rank === 3 ? '#CD7F32' : 'secondary.main' }}>
                  {medal(p.rank)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={<Typography fontWeight={700} sx={{ color: '#fff' }}>{p.name}</Typography>}
                secondary={
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                    {`${p.players} jugadores`}
                  </Typography>
                }
              />
              <Typography fontWeight={700} sx={{ color: '#FFC10D' }}>
                {p.totalXp} XP
              </Typography>
            </ListItem>
          ))}
        </List>
      )}
    </Container>
  );
}
