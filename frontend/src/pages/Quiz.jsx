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
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/client';

const TOTAL_SECONDS = 30;

function levelColor(t) {
  if (t > 15) return '#2E7D32'; // verde
  if (t > 10) return '#F9A825'; // amarillo
  if (t > 5) return '#F57C00'; // naranja
  return '#D32F2F'; // rojo
}

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

  const gameId = locState?.gameId;

  // Cargar la primera pregunta
  useEffect(() => {
    const load = async () => {
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
    if (gameId) load();
  }, [gameId]);

  // Temporizador
  useEffect(() => {
    if (!question || selected !== null || result || answeredRef.current) return;
    setTimeLeft(TOTAL_SECONDS);
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
  }, [question, selected, result]);

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

  // Determina si una opción debe marcarse como correcta/incorrecta tras responder
  const response = result?.result;
  const correctIdx = response?.correctIndex;
  const isCorrectOption = (index) => result && correctIdx === index;
  const isWrongSelection = (index) => result && !response?.isCorrect && selected === index && index !== correctIdx;

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      {/* Encabezado del juego */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Chip icon={<FavoriteIcon />} label={`${lives}/5`} color={lives > 1 ? 'primary' : 'error'} />
        <Chip
          label={`Racha correctas: ${game?.correctStreak ?? 0}`}
          color={(game?.correctStreak ?? 0) >= 5 ? 'success' : 'default'}
        />
        <Chip label={`Dificultad: ${question.difficulty}`} color="default" />
      </Box>

      {/* Temporizador */}
      <LinearProgress
        variant="determinate"
        value={(timeLeft / TOTAL_SECONDS) * 100}
        sx={{ height: 10, borderRadius: 5, mb: 1, '& .MuiLinearProgress-bar': { bgcolor: levelColor(timeLeft) } }}
      />
      <Typography variant="h5" fontWeight={800} align="center" sx={{ mb: 2, color: levelColor(timeLeft) }}>
        {timeLeft}s
      </Typography>

      {/* Pregunta */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700}>
            {question.text}
          </Typography>
          {question.mediaUrl && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <img src={question.mediaUrl} alt="media" style={{ maxWidth: '100%', borderRadius: 8 }} />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Opciones */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {(question.options || []).map((opt, i) => {
          const correctSelected = isCorrectOption(i);
          const wrongSelected = isWrongSelection(i);
          const disabled = selected !== null;
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
            {!result.result.isCorrect && result.result.explanation && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {result.result.explanation}
              </Typography>
            )}
            {result.result.isCorrect && result.result.explanation && (
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
    </Container>
  );
}
