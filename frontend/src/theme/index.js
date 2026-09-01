import { createTheme } from '@mui/material/styles';

// Paleta inspirada en la bandera dominicana y el Caribe, estilo videojuego premium.
const palette = {
  primary: {
    main: '#1E4FAF',      // azul dominicano vibrante
    dark: '#123A7F',
    light: '#3D6FD0',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#E11D2A',      // rojo dominicano
    dark: '#B01422',
    light: '#F04855',
    contrastText: '#ffffff',
  },
  success: {
    main: '#2EBD59',      // verde caribe
    dark: '#1F9A44',
    light: '#58D87F',
  },
  warning: {
    main: '#FFC10D',      // dorado
    dark: '#E0A500',
    light: '#FFD54F',
  },
  info: {
    main: '#00B5D1',      // turquesa caribe
    dark: '#008eA5',
    light: '#3ED0E8',
  },
  tertiary: {
    main: '#8E44AD',      // púrpura carnaval
    light: '#B06AD1',
  },
  green: {
    main: '#2E7D32',
  },
  orange: {
    main: '#F57C00',
  },
  background: {
    default: '#0B1F4B',   // azul noche dominicano de fondo
    paper: '#ffffff',
  },
};

// Tipografía redondeada tipo juego
const typography = {
  fontFamily: '"Baloo 2", "Nunito", "Segoe UI", system-ui, sans-serif',
  h1: { fontWeight: 800, letterSpacing: '-0.5px' },
  h2: { fontWeight: 800 },
  h3: { fontWeight: 800 },
  h4: { fontWeight: 800 },
  h5: { fontWeight: 800 },
  h6: { fontWeight: 800 },
  button: { textTransform: 'none', fontWeight: 800 },
};

const theme = createTheme({
  palette,
  typography,
  shape: {
    borderRadius: 18,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: `radial-gradient(circle at 20% 10%, #23408a 0%, #0B1F4B 45%, #06122e 100%)`,
          minHeight: '100vh',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          paddingTop: 12,
          paddingBottom: 12,
          boxShadow: '0 6px 0 rgba(0,0,0,0.25)',
          borderBottom: '4px solid rgba(0,0,0,0.2)',
          transition: 'transform 0.12s ease, box-shadow 0.12s ease, filter 0.12s ease',
          '&:active': {
            transform: 'translateY(3px) scale(0.98)',
            boxShadow: '0 2px 0 rgba(0,0,0,0.25)',
          },
          '&:hover': {
            transform: 'translateY(-1px) scale(1.02)',
            filter: 'brightness(1.05)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          border: '4px solid rgba(255,255,255,0.15)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 700,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          height: 12,
        },
      },
    },
  },
});

export default theme;
