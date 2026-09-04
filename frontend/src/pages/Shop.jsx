import { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Chip,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Alert,
} from '@mui/material';
import PaidIcon from '@mui/icons-material/Paid';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/client';

function ItemCard({ item, pesos, onBuy }) {
  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Avatar sx={{ bgcolor: 'secondary.light' }}>{item.emoji || '?'}</Avatar>
          <Typography variant="subtitle1" fontWeight={700}>{item.name}</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
          {item.description}
        </Typography>
        <Chip
          icon={<PaidIcon sx={{ color: '#b8860b !important' }} />}
          label={`${item.price} Pesos`}
          size="small"
          sx={{ my: 1, alignSelf: 'flex-start' }}
        />
        <Button
          variant="contained"
          fullWidth
          disabled={pesos < item.price}
          onClick={() => onBuy(item)}
        >
          {pesos < item.price ? 'Sin dinero' : 'Comprar'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function Shop() {
  const { user, updateUser } = useAuth();
  const [items, setItems] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [pesos, setPesos] = useState(user?.pesos ?? 0);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(null);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [qtyDialog, setQtyDialog] = useState(null);

  const loadInventory = async () => {
    try {
      const { data } = await api.get('/shop/inventory');
      setInventory(data.inventory || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: itemRes }, { data: stateRes }] = await Promise.all([
          api.get('/shop/items'),
          api.get('/state'),
        ]);
        setItems(itemRes.items || []);
        setPesos(stateRes.user.pesos);
        updateUser({ pesos: stateRes.user.pesos });
        await loadInventory();
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openBuy = (item) => {
    setMsg(null);
    setErr(null);
    setQuantity(1);
    setQtyDialog(item);
  };

  const confirmBuy = async () => {
    if (!qtyDialog) return;
    setBuying(qtyDialog.id);
    setMsg(null);
    setErr(null);
    try {
      const { data } = await api.post('/shop/buy', {
        powerUpId: qtyDialog.id,
        quantity,
      });
      setPesos(data.pesos);
      updateUser({ pesos: data.pesos });
      setMsg(data.message);
      setQtyDialog(null);
      await loadInventory();
    } catch (e) {
      setErr(e.response?.data?.message || 'No se pudo comprar');
      setQtyDialog(null);
    } finally {
      setBuying(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" fontWeight={800} sx={{ color: '#fff' }}>
          Tienda de comodines
        </Typography>
        <Chip
          icon={<PaidIcon sx={{ color: '#b8860b !important' }} />}
          label={`${pesos} Pesos`}
          color="warning"
        />
      </Box>

      {msg && <Alert severity="success" sx={{ mb: 2 }}>{msg}</Alert>}
      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

      <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#fff' }}>
        Comodines disponibles
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {items.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <ItemCard item={item} pesos={pesos} onBuy={openBuy} />
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#fff' }}>
        Mi inventario
      </Typography>
      {inventory.length === 0 ? (
        <Card variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
              <Inventory2Icon />
              <Typography>No tienes comodines todavía. ¡Compra algunos arriba!</Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card variant="outlined">
          <List>
            {inventory.map((p) => (
              <ListItem key={p.powerUpId}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'secondary.light' }}>{p.emoji || '?'}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={p.name} secondary={p.type} />
                <Chip label={`x${p.quantity}`} color="primary" />
              </ListItem>
            ))}
          </List>
        </Card>
      )}

      <Dialog open={!!qtyDialog} onClose={() => setQtyDialog(null)} fullWidth maxWidth="xs">
        <DialogTitle>Comprar {qtyDialog?.name}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Precio unitario: {qtyDialog?.price} Pesos
            </Typography>
            <input
              type="number"
              min="1"
              max="99"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
              style={{
                padding: '10px 14px',
                border: '1px solid #ccc',
                borderRadius: 8,
                fontSize: 16,
                fontFamily: 'inherit',
              }}
            />
            <Typography variant="body2" fontWeight={700}>
              Total: {(qtyDialog?.price ?? 0) * quantity} Pesos
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQtyDialog(null)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={confirmBuy}
            disabled={!!buying || pesos < (qtyDialog?.price ?? 0) * quantity}
          >
            {buying ? <CircularProgress size={18} color="inherit" /> : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
