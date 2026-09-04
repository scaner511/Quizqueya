import { useEffect, useRef, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Tooltip,
  Snackbar,
  Card,
  CardContent,
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
import GameBackground from '../components/game/GameBackground';
import CircularTimer from '../components/game/CircularTimer';

const TOTAL_SECONDS = 30;

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

  const [gameId, setGameId] = useState(locState?.gameId);

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

  // Cargar la primera pregunta + inventario. Si no llega gameId (botón "Jugar" de la navegación),
  // se crea la partida primero y luego se carga la primera pregunta.
  useEffect(() => {
    const loadGame = async (id) => {
      try {
        const [qRes, invRes] = await Promise.all([
          api.get(`/games/${id}/question`),
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

    const init = async () => {
      if (gameId) {
        await loadGame(gameId);
        return;
      }
      try {
        const { data } = await api.post('/games', {});
        setGameId(data.game.id);
        await loadGame(data.game.id);
      } catch (err) {
        setLoading(false);
        if (err.response?.status === 429) {
          setLives(0);
        }
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <GameBackground>
        <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Box sx={{ fontSize: 90, mb: 2 }}>{game?.correctAnswers > (game?.totalQuestions || 1) / 2 ? '🏆' : '🎯'}</Box>
          <Typography variant="h3" fontWeight={900} sx={{ color: '#FFC10D', textShadow: '0 4px 0 #0B1F4B' }}>
            ¡Partida terminada!
          </Typography>
          <Box
            sx={{
              mt: 3,
              mx: 'auto',
              maxWidth: 320,
              p: 3,
              borderRadius: 4,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.06))',
              border: '3px solid rgba(255,255,255,0.25)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
            }}
          >
            <Typography variant="h5" fontWeight={900} sx={{ color: '#fff' }}>
              {game?.correctAnswers ?? 0} correctas
            </Typography>
            <Typography variant="h4" fontWeight={900} sx={{ color: '#FFC10D', mt: 1 }}>
              {game?.score ?? 0} pts
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="warning"
            size="large"
            onClick={() => navigate('/')}
            sx={{ mt: 4, px: 5, fontSize: '1.1rem' }}
          >
            Volver al inicio
          </Button>
        </Container>
      </GameBackground>
    );
  }

  if (loading || !question) {
    return (
      <GameBackground>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <CircularProgress color="warning" />
        </Box>
      </GameBackground>
    );
  }

  const response = result?.result;
  const correctIdx = response?.correctIndex;
  const isCorrectOption = (index) => result && correctIdx === index;
  const isWrongSelection = (index) => result && !response?.isCorrect && selected === index && index !== correctIdx;

  const available = (inventory || []).filter((p) => p.quantity > 0 && !result);

  return (
    <GameBackground>
      <Container maxWidth="sm" sx={{ py: 3, position: 'relative', zIndex: 1 }}>
        {/* Encabezado del juego */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip icon={<FavoriteIcon sx={{ color: '#ff8fa5 !important' }} />} label={`${lives}/5`} sx={{ bgcolor: 'rgba(255,255,255,0.16)', color: '#fff' }} />
          <Chip
            label={`Racha: ${game?.correctStreak ?? 0}`}
            color={(game?.correctStreak ?? 0) >= 5 ? 'success' : 'default'}
          />
          <Chip label={`${question.difficulty} · ${game?.score ?? 0} pts`} sx={{ bgcolor: 'rgba(255,255,255,0.16)', color: '#fff' }} />
          {multiplierActive && (
            <Chip icon={<BoltIcon sx={{ color: '#ffd54f !important' }} />} label="XP x2" color="warning" />
          )}
          {isFrozen && (
            <Chip icon={<AcUnitIcon />} label="Congelado" color="info" />
          )}
        </Box>

        {/* Temporizador circular */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <CircularTimer timeLeft={timeLeft} totalSeconds={currentSeconds} frozen={isFrozen} />
        </Box>

        {/* Pregunta */}
        <Card sx={{ mb: 2, background: 'linear-gradient(180deg, #ffffff, #f2f5ff)', borderTop: `6px solid ${question.difficulty === 'facil' ? '#2EBD59' : question.difficulty === 'media' ? '#3D6FD0' : question.difficulty === 'dificil' ? '#F57C00' : '#E11D2A'}` }}>
          <CardContent>
            <Typography variant="h6" fontWeight={800}>
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
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          {available.length === 0 ? (
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Compra comodines en la tienda para ayudas.
            </Typography>
          ) : (
            available.map((p) => (
              <Tooltip key={p.powerUpId} title={`${p.name} (x${p.quantity})`}>
                <span>
                  <Button
                    size="small"
                    color="warning"
                    variant="contained"
                    disabled={!!usingPower}
                    onClick={() => usePowerUp(p.powerUpId, p.slug)}
                    sx={{ borderRadius: 10, minWidth: 52, px: 1.5 }}
                  >
                    {usingPower === p.slug ? <CircularProgress size={18} color="inherit" /> : POWER_ICONS[p.slug] || '?'}
                    <Box component="span" sx={{ fontSize: 11, ml: 0.5 }}>x{p.quantity}</Box>
                  </Button>
                </span>
              </Tooltip>
            ))
          )}
        </Box>
      )}

      {/* Opciones grandes */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {(question.options || []).map((opt, i) => {
          const hidden = hiddenOptions.includes(i);
          const correctSelected = isCorrectOption(i);
          const wrongSelected = isWrongSelection(i);
          const disabled = selected !== null || hidden;
          if (hidden) return null;
          const letter = String.fromCharCode(65 + i);
          return (
            <Button
              key={i}
              variant="contained"
              fullWidth
              disabled={disabled}
              onClick={() => submitAnswer(i, timeLeft)}
              sx={{
                justifyContent: 'flex-start',
                textAlign: 'left',
                py: 1.8,
                px: 2,
                fontSize: '1.02rem',
                color: correctSelected || wrongSelected ? '#fff' : '#123A7F',
                bgcolor: correctSelected ? '#2EBD59' : wrongSelected ? '#E11D2A' : '#ffffff',
                border: '3px solid rgba(255,255,255,0.35)',
                boxShadow: `0 6px 0 ${correctSelected ? '#1F9A44' : wrongSelected ? '#B01422' : '#B8C4E0'}, 0 8px 20px rgba(0,0,0,0.35)`,
                '&:hover:not(:disabled)': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 9px 0 ${correctSelected ? '#1F9A44' : wrongSelected ? '#B01422' : '#B8C4E0'}, 0 10px 24px rgba(0,0,0,0.4)`,
                },
                '&:disabled': { opacity: 1 },
              }}
            >
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  mr: 1.5,
                  borderRadius: '50%',
                  bgcolor: 'rgba(18,58,127,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  color: '#123A7F',
                  flexShrink: 0,
                }}
              >
                {letter}
              </Box>
              <Box sx={{ flex: 1 }}>{opt}</Box>
              {correctSelected && <CheckCircleIcon sx={{ color: '#fff' }} />}
              {wrongSelected && <CancelIcon sx={{ color: '#fff' }} />}
            </Button>
          );
        })}
      </Box>


      {/* Feedback */}
      {result && (
        <Box
          sx={{
            mt: 3,
            p: 2.5,
            borderRadius: 3,
            background: result.result.isCorrect
              ? 'linear-gradient(180deg, #3EF07A, #2EBD59)'
              : 'linear-gradient(180deg, #FF5A67, #E11D2A)',
            border: '3px solid rgba(255,255,255,0.4)',
            boxShadow: `0 6px 0 ${result.result.isCorrect ? '#1F9A44' : '#B01422'}, 0 10px 26px rgba(0,0,0,0.4)`,
            color: '#fff',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            {result.result.isCorrect ? (
              <CheckCircleIcon sx={{ fontSize: 40 }} />
            ) : (
              <CancelIcon sx={{ fontSize: 40 }} />
            )}
            <Typography variant="h6" fontWeight={900}>
              {result.result.timedOut
                ? '¡Tiempo agotado!'
                : result.result.isCorrect
                  ? '¡Correcto!'
                  : '¡Incorrecto!'}
            </Typography>
          </Box>
          <Typography variant="body1" fontWeight={700}>
            {result.result.isCorrect ? `+${result.result.xpEarned} XP · +${result.result.pesosEarned} Pesos` : `+${result.result.xpEarned} XP`}
          </Typography>
          {result.result.explanation && (
            <Typography variant="body2" sx={{ mt: 1, fontWeight: 500 }}>
              {result.result.explanation}
            </Typography>
          )}
          {result.livesLost > 0 && (
            <Typography variant="body2" sx={{ mt: 1, fontWeight: 700 }}>
              💔 Perdiste una vida.
            </Typography>
          )}
          {result.userStats?.levelUp && (
            <Typography variant="body2" fontWeight={800} sx={{ mt: 1 }}>
              ⬆️ ¡Subiste al nivel {result.userStats.level}!
            </Typography>
          )}
          <Button
            variant="contained"
            size="large"
            fullWidth
            sx={{ mt: 2, fontSize: '1.05rem', color: result.result.isCorrect ? '#123A7F' : '#fff', bgcolor: '#fff' }}
            onClick={nextQuestion}
            disabled={lives <= 0 && !result.result.isCorrect && result.livesLost > 0}
          >
            {lives <= 0 && result.livesLost > 0 ? 'Sin vidas' : 'Siguiente ▶'}
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
    </GameBackground>
  );
}
