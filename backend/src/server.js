const app = require('./app');
const { sequelize } = require('./models');
const config = require('./config/config');

(async function bootstrap() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a PostgreSQL establecida');

    if (config.env !== 'production') {
      await sequelize.sync();
      console.log('Modelos sincronizados (solo desarrollo)');
    }

    app.listen(config.port, () => {
      console.log(`Quizqueya API en http://localhost:${config.port}`);
    });
  } catch (err) {
    console.error('Error al iniciar el servidor:', err.message);
    process.exit(1);
  }
})();
