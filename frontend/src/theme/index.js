import { createTheme } from '@mui/material/styles';

// Paleta inspirada en la bandera dominicana: azul ultramar, rojo bermellón y blanco
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#002868', // azul ultramar de la bandera
      dark: '#001a4d',
      light: '#3366a8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#CE1126', // rojo bermellón de la bandera
      dark: '#a50e1f',
      light: '#e0404f',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f4f6fa',
      paper: '#ffffff',
    },
    success: {
      main: '#2E7D32',
    },
    warning: {
      main: '#F9A825',
    },
    info: {
      main: '#0288D1',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 800 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          paddingTop: 10,
          paddingBottom: 10,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        },
      },
    },
  },
});

export default theme;
