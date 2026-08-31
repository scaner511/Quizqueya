import { Container, Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
      <Typography variant="h3" fontWeight={800} color="primary">
        404
      </Typography>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Página no encontrada
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')}>
        Volver al inicio
      </Button>
    </Container>
  );
}
