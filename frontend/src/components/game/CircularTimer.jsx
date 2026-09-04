import { Box, Typography } from '@mui/material';

function colorFor(t, total) {
  const ratio = t / Math.max(1, total);
  if (ratio > 0.5) return '#2EBD59';
  if (ratio > 0.25) return '#FFC10D';
  return '#E11D2A';
}

// Cronómetro circular estilo videojuego (anillo SVG con número al centro)
export default function CircularTimer({ timeLeft, totalSeconds, frozen, size = 110 }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.min(1, Math.max(0, timeLeft / Math.max(1, totalSeconds)));
  const offset = circumference * (1 - ratio);
  const color = frozen ? '#00B5D1' : colorFor(timeLeft, totalSeconds);

  return (
    <Box sx={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="rgba(0,0,0,0.35)"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="9"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s ease' }}
          filter="drop-shadow(0 0 6px rgba(255,255,255,0.4))"
        />
      </svg>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="h5"
          fontWeight={900}
          sx={{ color, textShadow: '0 2px 0 rgba(0,0,0,0.4)' }}
        >
          {frozen ? '⏸' : timeLeft}
        </Typography>
      </Box>
    </Box>
  );
}
