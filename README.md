# QUIZQUEYA 🇩🇴

**"Aprende, compite y conquista la República Dominicana."**

Plataforma altamente gamificada centrada exclusivamente en la República Dominicana, que combina aprendizaje tipo Duolingo, competencia tipo Trivia Crack y guerras territoriales por provincia.

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite + Material UI (MUI) |
| Backend | Node.js + Express |
| Base de datos | PostgreSQL + Sequelize ORM |
| Autenticación | JWT + bcryptjs |
| Despliegue | Docker Compose |

---

## Estructura del proyecto

```
Quizqueya/
├── backend/                      # API REST (Node.js + Express + Sequelize)
│   ├── src/
│   │   ├── config/               # Configuración y conexión a BD
│   │   ├── models/               # Modelos Sequelize y asociaciones
│   │   ├── controllers/          # Lógica de negocio
│   │   ├── routes/               # Endpoints REST
│   │   ├── services/             # Progresión, vidas, dificultad adaptativa
│   │   ├── middlewares/          # Auth JWT, errores
│   │   └── utils/                # Scripts de seed
│   └── package.json
├── frontend/                     # SPA (React + Vite + MUI)
│   ├── src/
│   │   ├── api/                  # Cliente HTTP con interceptores JWT
│   │   ├── contexts/             # AuthContext (sesión)
│   │   ├── layouts/              # Layout principal con navegación
│   │   ├── pages/                # Login, Registro, Dashboard, Juego, Ranking
│   │   └── theme/                # Paleta patriótica dominicana
│   └── package.json
├── docker-compose.yml            # Orquesta db + backend + frontend
└── README.md
```

---

## Modelo de datos

- **users** — nickname (único), age, email (único), password (hash bcrypt), provinceId, mascotId, país/ciudad/foto (opcionales), xp, level, pesos (moneda del juego), lives (máx 5), streakDays, totalCorrect, totalWrong, totalGames.
- **provinces** — las 32 provincias de la República Dominicana con código y región.
- **categories** — las categorías del quiz (Historia, Cultura, Geografía, Gastronomía, etc.).
- **questions** — pregunta con tipo (`opcion_multiple`, `verdadero_falso`, etc.), dificultad (`facil`, `media`, `dificil`, `experto`), opciones, índice correcto y explicación educativa.
- **user_answers** — cada respuesta dada por un usuario (XP y pesos ganados, tiempo restante).
- **games** — partidas con racha correcta consecutiva, dificultad adaptativa y puntuación.
- **mascots** — mascotas inspiradas en LIDOM con niveles evolutivos (Novato, Guerrero, Capitán, Legendario).

---

## Funcionalidades del MVP

### Registro
Solicita nickname, edad, correo, contraseña, provincia a representar y mascota inicial. Opcionales: país, ciudad y foto de perfil.

### Sistema de vidas
Máximo 5 vidas con regeneración independiente por temporizador (25/30/35/40/45 minutos). Se pierde una vida al fallar o agotar tiempo.

### Dificultad adaptativa
Cada 5 respuestas correctas consecutivas sube la dificultad (Fácil → Media → Difícil → Experto), con un sesgo según la edad del jugador.

### Moneda y XP
Los jugadores ganan **Pesos Quizqueya** y XP por respuestas correctas. Los niveles se calculan según el XP acumulado.

### Rachas diarias
Se registra la racha de días consecutivos jugados (1, 3, 7, 15, 30, 60, 100, 365 días).

### Ranking
Ranking global de jugadores y ranking por provincia (puntos acumulados de sus representantes).

### Cambio de provincia
Restringido a cada 90 días.

---

## Requisitos previos

- Node.js ≥ 18
- PostgreSQL ≥ 13
- Docker + Docker Compose (opcional)

## Instalación y ejecución local

### 1. Base de datos
```sql
CREATE DATABASE quizqueya;
```

### 2. Backend
```bash
cd backend
cp .env.example .env        # edita credenciales según tu entorno
npm install
npm run seed                # crea tablas, provincias, categorías, preguntas y usuario demo
npm run dev                 # API en http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev                 # app en http://localhost:5173
```

El frontend usa proxy de Vite: `/api` → `http://localhost:5000`.

### Usuario demo
| Email | Contraseña |
|---|---|
| `demo@quizqueya.com` | `Quizqueya123!` |

---

## Despliegue con Docker

```bash
docker compose up -d --build
```

- App: http://localhost:8080
- API: http://localhost:5000/api

---

## Endpoints principales

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Registro de jugador |
| POST | `/api/auth/login` | Inicio de sesión |
| GET | `/api/auth/me` | Perfil del usuario |
| GET | `/api/catalog/provinces` | Provincias (público) |
| GET | `/api/catalog/categories` | Categorías (público) |
| GET | `/api/catalog/mascots` | Mascotas iniciales (público) |
| GET | `/api/state` | Estado del jugador (vidas, racha, pesos) |
| POST | `/api/games` | Iniciar partida |
| GET | `/api/games/:id/question` | Siguiente pregunta (dificultad adaptativa) |
| POST | `/api/games/:id/answer` | Responder pregunta |
| POST | `/api/games/:id/end` | Terminar partida |
| GET | `/api/provinces/leaderboard` | Ranking de jugadores (público) |
| GET | `/api/provinces/province-ranking` | Ranking por provincia (público) |
| POST | `/api/provinces/change-province` | Cambiar provincia (cada 90 días) |

---

## Scripts útiles

```bash
# Backend
npm run dev       # servidor con recarga automática
npm start         # servidor en producción
npm run seed      # recrea tablas y datos demo
npm run check     # valida sintaxis de los archivos

# Frontend
npm run dev       # entorno de desarrollo
npm run build     # build de producción en /dist
npm run preview   # previsualizar build
```

## Próximos pasos (roadmap)

- Mapa completo de la República Dominicana con la **Batalla Nacional** por provincia (oro/plata/bronce).
- Comodines (eliminar dos respuestas, congelar tiempo, +15s, saltar pregunta, segunda oportunidad, multiplicador XP, pista).
- Más de 50 preguntas por categoría y nuevas categorías.
- Evolución de mascotas con apariencia y animaciones.
- Sistema de retos, torneos y aportes de la comunidad.
- Localización para la **diáspora** con clasificación "RD Global".
