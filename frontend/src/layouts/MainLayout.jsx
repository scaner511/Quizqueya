import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Button,
} from '@mui/material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HomeIcon from '@mui/icons-material/Home';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PaidIcon from '@mui/icons-material/Paid';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext';

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);

  const current = location.pathname;
  const tabValue = current === '/jugar' ? 1 : current === '/ranking' ? 2 : 0;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky" color="primary" elevation={0}>
        <Toolbar sx={{ justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Typography variant="h6" fontWeight={800} sx={{ color: '#fff' }}>
              Quizqueya
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={<FavoriteIcon sx={{ color: '#ff8090 !important' }} />}
              label={user?.lives ?? 0}
              sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff' }}
              size="small"
            />
            <Chip
              icon={<PaidIcon sx={{ color: '#ffd54f !important' }} />}
              label={user?.pesos ?? 0}
              sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff' }}
              size="small"
            />
            <Chip
              icon={<LocalFireDepartmentIcon sx={{ color: '#ff7043 !important' }} />}
              label={`${user?.streakDays ?? 0} días`}
              sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff' }}
              size="small"
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ color: '#fff' }}>
              <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                {user?.nickname?.charAt(0)?.toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
              <MenuItem disabled>
                <Typography variant="body2">
                  {user?.nickname} · Nivel {user?.level ?? 1}
                </Typography>
              </MenuItem>
              {user?.province && (
                <MenuItem disabled>
                  <Typography variant="body2">{user.province.name}</Typography>
                </MenuItem>
              )}
              <MenuItem onClick={handleLogout}>
                <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Cerrar sesión
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flex: 1, pb: 10 }}>
        <Outlet />
      </Box>

      <Paper
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, boxShadow: 4 }}
        elevation={3}
      >
        <BottomNavigation
          value={tabValue}
          onChange={(e, newValue) => {
            const paths = ['/', '/jugar', '/ranking'];
            navigate(paths[newValue]);
          }}
          showLabels
          sx={{ borderTop: '1px solid #eee' }}
        >
          <BottomNavigationAction label="Inicio" icon={<HomeIcon />} />
          <BottomNavigationAction label="Jugar" icon={<SportsEsportsIcon />} />
          <BottomNavigationAction label="Ranking" icon={<EmojiEventsIcon />} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
