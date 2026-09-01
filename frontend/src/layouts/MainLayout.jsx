import { useState } from 'react';
import {
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
} from '@mui/material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HomeIcon from '@mui/icons-material/Home';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PaidIcon from '@mui/icons-material/Paid';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';
import StorefrontIcon from '@mui/icons-material/Storefront';
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
      {/* Barra superior tipo juego */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'linear-gradient(180deg, #123A7F, #0B1F4B)',
          borderBottom: '4px solid rgba(255,193,13,0.5)',
          boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
          px: 2,
          py: 1,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Box sx={{ fontSize: 28, mr: 1 }}>🦅</Box>
            <Typography
              variant="h6"
              fontWeight={900}
              sx={{ color: '#fff', textShadow: '0 3px 0 #0B1F4B', letterSpacing: 1 }}
            >
              QUIZQUEYA
            </Typography>
          </Box>

          {/* Contadores estilo juego */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              icon={<FavoriteIcon sx={{ color: '#ff8fa5 !important' }} />}
              label={user?.lives ?? 0}
              sx={{ bgcolor: 'rgba(255,255,255,0.16)', color: '#fff', border: '2px solid rgba(255,255,255,0.2)' }}
            />
            <Chip
              icon={<PaidIcon sx={{ color: '#FFD54F !important' }} />}
              label={user?.pesos ?? 0}
              sx={{ bgcolor: 'rgba(255,255,255,0.16)', color: '#fff', border: '2px solid rgba(255,255,255,0.2)' }}
            />
            <Chip
              icon={<LocalFireDepartmentIcon sx={{ color: '#ff9e80 !important' }} />}
              label={`${user?.streakDays ?? 0} días`}
              sx={{ bgcolor: 'rgba(255,255,255,0.16)', color: '#fff', border: '2px solid rgba(255,255,255,0.2)' }}
            />
          </Box>

          <IconButton
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ color: '#fff', border: '2px solid rgba(255,255,255,0.3)' }}
          >
            <Avatar sx={{ bgcolor: 'warning.main', width: 34, height: 34, fontWeight: 900 }}>
              {user?.nickname?.charAt(0)?.toUpperCase()}
            </Avatar>
          </IconButton>

          <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled>
              <Typography variant="body2" fontWeight={700}>
                {user?.nickname} · Nivel {user?.level ?? 1}
              </Typography>
            </MenuItem>
            {user?.province && (
              <MenuItem disabled>
                <Typography variant="body2">{user.province.name}</Typography>
              </MenuItem>
            )}
            <MenuItem onClick={() => { setAnchorEl(null); navigate('/tienda'); }}>
              <StorefrontIcon fontSize="small" sx={{ mr: 1 }} /> Tienda
            </MenuItem>
            <MenuItem onClick={() => { setAnchorEl(null); navigate('/historial'); }}>
              <HistoryIcon fontSize="small" sx={{ mr: 1 }} /> Historial
            </MenuItem>
            <MenuItem onClick={() => { setAnchorEl(null); navigate('/perfil'); }}>
              <PersonIcon fontSize="small" sx={{ mr: 1 }} /> Mi perfil
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Cerrar sesión
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Contenido: las páginas proveen su propio fondo */}
      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', pb: 10 }}>
        <Outlet />
      </Box>

      {/* Barra de navegación inferior tipo juego */}
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          bgcolor: '#0B1F4B',
          borderTop: '4px solid rgba(255,193,13,0.5)',
          boxShadow: '0 -6px 20px rgba(0,0,0,0.4)',
        }}
        elevation={3}
      >
        <BottomNavigation
          value={tabValue}
          onChange={(e, newValue) => {
            const paths = ['/', '/jugar', '/ranking'];
            navigate(paths[newValue]);
          }}
          showLabels
          sx={{ bgcolor: 'transparent' }}
          slotProps={{ root: { color: 'White' } }}
        >
          <BottomNavigationAction label="Inicio" icon={<HomeIcon />} sx={{ color: '#fff', '&.Mui-selected': { color: '#FFC10D' } }} />
          <BottomNavigationAction label="Jugar" icon={<SportsEsportsIcon />} sx={{ color: '#fff', '&.Mui-selected': { color: '#FFC10D' } }} />
          <BottomNavigationAction label="Ranking" icon={<EmojiEventsIcon />} sx={{ color: '#fff', '&.Mui-selected': { color: '#FFC10D' } }} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
