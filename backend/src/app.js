const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config/config');
const { notFound, errorHandler } = require('./middlewares/error.middleware');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const corsOrigins = config.corsOrigin === '*' ? true : config.corsOrigin.split(',').map((o) => o.trim());
app.use(cors({ origin: corsOrigins, credentials: true }));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiados intentos. Intenta nuevamente más tarde.' },
});

// Rutas públicas
app.use('/api/auth', authLimiter, require('./routes/auth.routes'));
app.use('/api/catalog', require('./routes/catalog.routes'));
app.use('/api/shop', require('./routes/shop.routes'));
app.use('/api/provinces', require('./routes/province.routes'));

// Rutas del juego y del historial (con auth)
app.use('/api/history', require('./routes/history.routes'));
app.use('/api', require('./routes/game.routes'));

app.use('/api', (req, res) => {
  res.json({
    name: 'Quizqueya API',
    slogan: 'Aprende, compite y conquista la República Dominicana.',
    version: '1.0.0',
    status: 'ok',
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
