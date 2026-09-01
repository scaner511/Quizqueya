import { Box } from '@mui/material';

// Fondo de videojuego dominicano: gradiente nocturno con bandera sutil,
// nubes animadas y destellos. Se usa como capa de fondo en las pantallas.
export default function GameBackground({ children, minHeight = '100vh' }) {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight,
        overflowX: 'hidden',
        background:
          'radial-gradient(circle at 20% 10%, #23408a 0%, #0B1F4B 45%, #06122e 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(120deg, rgba(255,255,255,0.04) 0%, transparent 50%, rgba(255,255,255,0.02) 100%)',
          pointerEvents: 'none',
        },
        // Banda diagonal con los colores de la bandera dominicana
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          width: '40%',
          height: '70%',
          background: 'linear-gradient(160deg, #1E4FAF 0%, transparent 60%)',
          opacity: 0.35,
          pointerEvents: 'none',
        },
      }}
    >
      {/* Cuadro de la bandera en una esquina */}
      <Box
        sx={{
          position: 'absolute',
          width: 90,
          height: 60,
          top: 20,
          left: 20,
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
          opacity: 0.9,
          transform: 'rotate(-8deg)',
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: '#fff' }} />
        <Box sx={{ position: 'absolute', top: 0, bottom: 0, left: '38%', width: '24%', bgcolor: '#1E4FAF' }} />
        <Box sx={{ position: 'absolute', top: '36%', bottom: 0, left: 0, right: 0, bgcolor: '#1E4FAF', clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }} />
        <Box sx={{ position: 'absolute', top: 0, bottom: '36%', left: 0, right: 0, bgcolor: '#E11D2A', clipPath: 'polygon(0 100%, 100% 100%, 100% 0)' }} />
        <Box sx={{ position: 'absolute', top: '45%', left: '45%', width: 12, height: 12, borderRadius: '50%', bgcolor: '#FFC10D', transform: 'translate(-50%,-50%)', border: '2px solid #fff' }} />
      </Box>

      {/* Nubes animadas */}
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: `${120 + i * 40}px`,
            height: `${45 + i * 14}px`,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)',
            filter: 'blur(6px)',
            top: `${15 + i * 18}%`,
            left: `${i * 30}%`,
            animation: `drift ${20 + i * 8}s linear infinite`,
            '@keyframes drift': {
              '0%': { transform: 'translateX(-120px)' },
              '100%': { transform: 'translateX(110vw)' },
            },
          }}
        />
      ))}

      {/* Monedas doradas flotantes de fondo */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Box
          key={`c${i}`}
          sx={{
            position: 'absolute',
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 30%, #FFD54F, #FFC10D 60%)',
            boxShadow: '0 2px 6px rgba(255,193,13,0.6)',
            top: `${(i * 11) % 80}%`,
            left: `${(i * 13 + 30) % 100}%`,
            opacity: 0.5,
            animation: `floaty ${6 + i * 2}s ease-in-out ${i * 0.6}s infinite`,
            '@keyframes floaty': {
              '0%,100%': { transform: 'translateY(0) scale(1)' },
              '50%': { transform: 'translateY(-18px) scale(1.15)' },
            },
          }}
        />
      ))}

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {children}
      </Box>
    </Box>
  );
}
