import { Box } from '@mui/material';

// Fondo de videojuego dominicano: gradiente nocturno con bandera sutil,
// nubes animadas, estrellas y destellos tenues. Se usa como capa de fondo.
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
      {/* ----- Capa de identidad dominicana (muy tenue) ----- */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        {/* Mapa de la República Dominicana (contorno central-derecha) */}
        <Box
          sx={{
            position: 'absolute',
            right: -40,
            top: '12%',
            opacity: 0.055,
          }}
        >
          <svg width="520" height="520" viewBox="0 0 120 120" fill="none">
            <g stroke="#FFD75E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 55 C15 42 30 40 38 44 C52 50 46 62 58 66 C68 70 74 66 82 70 C92 75 92 85 84 90 C74 97 60 95 56 88 C52 82 60 78 55 73 C49 67 40 70 34 66 C26 61 30 55 22 53 C16 51 6 60 10 55Z" />
              <path d="M8 56 L6 62" />
              <path d="M82 70 L86 64" />
            </g>
          </svg>
        </Box>

        {/* Monumento de Santiago (silueta esquina inferior izquierda) */}
        <Box
          sx={{
            position: 'absolute',
            left: 18,
            bottom: '8%',
            opacity: 0.06,
          }}
        >
          <svg width="160" height="190" viewBox="0 0 80 100" fill="none">
            <g stroke="#FFD75E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 100 L20 66 L40 52 L60 66 L60 100" />
              <path d="M34 52 L40 40 L46 52" />
              <path d="M28 60 L52 60" />
              <path d="M28 68 L52 68" />
              <path d="M30 74 L50 74" />
              <path d="M36 40 L36 30 M44 40 L44 30 M40 30 L40 20" />
            </g>
          </svg>
        </Box>

        {/* Faro a Colón (silueta esquina superior derecha) */}
        <Box
          sx={{
            position: 'absolute',
            right: 24,
            top: '6%',
            opacity: 0.055,
          }}
        >
          <svg width="120" height="170" viewBox="0 0 60 90" fill="none">
            <g stroke="#E11D2A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M30 10 L34 30 L44 44 L16 44 L26 30 Z" />
              <path d="M20 44 L40 44 L46 58 L14 58 Z" />
              <path d="M17 58 L43 58 L48 74 L12 74 Z" />
              <path d="M15 74 L45 74 L50 90 L10 90 Z" />
            </g>
          </svg>
        </Box>

        {/* Palma Real dominicana (silueta esquina superior izquierda) */}
        <Box
          sx={{
            position: 'absolute',
            left: 30,
            top: '4%',
            opacity: 0.05,
          }}
        >
          <svg width="120" height="170" viewBox="0 0 60 90" fill="none">
            <g stroke="#2EBD59" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M32 88 L34 44" />
              <path d="M34 48 C20 40 18 30 24 22 C30 30 40 32 46 40 Z" />
              <path d="M34 46 C46 34 50 26 52 18 C44 26 40 34 34 44" />
              <path d="M34 50 C24 60 18 58 14 52 C24 52 30 48 34 44" />
            </g>
          </svg>
        </Box>

        {/* Detalle patriótico: cruz dominicana sutil centrada a la izquierda */}
        <Box
          sx={{
            position: 'absolute',
            left: '8%',
            top: '42%',
            opacity: 0.04,
          }}
        >
          <svg width="200" height="200" viewBox="0 0 100 100">
            <rect x="40" y="0" width="20" height="100" fill="#1E4FAF" />
            <rect x="0" y="40" width="100" height="20" fill="#E11D2A" />
            <circle cx="50" cy="50" r="7" fill="#FFC10D" />
          </svg>
        </Box>
      </Box>

      {/* Cuadro de la bandera en una esquina */}
      <Box
        sx={{
          position: 'absolute',
          width: 90,
          height: 60,
          top: 16,
          left: 16,
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
          opacity: 0.55,
          transform: 'rotate(-8deg)',
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: '#fff' }} />
        <Box sx={{ position: 'absolute', top: 0, bottom: 0, left: '38%', width: '24%', bgcolor: '#1E4FAF' }} />
        <Box sx={{ position: 'absolute', top: '36%', bottom: 0, left: 0, right: 0, bgcolor: '#1E4FAF', clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }} />
        <Box sx={{ position: 'absolute', top: 0, bottom: '36%', left: 0, right: 0, bgcolor: '#E11D2A', clipPath: 'polygon(0 100%, 100% 100%, 100% 0)' }} />
        <Box sx={{ position: 'absolute', top: '45%', left: '45%', width: 12, height: 12, borderRadius: '50%', bgcolor: '#FFC10D', transform: 'translate(-50%,-50%)', border: '2px solid #fff' }} />
      </Box>

      {/* Estrellas doradas fijas, tenues y con parpadeo suave */}
      {[
        { t: 6, l: 62, s: 3, d: 0 },
        { t: 12, l: 82, s: 2, d: 1.2 },
        { t: 22, l: 40, s: 3, d: 0.6 },
        { t: 30, l: 70, s: 2, d: 2 },
        { t: 42, l: 15, s: 3, d: 1.6 },
        { t: 48, l: 55, s: 2, d: 0.3 },
        { t: 58, l: 85, s: 3, d: 2.4 },
        { t: 66, l: 30, s: 2, d: 1 },
        { t: 75, l: 68, s: 3, d: 0.8 },
        { t: 84, l: 48, s: 2, d: 1.8 },
        { t: 16, l: 8, s: 2, d: 0.4 },
        { t: 36, l: 92, s: 3, d: 2.2 },
      ].map((st, i) => (
        <Box
          key={`s${i}`}
          sx={{
            position: 'absolute',
            top: `${st.t}%`,
            left: `${st.l}%`,
            width: st.s,
            height: st.s,
            borderRadius: '50%',
            background: '#FFD75E',
            boxShadow: '0 0 6px rgba(255,215,94,0.6)',
            opacity: 0.05,
            animation: `twinkle ${4 + (i % 3)}s ease-in-out ${st.d}s infinite`,
            '@keyframes twinkle': {
              '0%,100%': { opacity: 0.04, transform: 'scale(1)' },
              '50%': { opacity: 0.1, transform: 'scale(1.4)' },
            },
          }}
        />
      ))}

      {/* Nubes animadas tenues */}
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: `${120 + i * 40}px`,
            height: `${45 + i * 14}px`,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
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

      {/* Monedas doradas flotantes, muy sutiles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Box
          key={`c${i}`}
          sx={{
            position: 'absolute',
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 30%, #FFD54F, #FFC10D 60%)',
            boxShadow: '0 2px 6px rgba(255,193,13,0.5)',
            top: `${(i * 11) % 80}%`,
            left: `${(i * 13 + 30) % 100}%`,
            opacity: 0.12,
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
