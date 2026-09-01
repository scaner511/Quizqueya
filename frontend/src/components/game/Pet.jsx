import { Box, keyframes } from '@mui/material';

const bounce = keyframes`
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-14px) scale(1.06, 0.96); }
`;

const wiggle = keyframes`
  0%, 100% { transform: rotate(0); }
  25% { transform: rotate(-6deg); }
  75% { transform: rotate(6deg); }
`;

const blink = keyframes`
  0%, 92%, 100% { transform: scaleY(1); }
  95% { transform: scaleY(0.1); }
`;

// Mascota animada del juego: emoji con rebote, parpadeo y giro.
// pet: { emoji, color, name }
export default function Pet({ pet, size = 96, animation = 'bounce', sx }) {
  const anim =
    animation === 'bounce'
      ? `${bounce} 2.4s ease-in-out infinite`
      : animation === 'wiggle'
        ? `${wiggle} 1.6s ease-in-out infinite`
        : 'none';

  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: anim,
        ...sx,
      }}
    >
      {/* Halo con el color de la mascota */}
      <Box
        sx={{
          position: 'absolute',
          inset: '8%',
          borderRadius: '50%',
          background: `radial-gradient(circle at 50% 40%, ${pet?.color || '#FFC10D'}66, ${pet?.color || '#FFC10D'}22)`,
          filter: 'blur(6px)',
        }}
      />
      {/* Emoji "ojos" que parpadean sobre el cuerpo */}
      <Box
        sx={{
          fontSize: size * 0.62,
          lineHeight: 1,
          filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.35))',
          animation: `${blink} 4s ease-in-out infinite`,
        }}
      >
        {pet?.emoji || pet?.name?.charAt(0)?.toUpperCase() || '🐾'}
      </Box>
    </Box>
  );
}
