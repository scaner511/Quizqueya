import { useEffect, useRef, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  LinearProgress,
  Card,
  CardContent,
  Alert,
  Chip,
  CircularProgress,
  Tooltip,
  Snackbar,
  IconButton,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import TimerIcon from '@mui/icons-material/Timer';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import BoltIcon from '@mui/icons-material/Bolt';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/client';

const TOTAL_SECONDS = 30;

function levelColor(t) {
  if (t > 15) return '#2E7D32';
  if (t > 10) return '#F9A825';
  if (t > 5) return '#F57C00';
  return '#D32F2F';
}

const POWER_ICONS = {
  eliminar_dos: <RemoveCircleOutlineIcon fontSize="small" />,
  congelar: <AcUnitIcon fontSize="small" />,
  mas_tiempo: <TimerIcon fontSize="small" />,
  saltar: <SkipNextIcon fontSize="small" />,
  multiplicador_xp: <BoltIcon fontSize="small" />,
  pista: <LightbulbIcon fontSize="small" />,
};

export default function Quiz() {
  const { state: locState } = useLocation();
  const navigate = useNavigate();
  const { updateUser, user } = useAuth();

  const [game, setGame] = useState(null);
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [lives, setLives] = useState(user?.lives ?? 5);
  const timerRef = useRef(null);
  const answeredRef = useRef(false);
  const [ended, setEnded] = useState(false);

  // Estado de comodines
  const [inventory, setInventory] = useState([]);
  const [hiddenOptions, setHiddenOptions] = useState([]);
  const [hint, setHint] = useState(null);
  const [extraTime, setExtraTime] = useState(0);
  const [isFrozen, setIsFrozen] = useState(false);
  const [frozenRemaining, setFrozenRemaining] = useState(0);
  const [multiplierActive, setMultiplierActive] = useState(false);
  const [snack, setSnack] = useState(null);
  const [usingPower, setUsingPower] = useState(null);

  const gameId = locState?.gameId;

  const showSnack = (msg) => setSnack(msg);
  const closeSnack = () => setSnack(null);

  // Efecto de un comodín sobre el estado local
  const applyPowerEffect = (data) => {
    switch (data.type) {
      case 'eliminar_dos':
        setHiddenOptions(data.removeIndices || []);
        showSnack('Se eliminaron 2 opciones incorrectas');
        break;
      case 'pista':
        setHint(data.hint);
        showSnack(`Pista: la respuesta empieza con "${data.hint}"`);
        break;
      case 'mas_tiempo':
        setExtraTime((et) => et + (data.extraSeconds || 0));
        showSnack(`+${data.extraSeconds || 0} segundos`);
        break;
      case 'congelar':
        setFrozenRemaining(data.frozenQuestions || 3);
        setIsFrozen(true);
        showSnack('¡Tiempo congelado por 3 preguntas!');
        break;
      case 'saltar':
        showSnack('Pregunta saltada');
        setTimeout(() => nextQuestion(), 600);
        break;
      case 'multiplicador_xp':
        setMultiplierActive(true);
        showSnack('¡Multiplicador de XP activo!');
        break;
      default:
        break;
    }
  };

  const usePowerUp = async (powerUpId, slug) => {
    if (answeredRef.current || result) return;
    if (usingPower) return;
    setUsingPower(slug);
    try {
      const { data } = await api.post(`/games/${gameId}/powerup`, {
        powerUpId,
        questionId: question.id,
      });
      // Actualizar inventario local (decrementar cantidad)
      setInventory((inv) =>
        inv.map((p) => (p.powerUpId === powerUpId ? { ...p, quantity: p.quantity - 1 } : p)),
      );
      applyPowerEffect(data);
    } catch (err) {
      showSnack(err.response?.data?.message || 'No se pudo usar el comodín');
    } finally {
      setUsingPower(null);
    }
  };

  // Cargar la primera pregunta + inventario
  useEffect(() => {
    const load = async () => {
      try {
        const [qRes, invRes] = await Promise.all([
          api.get(`/games/${gameId}/question`),
          api.get('/shop/inventory'),
        ]);
        setGame(qRes.data.game);
        setQuestion(qRes.data.question);
        setInventory((invRes.data.inventory || []).filter((p) => p.quantity > 0));
      } catch (err) {
        if (err.response?.status === 404) {
          await endGame();
        }
      } finally {
        setLoading(false);
      }
    };
    if (gameId) load();
  }, [gameId]);

  // Al cargar cada pregunta nueva, gestionar el congelamiento del reloj
  useEffect(() => {
    setHiddenOptions([]);
    setHint(null);
    setExtraTime(0);

    // La vista previa de saltar maneja su propio flujo
    if (!question) return;

    if (frozenRemaining > 0 && !result) {
      setIsFrozen(true);
      setFrozenRemaining((f) => f - 1);
    } else if (!result) {
      setIsFrozen(false);
    }
  }, [question]);

  // Temporizador
  useEffect(() => {
    if (!question || selected !== null || result || answeredRef.current) return;
    if (isFrozen) return;
    setTimeLeft(TOTAL_SECONDS + extraTime);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          submitAnswer(null, 0);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [question, selected, result, isFrozen, extraTime]);

  const currentSeconds = TOTAL_SECONDS + extraTime;

  const submitAnswer = async (index, time) => {
    if (answeredRef.current) return;
    answeredRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    setSelected(index);
    try {
      const { data } = await api.post(`/games/${gameId}/answer`, {
        questionId: question.id,
        selectedIndex: index,
        timeLeft: time,
      });
      setResult(data);
      setLives(data.lives);
      updateUser(data.userStats || {});
      // Si se respondió correctamente y había multiplicador, se consumió
      if (data.result?.isCorrect) setMultiplierActive(false);
    } catch (err) {
      answeredRef.current = false;
    }
  };

  const nextQuestion = async () => {
    setSelected(null);
    setResult(null);
    setQuestion(null);
    setLoading(true);
    answeredRef.current = false;
    setIsFrozen(false);
    try {
      const { data } = await api.get(`/games/${gameId}/question`);
      setGame(data.game);
      setQuestion(data.question);
    } catch (err) {
      if (err.response?.status === 404) {
        await endGame();
      }
    } finally {
      setLoading(false);
    }
  };

  const endGame = async () => {
    try {
      await api.post(`/games/${gameId}/end`);
    } catch {
      // ignore
    }
    setEnded(true);
  };

  if (ended) {
    return (
      <Container maxWidth="sm" sx={{ py: 6, textAlign: 'center' }}>
        <Card>
          <CardContent>
            <Typography variant="h4" fontWeight={800} sx={{ mb: 2 }}>
              ¡Partida terminada!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Correctas: {game?.correctAnswers ?? 0} · Puntuación: {game?.score ?? 0}
            </Typography>
            <Button variant="contained" color="primary" onClick={() => navigate('/')}>
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (loading || !question) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const response = result?.result;
  const correctIdx = response?.correctIndex;
  const isCorrectOption = (index) => result && correctIdx === index;
  const isWrongSelection = (index) => result && !response?.isCorrect && selected === index && index !== correctIdx;

  const available = (inventory || []).filter((p) => p.quantity > 0 && !result);

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      {/* Encabezado del juego */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Chip icon={<FavoriteIcon />} label={`${lives}/5`} color={lives > 1 ? 'primary' : 'error'} />
        <Chip
          label={`Racha: ${game?.correctStreak ?? 0}`}
          color={(game?.correctStreak ?? 0) >= 5 ? 'success' : 'default'}
        />
        <Chip label={`${question.difficulty}`} color="default" />
        {multiplierActive && (
          <Chip icon={<BoltIcon sx={{ color: '#ffd54f !important' }} />} label="XP x2" color="warning" />
        )}
        {isFrozen && (
          <Chip icon={<AcUnitIcon />} label="Tiempo congelado" color="info" />
        )}
      </Box>

      {/* Temporizador */}
      <LinearProgress
        variant="determinate"
        value={(timeLeft / currentSeconds) * 100}
        sx={{ height: 10, borderRadius: 5, mb: 1, '& .MuiLinearProgress-bar': { bgcolor: isFrozen ? '#0288d1' : levelColor(timeLeft) } }}
      />
      <Typography variant="h5" fontWeight={800} align="center" sx={{ mb: 2, color: isFrozen ? '#0288d1' : levelColor(timeLeft) }}>
        {isFrozen ? '⏸' : `${timeLeft}s`}
      </Typography>

      {/* Pregunta */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700}>
            {question.text}
          </Typography>
          {hint && (
            <Typography variant="body2" sx={{ mt: 1, fontWeight: 700, color: 'secondary.main' }}>
              💡 Pista: empieza con &ldquo;{hint}&rdquo;
            </Typography>
          )}
          {question.mediaUrl && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <img src={question.mediaUrl} alt="media" style={{ maxWidth: '100%', borderRadius: 8 }} />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Barra de comodines */}
      {!result && (
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          {available.length === 0 ? (
            <Typography variant="caption" color="text.secondary">
              No tienes comodines. Cómpralos en la tienda.
            </Typography>
          ) : (
            available.map((p) => (
              <Tooltip key={p.powerUpId} title={`${p.name} (x${p.quantity})`}>
                <span>
                  <IconButton
                    size="small"
                    color="secondary"
                    disabled={!!usingPower}
                    onClick={() => usePowerUp(p.powerUpId, p.slug)}
                    sx={{ border: '1px solid #ddd' }}
                  >
                    {usingPower === p.slug ? <CircularProgress size={18} /> : POWER_ICONS[p.slug] || '?'}
                    <span style={{ fontSize: 11, marginLeft: 2 }}>x{p.quantity}</span>
                  </IconButton>
                </span>
              </Tooltip>
            ))
          )}
        </Box>
      )}

      {/* Opciones */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {(question.options || []).map((opt, i) => {
          const hidden = hiddenOptions.includes(i);
          const correctSelected = isCorrectOption(i);
          const wrongSelected = isWrongSelection(i);
          const disabled = selected !== null || hidden;
          if (hidden) return null;
          return (
            <Button
              key={i}
              variant="outlined"
              fullWidth
              disabled={disabled}
              onClick={() => submitAnswer(i, timeLeft)}
              sx={{
                justifyContent: 'flex-start',
                textAlign: 'left',
                py: 1.5,
                px: 2,
                borderColor: correctSelected ? '#2E7D32' : wrongSelected ? '#D32F2F' : '#ddd',
                bgcolor: correctSelected ? 'success.light' : wrongSelected ? 'error.light' : 'transparent',
                color: correctSelected || wrongSelected ? '#fff' : 'inherit',
                '&:hover': { borderColor: 'primary.main', bgcolor: disabled ? undefined : 'primary.light' },
              }}
            >
              {correctSelected && <CheckCircleIcon sx={{ mr: 1 }} />}
              {wrongSelected && <CancelIcon sx={{ mr: 1 }} />}
              {opt}
            </Button>
          );
        })}
      </Box>

      {/* Feedback */}
      {result && (
        <Box sx={{ mt: 3 }}>
          <Alert severity={result.result.isCorrect ? 'success' : 'error'} icon={result.result.isCorrect ? <CheckCircleIcon /> : <CancelIcon />}>
            <Typography fontWeight={700}>
              {result.result.timedOut
                ? '¡Tiempo agotado!'
                : result.result.isCorrect
                  ? `¡Correcto! +${result.result.xpEarned} XP · +${result.result.pesosEarned} Pesos`
                  : `Incorrecto. +${result.result.xpEarned} XP`}
            </Typography>
            {result.result.explanation && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {result.result.explanation}
              </Typography>
            )}
            {result.livesLost > 0 && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Perdiste una vida.
              </Typography>
            )}
            {result.userStats?.levelUp && (
              <Typography variant="body2" fontWeight={700} sx={{ mt: 1 }}>
                ¡Subiste al nivel {result.userStats.level}!
              </Typography>
            )}
          </Alert>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{ mt: 2 }}
            onClick={nextQuestion}
            disabled={lives <= 0 && !result.result.isCorrect && result.livesLost > 0}
          >
            {lives <= 0 && result.livesLost > 0 ? 'Sin vidas' : 'Siguiente pregunta'}
          </Button>
        </Box>
      )}

      <Snackbar
        open={!!snack}
        autoHideDuration={2500}
        onClose={closeSnack}
        message={snack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
}
