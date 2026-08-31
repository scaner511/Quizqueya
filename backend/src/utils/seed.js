const { sequelize, User, Province, Category, Question, Mascot } = require('../models');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    await sequelize.sync({ force: true });
    console.log('Tablas recreadas');

    // ---------- PROVINCIAS ----------
    const provinces = [
      { name: 'Distrito Nacional', code: 'DN', region: 'Ozama' },
      { name: 'Santo Domingo', code: 'SD', region: 'Ozama' },
      { name: 'Santiago', code: 'ST', region: 'Cibao Norte' },
      { name: 'La Vega', code: 'VE', region: 'Cibao Sur' },
      { name: 'Puerto Plata', code: 'PP', region: 'Cibao Norte' },
      { name: 'Samaná', code: 'SM', region: 'Cibao Nordeste' },
      { name: 'Duarte', code: 'DU', region: 'Cibao Nordeste' },
      { name: 'San Cristóbal', code: 'SC', region: 'Valdesia' },
      { name: 'Barahona', code: 'BH', region: 'Enriquillo' },
      { name: 'Pedernales', code: 'PN', region: 'Enriquillo' },
      { name: 'Dajabón', code: 'DA', region: 'Cibao Noroeste' },
      { name: 'La Altagracia', code: 'AL', region: 'Yuma' },
      { name: 'La Romana', code: 'RO', region: 'Yuma' },
      { name: 'El Seibo', code: 'SE', region: 'Yuma' },
      { name: 'San Pedro de Macorís', code: 'SP', region: 'Higuamo' },
      { name: 'Monte Plata', code: 'MP', region: 'Higuamo' },
      { name: 'Hato Mayor', code: 'HM', region: 'Higuamo' },
      { name: 'Monseñor Nouel', code: 'MN', region: 'Cibao Sur' },
      { name: 'Sánchez Ramírez', code: 'SR', region: 'Cibao Sur' },
      { name: 'Espaillat', code: 'ES', region: 'Cibao Norte' },
      { name: 'María Trinidad Sánchez', code: 'MT', region: 'Cibao Nordeste' },
      { name: 'Hermanas Mirabal', code: 'MI', region: 'Cibao Nordeste' },
      { name: 'Valverde', code: 'VA', region: 'Cibao Noroeste' },
      { name: 'Montecristi', code: 'MC', region: 'Cibao Noroeste' },
      { name: 'Santiago Rodríguez', code: 'SRD', region: 'Cibao Noroeste' },
      { name: 'Azua', code: 'AZ', region: 'Valdesia' },
      { name: 'Peravia', code: 'PE', region: 'Valdesia' },
      { name: 'San José de Ocoa', code: 'SJ', region: 'Valdesia' },
      { name: 'Bahoruco', code: 'BA', region: 'Enriquillo' },
      { name: 'Independencia', code: 'IN', region: 'Enriquillo' },
      { name: 'San Juan', code: 'JU', region: 'El Valle' },
      { name: 'Elías Piña', code: 'EP', region: 'El Valle' },
    ];

    const createdProvinces = await Province.bulkCreate(provinces);
    const provinceMap = {};
    createdProvinces.forEach((p) => { provinceMap[p.code] = p; });
    console.log(`${createdProvinces.length} provincias creadas`);

    // ---------- CATEGORÍAS ----------
    const categories = [
      { name: 'Historia Dominicana', slug: 'historia-dominicana', description: 'Eventos que forjaron la nación.', icon: 'history' },
      { name: 'Cultura Dominicana', slug: 'cultura-dominicana', description: 'Tradiciones y costumbres.', icon: 'palette' },
      { name: 'Geografía', slug: 'geografia', description: 'Relieve, ríos y ubicación del país.', icon: 'map' },
      { name: 'Provincias', slug: 'provincias', description: 'Cada rincón del territorio.', icon: 'flag' },
      { name: 'Gastronomía', slug: 'gastronomia', description: 'Sabores dominicanos.', icon: 'restaurant' },
      { name: 'Música Dominicana', slug: 'musica-dominicana', description: 'Merengue, bachata y más.', icon: 'music' },
      { name: 'Deportes', slug: 'deportes', description: 'Béisbol, baloncesto y competencias.', icon: 'sports' },
      { name: 'Símbolos Patrios', slug: 'simbolos-patrios', description: 'Bandera, escudo e himno.', icon: 'star' },
      { name: 'Personajes Históricos', slug: 'personajes-historicos', description: 'Héroes y figuras clave.', icon: 'person' },
      { name: 'Presidentes', slug: 'presidentes', description: 'Líderes de la nación.', icon: 'account' },
    ];

    const createdCategories = await Category.bulkCreate(categories);
    const catMap = {};
    createdCategories.forEach((c) => { catMap[c.slug] = c; });
    console.log(`${createdCategories.length} categorías creadas`);

    // ---------- MASCOTAS ----------
    const mascots = [
      { name: 'Aguilita', slug: 'aguilita', animal: 'Águila', evolutionLevel: 1, evolutionName: 'Novato', color: '#F9A825' },
      { name: 'Tigrecito', slug: 'tigrecito', animal: 'Tigre', evolutionLevel: 1, evolutionName: 'Novato', color: '#1565C0' },
      { name: 'Leoncito', slug: 'leoncito', animal: 'León', evolutionLevel: 1, evolutionName: 'Novato', color: '#CE1126' },
      { name: 'Torito', slug: 'torito', animal: 'Toro', evolutionLevel: 1, evolutionName: 'Novato', color: '#F57C00' },
      { name: 'Caballito', slug: 'caballito', animal: 'Caballo', evolutionLevel: 1, evolutionName: 'Novato', color: '#6A1B9A' },
      { name: 'Elefantico', slug: 'elefantico', animal: 'Elefante', evolutionLevel: 1, evolutionName: 'Novato', color: '#2E7D32' },
    ];
    const createdMascots = await Mascot.bulkCreate(mascots);
    console.log(`${createdMascots.length} mascotas creadas`);

    // ---------- PREGUNTAS ----------
    const questions = buildQuestions(catMap);
    await Question.bulkCreate(questions);
    console.log(`${questions.length} preguntas creadas`);

    // ---------- USUARIO DEMO ----------
    const password = await bcrypt.hash('Quizqueya123!', 10);
    await User.create({
      nickname: 'Quisqueyano',
      age: 25,
      email: 'demo@quizqueya.com',
      password,
      provinceId: provinceMap['DN'].id,
      mascotId: createdMascots[0].id,
      country: 'República Dominicana',
      city: 'Santo Domingo',
      provinceChangedAt: new Date(),
      xp: 0,
      pesos: 200,
      lives: 5,
    });
    console.log('Usuario demo creado: demo@quizqueya.com / Quizqueya123!');

    console.log('Seed completado correctamente.');
  } catch (err) {
    console.error('Error en el seed:', err);
    process.exit(1);
  }
}

function buildQuestions(catMap) {
  const q = [];

  // ---------------- HISTORIA ----------------
  const hist = catMap['historia-dominicana'].id;
  q.push({ categoryId: hist, type: 'opcion_multiple', difficulty: 'facil', text: '¿En qué año se proclamó la Independencia Dominicana?', options: ['1844', '1821', '1861', '1801'], correctIndex: 0, explanation: 'La independencia se proclamó el 27 de febrero de 1844.' });
  q.push({ categoryId: hist, type: 'verdadero_falso', difficulty: 'facil', text: 'La República Dominicana comparte la isla La Española con Haití.', options: ['Verdadero', 'Falso'], correctIndex: 0, explanation: 'Sí, Haití ocupa la parte oeste de la isla.' });
  q.push({ categoryId: hist, type: 'opcion_multiple', difficulty: 'facil', text: '¿Quién proclamó la independencia nacional el 27 de febrero de 1844?', options: ['Juan Pablo Duarte', 'Ramón Matías Mella', 'Francisco del Rosario Sánchez', 'Gregorio Luperón'], correctIndex: 2, explanation: 'Francisco del Rosario Sánchez proclamó la independencia en la Puerta del Conde.' });
  q.push({ categoryId: hist, type: 'opcion_multiple', difficulty: 'facil', text: '¿En nombre de cuál fundador se conoce a la sociedad secreta "La Trinitaria"?', options: ['Juan Pablo Duarte', 'Francisco del Rosario Sánchez', 'Ramón Matías Mella', 'Juan Sánchez Ramírez'], correctIndex: 0, explanation: 'La Trinitaria fue fundada por Juan Pablo Duarte en 1838.' });
  q.push({ categoryId: hist, type: 'opcion_multiple', difficulty: 'facil', text: '¿Qué suceso ocurrió el 30 de mayo de 1961?', options: ['El ajusticiamiento de Trujillo', 'La Independencia Nacional', 'La Restauración', 'La Revolución de Abril'], correctIndex: 0, explanation: 'El dictador Rafael Leonidas Trujillo fue ajusticiado el 30 de mayo de 1961.' });
  q.push({ categoryId: hist, type: 'opcion_multiple', difficulty: 'media', text: '¿En qué año se produjo la Guerra de la Restauración?', options: ['1863', '1844', '1879', '1916'], correctIndex: 0, explanation: 'La Restauración inició en 1863 contra la anexión a España.' });
  q.push({ categoryId: hist, type: 'opcion_multiple', difficulty: 'media', text: '¿Qué líder restaurador es conocido como "El Restaurador"?', options: ['Gregorio Luperón', 'Juan Pablo Duarte', 'Rafael Trujillo', 'Ulises Heureaux'], correctIndex: 0, explanation: 'Gregorio Luperón fue uno de los principales líderes restauradores.' });
  q.push({ categoryId: hist, type: 'verdadero_falso', difficulty: 'facil', text: 'Cristóbal Colón llegó a la isla La Española en su primer viaje en 1492.', options: ['Verdadero', 'Falso'], correctIndex: 0, explanation: 'Llegó el 5 de diciembre de 1492.' });
  q.push({ categoryId: hist, type: 'opcion_multiple', difficulty: 'media', text: '¿En qué año llegaron los primeros europeos a La Española?', options: ['1492', '1510', '1498', '1502'], correctIndex: 0, explanation: 'Colón llegó en 1492 y fundó el primer asentamiento.' });
  q.push({ categoryId: hist, type: 'opcion_multiple', difficulty: 'media', text: '¿Cuál fue la primera ciudad fundada por los europeos en América?', options: ['La Isabela', 'Santo Domingo', 'Santiago', 'Puerto Plata'], correctIndex: 0, explanation: 'La Isabela fue fundada en 1493 aunque luego se abandonó.' });
  q.push({ categoryId: hist, type: 'opcion_multiple', difficulty: 'dificil', text: '¿En qué batalla se enfrentó la República Dominicana durante la Restauración en 1864?', options: ['Batalla de 30 de Marzo', 'Batalla de Las Carreras', 'Batalla de Santomé', 'Batalla de Sabana Larga'], correctIndex: 1, explanation: 'La Batalla de Las Carreras (1864) fue decisiva en la Restauración.' });
  q.push({ categoryId: hist, type: 'opcion_multiple', difficulty: 'dificil', text: '¿Quién fue el presidente dominicano que promulgó la primera Constitución en 1844?', options: ['Pedro Santana', 'Buenaventura Báez', 'Juan Pablo Duarte', 'Ramón Matías Mella'], correctIndex: 0, explanation: 'Pedro Santana promulgó la primera Constitución en San Cristóbal.' });
  q.push({ categoryId: hist, type: 'verdadero_falso', difficulty: 'dificil', text: 'La primera Constitución dominicana se proclamó en la ciudad de San Cristóbal.', options: ['Verdadero', 'Falso'], correctIndex: 0, explanation: 'Sí, el 6 de noviembre de 1844.' });
  q.push({ categoryId: hist, type: 'opcion_multiple', difficulty: 'dificil', text: 'En 1916, la República Dominicana fue ocupada por:', options: ['Estados Unidos', 'España', 'Francia', 'Inglaterra'], correctIndex: 0, explanation: 'Estados Unidos ocupó el país de 1916 a 1924.' });
  q.push({ categoryId: hist, type: 'opcion_multiple', difficulty: 'dificil', text: '¿Cuántos años duró la dictadura de Rafael Trujillo?', options: ['31 años', '10 años', '25 años', '40 años'], correctIndex: 0, explanation: 'Trujillo gobernó desde 1930 hasta su muerte en 1961, 31 años.' });
  q.push({ categoryId: hist, type: 'opcion_multiple', difficulty: 'experto', text: '¿En qué año se realizó la matanza de haitianos conocida como "El Corte" ordenada por Trujillo?', options: ['1937', '1940', '1930', '1945'], correctIndex: 0, explanation: 'En octubre de 1937 se produjo la matanza de haitianos en la frontera.' });
  q.push({ categoryId: hist, type: 'opcion_multiple', difficulty: 'experto', text: '¿Quién dirigió la Guerra de Abril de 1965?', options: ['Francisco Caamaño', 'Juan Bosch', 'Joaquín Balaguer', 'Elias Wessin'], correctIndex: 0, explanation: 'El coronel Francisco Alberto Caamaño lideró la Revolución de Abril.' });
  q.push({ categoryId: hist, type: 'opcion_multiple', difficulty: 'experto', text: '¿En qué año se firmó la anexión de la República Dominicana a España?', options: ['1861', '1844', '1870', '1855'], correctIndex: 0, explanation: 'Pedro Santana anexó la República a España en 1861.' });

  // ---------------- CULTURA ----------------
  const cul = catMap['cultura-dominicana'].id;
  q.push({ categoryId: cul, type: 'opcion_multiple', difficulty: 'facil', text: '¿Cuál es el dulce típico dominicano hecho de coco?', options: ['Dulce de coco', 'Majarete', 'Habichuelas con dulce', 'Arroz con leche'], correctIndex: 1, explanation: 'El majarete es un postre tradicional de maíz y coco.' });
  q.push({ categoryId: cul, type: 'opcion_multiple', difficulty: 'facil', text: '¿Qué se conmemora el 27 de febrero en República Dominicana?', options: ['La Independencia Nacional', 'La Restauración', 'El Día de las Madres', 'La Batalla de 30 de Marzo'], correctIndex: 0, explanation: 'Es el Día de la Independencia Nacional.' });
  q.push({ categoryId: cul, type: 'opcion_multiple', difficulty: 'facil', text: '¿Qué es el "colmado" en la cultura dominicana?', options: ['Una tienda de barrio', 'Un plato típico', 'Una fiesta', 'Un baile'], correctIndex: 0, explanation: 'El colmado es la típica tienda de abarrotes del barrio.' });
  q.push({ categoryId: cul, type: 'verdadero_falso', difficulty: 'facil', text: 'El Carnaval dominicano se celebra principalmente en febrero y marzo.', options: ['Verdadero', 'Falso'], correctIndex: 0, explanation: 'El carnaval dominicano se celebra durante los fines de semana de febrero y marzo.' });
  q.push({ categoryId: cul, type: 'opcion_multiple', difficulty: 'media', text: '¿Cómo se llama el personaje tradicional del carnaval vegano?', options: ['Diablo Cojuelo', 'Guloya', 'Cachúa', 'Papelús'], correctIndex: 0, explanation: 'El Diablo Cojuelo es el personaje insignia del carnaval de La Vega.' });
  q.push({ categoryId: cul, type: 'opcion_multiple', difficulty: 'media', text: '¿Qué plato se considera el "plato nacional" dominicano?', options: ['La bandera', 'Sancocho', 'Mangú', 'Pastelón'], correctIndex: 0, explanation: 'La bandera: arroz, habichuelas y carne.' });
  q.push({ categoryId: cul, type: 'opcion_multiple', difficulty: 'media', text: '¿En qué provincia es famoso el carnaval con "guloyas"?', options: ['San Pedro de Macorís', 'La Vega', 'Santiago', 'Puerto Plata'], correctIndex: 0, explanation: 'Las guloyas son una tradición de San Pedro de Macorís.' });
  q.push({ categoryId: cul, type: 'opcion_multiple', difficulty: 'media', text: '¿Qué bebida típica dominicana se hace con maíz?', options: ['Chicha de maíz', 'Morir soñando', 'Mabí', 'Jugo de chinola'], correctIndex: 2, explanation: 'El mabí es una bebida fermentada de maíz o corteza de árbol.' });
  q.push({ categoryId: cul, type: 'opcion_multiple', difficulty: 'dificil', text: '¿Qué es el "Teteo" en la cultura dominicana?', options: ['Una fiesta popular', 'Un deporte', 'Un plato', 'Una danza folclórica'], correctIndex: 0, explanation: 'El teteo es una fiesta popular callejera.' });
  q.push({ categoryId: cul, type: 'opcion_multiple', difficulty: 'dificil', text: '¿Cuál es la iglesia más antigua de América, ubicada en Santo Domingo?', options: ['Catedral Primada de América', 'Basílica de Higüey', 'Iglesia de Las Mercedes', 'Iglesia San Juan'], correctIndex: 0, explanation: 'La Catedral Primada de América en la Zona Colonial.' });

  // ---------------- GEOGRAFÍA ----------------
  const geo = catMap['geografia'].id;
  q.push({ categoryId: geo, type: 'opcion_multiple', difficulty: 'facil', text: '¿Cuál es el pico más alto del Caribe y de República Dominicana?', options: ['Pico Duarte', 'Loma La Torre', 'Pico Yaque', 'La Pelona'], correctIndex: 0, explanation: 'El Pico Duarte alcanza los 3,098 metros.' });
  q.push({ categoryId: geo, type: 'opcion_multiple', difficulty: 'facil', text: '¿Cómo se llama la cordillera que cruza el centro del país?', options: ['Cordillera Central', 'Cordillera Septentrional', 'Sierra de Bahoruco', 'Cordillera Oriental'], correctIndex: 0, explanation: 'La Cordillera Central es la más extensa e importante.' });
  q.push({ categoryId: geo, type: 'verdadero_falso', difficulty: 'facil', text: 'El río más largo de la República Dominicana es el Yaque del Norte.', options: ['Verdadero', 'Falso'], correctIndex: 0, explanation: 'El Yaque del Norte es el río más largo del país.' });
  q.push({ categoryId: geo, type: 'opcion_multiple', difficulty: 'facil', text: '¿En qué península se encuentra la playa de Punta Cana?', options: ['Península de Samaná', 'Península de Barahona', 'Península de Pedernales', 'Península de los Haitises'], correctIndex: 0, explanation: 'Bavaro y Punta Cana se ubican en la península de Samaná (zona este).' });
  q.push({ categoryId: geo, type: 'opcion_multiple', difficulty: 'media', text: '¿Cuál es el lago más grande del país?', options: ['Lago Enriquillo', 'Lago Azuei', 'Laguna de Oviedo', 'Laguna Gri-Grí'], correctIndex: 0, explanation: 'El Lago Enriquillo es el lago más grande y está bajo el nivel del mar.' });
  q.push({ categoryId: geo, type: 'opcion_multiple', difficulty: 'media', text: '¿Qué provincia es conocida como la "capital del merengue"?', options: ['Santiago de los Caballeros', 'Santo Domingo', 'Puerto Plata', 'San Pedro de Macorís'], correctIndex: 0, explanation: 'Santiago es considerada cuna del merengue.' });
  q.push({ categoryId: geo, type: 'opcion_multiple', difficulty: 'media', text: '¿Cuál es el punto más bajo del Caribe?', options: ['Lago Enriquillo', 'Valle de Neiba', 'Lago Azuei', 'Laguna Saladilla'], correctIndex: 0, explanation: 'El Lago Enriquillo está a unos 44 metros bajo el nivel del mar.' });
  q.push({ categoryId: geo, type: 'opcion_multiple', difficulty: 'dificil', text: '¿Qué monte de la Cordillera Central es el segundo más alto?', options: ['Loma La Pelona', 'Pico Yaque', 'Loma Lenero', 'Pico del Yaque'], correctIndex: 0, explanation: 'La Pelona es la segunda cumbre más alta.' });
  q.push({ categoryId: geo, type: 'opcion_multiple', difficulty: 'dificil', text: '¿Qué isla cercana a Samaná es famosa por las ballenas jorobadas?', options: ['Cayo Levantado', 'Isla Saona', 'Isla Catalina', 'Isla Beata'], correctIndex: 0, explanation: 'Cayo Levantado (Bahía de Samaná) y el Santuario de Ballenas.' });
  q.push({ categoryId: geo, type: 'opcion_multiple', difficulty: 'dificil', text: '¿Qué desierto se encuentra en la provincia Pedernales?', options: ['Las Dunas de Baní', 'El Desierto de Oviedo', 'Punta Cana', 'Bahía de las Águilas'], correctIndex: 0, explanation: 'Las dunas de Baní están en la provincia de Peravia (zona costera).' });

  // ---------------- GASTRONOMÍA ----------------
  const gas = catMap['gastronomia'].id;
  q.push({ categoryId: gas, type: 'opcion_multiple', difficulty: 'facil', text: '¿Cuál es el desayuno típico dominicano?', options: ['Mangú con los tres golpes', 'Cereal', 'Empanadas', 'Huevos fritos solos'], correctIndex: 0, explanation: 'El mangú con los tres golpes: con salami, huevo y queso.' });
  q.push({ categoryId: gas, type: 'opcion_multiple', difficulty: 'facil', text: '¿Qué es el "sancocho" dominicano?', options: ['Una sopa espesa con carnes y vegetales', 'Un arroz', 'Un dulce', 'Un pescado'], correctIndex: 0, explanation: 'El sancocho es una sopa contundente.' });
  q.push({ categoryId: gas, type: 'opcion_multiple', difficulty: 'facil', text: '¿Qué fruta se usa para hacer el refresco "chinola"?', options: ['Maracuyá', 'Piña', 'Limón', 'Mango'], correctIndex: 0, explanation: 'La chinola es la maracuyá o parchita.' });
  q.push({ categoryId: gas, type: 'opcion_multiple', difficulty: 'facil', text: '¿Qué plato se prepara tradicionalmente en Semana Santa dominicana?', options: ['Habichuelas con dulce', 'Sancocho', 'Mangú', 'Bandera'], correctIndex: 0, explanation: 'Las habichuelas con dulce son típicas de Cuaresma.' });
  q.push({ categoryId: gas, type: 'opcion_multiple', difficulty: 'media', text: '¿Qué es el "locrio"?', options: ['Arroz guisado con carne o pescado', 'Un dulce', 'Una bebida', 'Un postre'], correctIndex: 0, explanation: 'El locrio es arroz cocinado con carne, pollo o pescado.' });
  q.push({ categoryId: gas, type: 'opcion_multiple', difficulty: 'media', text: '¿Qué bebida famosa se prepara con leche, azúcar y hielo, con un toque de canela?', options: ['Morir soñando', 'Mabí', 'Piña colada', 'Zumo de guanábana'], correctIndex: 0, explanation: 'El morir soñando es de jugo de naranja y leche.' });
  q.push({ categoryId: gas, type: 'opcion_multiple', difficulty: 'media', text: '¿Qué se usa para hacer el tradicional "pastelón"?', options: ['Plátano maduro', 'Yuca', 'Maíz', 'Arroz'], correctIndex: 0, explanation: 'El pastelón se hace a base de plátano maduro.' });
  q.push({ categoryId: gas, type: 'opcion_multiple', difficulty: 'media', text: '¿Cuál es el ingrediente principal del "mofongo"?', options: ['Plátano verde', 'Yuca', 'Batata', 'Arroz'], correctIndex: 0, explanation: 'El mofongo se prepara con plátano verde machacado.' });
  q.push({ categoryId: gas, type: 'opcion_multiple', difficulty: 'dificil', text: '¿Qué delicia se hace cocinando maíz tierno?', options: ['Chaca', 'Majarete', 'Dulce de leche', 'Tembleque'], correctIndex: 1, explanation: 'El majarete se elabora con maíz tierno y coco.' });
  q.push({ categoryId: gas, type: 'opcion_multiple', difficulty: 'dificil', text: '¿Qué pescado es muy popular en la costa de Barahona?', options: ['Pescado seco de bully', 'Salmón', 'Atún', 'Tilapia'], correctIndex: 0, explanation: 'El bully (pescado seco) es tradicional en Barahona.' });

  // ---------------- MÚSICA ----------------
  const mus = catMap['musica-dominicana'].id;
  q.push({ categoryId: mus, type: 'opcion_multiple', difficulty: 'facil', text: '¿Cuáles son los dos ritmos más representativos de la República Dominicana?', options: ['Merengue y bachata', 'Reguetón y salsa', 'Salsa y cumbia', 'Vallenato y pop'], correctIndex: 0, explanation: 'Merengue y bachata son los ritmos nacionales.' });
  q.push({ categoryId: mus, type: 'opcion_multiple', difficulty: 'facil', text: '¿Cuál de estos artistas es conocido como "El Rey de la Bachata"?', options: ['Anthony Santos', 'Juan Luis Guerra', 'Fernando Villalona', 'Johnny Ventura'], correctIndex: 0, explanation: 'Anthony Santos es el Rey de la Bachata.' });
  q.push({ categoryId: mus, type: 'opcion_multiple', difficulty: 'facil', text: '¿Quién es el "Maestro del Merengue"?', options: ['Johnny Ventura', 'Rafael Solano', 'Fernando Villalona', 'Raulín Rodríguez'], correctIndex: 0, explanation: 'Johnny Ventura fue conocido como el maestro del merengue.' });
  q.push({ categoryId: mus, type: 'opcion_multiple', difficulty: 'facil', text: '¿Qué artista dominicano ganó múltiples Grammy latinos con el álbum "Para Ti"?', options: ['Juan Luis Guerra', 'Romeo Santos', 'Anthony Santos', 'Prince Royce'], correctIndex: 0, explanation: 'Juan Luis Guerra es el artista dominicano más laureado.' });
  q.push({ categoryId: mus, type: 'opcion_multiple', difficulty: 'media', text: '¿En qué provincia se originó la bachata?', options: ['Santo Domingo', 'Santiago', 'La Vega', 'San Pedro de Macorís'], correctIndex: 0, explanation: 'La bachata se originó en los barrios de Santo Domingo.' });
  q.push({ categoryId: mus, type: 'opcion_multiple', difficulty: 'media', text: '¿Qué instrumento de viento es clave en el merengue tradicional?', options: ['Acordeón', 'Saxofón', 'Trompeta', 'Tambora'], correctIndex: 0, explanation: 'El acordeón es el instrumento emblemático del merengue de orquesta y típico.' });
  q.push({ categoryId: mus, type: 'opcion_multiple', difficulty: 'media', text: '¿En qué año ganó Juan Luis Guerra el Grammy a Mejor Álbum Tropical?', options: ['1991', '1995', '1988', '2000'], correctIndex: 0, explanation: 'Ganó en 1991 por el álbum "Bachata Rosa".' });
  q.push({ categoryId: mus, type: 'opcion_multiple', difficulty: 'dificil', text: '¿Qué artista es considerado el pionero del "merengue de orquesta"?', options: ['Johnny Ventura', 'Fernando Villalona', 'Sergio Vargas', 'Wilfrido Vargas'], correctIndex: 0, explanation: 'Johnny Ventura modernizó el merengue con su orquesta "Combo Show".' });
  q.push({ categoryId: mus, type: 'opcion_multiple', difficulty: 'dificil', text: '¿Qué bachatero nació en el Bronx y popularizó la bachata a nivel mundial?', options: ['Romeo Santos', 'Prince Royce', 'Aventura', 'Luis Vargas'], correctIndex: 0, explanation: 'Romeo Santos, exvocalista de Aventura.' });
  q.push({ categoryId: mus, type: 'opcion_multiple', difficulty: 'dificil', text: '¿Cuál es la agrupación originaria de Romeo Santos?', options: ['Aventura', 'Los Hermanos Rosario', 'Grupo Manía', 'La Banda Gorda'], correctIndex: 0, explanation: 'Romeo Santos lideró Aventura.' });

  // ---------------- DEPORTES ----------------
  const dep = catMap['deportes'].id;
  q.push({ categoryId: dep, type: 'opcion_multiple', difficulty: 'facil', text: '¿Cuál es el deporte más popular en República Dominicana?', options: ['Béisbol', 'Baloncesto', 'Fútbol', 'Voleibol'], correctIndex: 0, explanation: 'El béisbol es el deporte nacional.' });
  q.push({ categoryId: dep, type: 'opcion_multiple', difficulty: 'facil', text: '¿Cómo se llama la liga de béisbol profesional dominicana?', options: ['LIDOM', 'MLB', 'NBA', 'LNB'], correctIndex: 0, explanation: 'La Liga de Béisbol Profesional de la República Dominicana (LIDOM).' });
  q.push({ categoryId: dep, type: 'opcion_multiple', difficulty: 'facil', text: '¿Cuál de estos equipos es de la ciudad de Santiago?', options: ['Águilas Cibaeñas', 'Tigres del Licey', 'Leones del Escogido', 'Estrellas Orientales'], correctIndex: 0, explanation: 'Las Águilas Cibaeñas son de Santiago.' });
  q.push({ categoryId: dep, type: 'opcion_multiple', difficulty: 'facil', text: '¿Qué dominicano es apodado "El Capitán" en el béisbol de las Grandes Ligas?', options: ['David Ortiz', 'Pedro Martínez', 'Vladimir Guerrero', 'Juan Marichal'], correctIndex: 0, explanation: 'David Ortiz era conocido como Big Papi.' });
  q.push({ categoryId: dep, type: 'opcion_multiple', difficulty: 'media', text: '¿Qué equipo tiene su sede en la capital, Santo Domingo?', options: ['Tigres del Licey', 'Águilas Cibaeñas', 'Gigantes del Cibao', 'Toros del Este'], correctIndex: 0, explanation: 'Los Tigres del Licey y Leones del Escogido son de Santo Domingo.' });
  q.push({ categoryId: dep, type: 'opcion_multiple', difficulty: 'media', text: '¿Qué jugador dominicano fue el primer latino en ser electo al Salón de la Fama del Béisbol?', options: ['Juan Marichal', 'Pedro Martínez', 'David Ortiz', 'Vladimir Guerrero'], correctIndex: 0, explanation: 'Juan Marichal, "El Dandy dominicano".' });
  q.push({ categoryId: dep, type: 'opcion_multiple', difficulty: 'media', text: '¿Qué boxeador dominicano fue campeón mundial y es apodado "El Puro de San Juan"?', options: ['Juan Guzmán', 'Carlos Cruz', 'Pedro Nolasco', 'Joan Guzmán'], correctIndex: 3, explanation: 'Joan Guzmán, campeón mundial de boxeo.' });
  q.push({ categoryId: dep, type: 'opcion_multiple', difficulty: 'dificil', text: '¿En qué año realizó la República Dominicana su primera participación olímpica?', options: ['1964', '1968', '1952', '1980'], correctIndex: 0, explanation: 'Participó por primera vez en Tokio 1964.' });
  q.push({ categoryId: dep, type: 'opcion_multiple', difficulty: 'dificil', text: '¿Cuál es el apodo del estadio del béisbol dominicano en la capital?', options: ['Estadio Quisqueya Juan Marichal', 'Estadio Cibao', 'Estadio Julián Javier', 'Estadio Tetelo Vargas'], correctIndex: 0, explanation: 'El Estadio Quisqueya Juan Marichal.' });
  q.push({ categoryId: dep, type: 'opcion_multiple', difficulty: 'dificil', text: '¿Qué equipo campeón de LIDOM tiene sede en San Francisco de Macorís?', options: ['Gigantes del Cibao', 'Águilas Cibaeñas', 'Estrellas Orientales', 'Toros del Este'], correctIndex: 0, explanation: 'Los Gigantes del Cibao juegan en San Francisco de Macorís.' });

  // ---------------- SÍMBOLOS PATRIOS ----------------
  const sim = catMap['simbolos-patrios'].id;
  q.push({ categoryId: sim, type: 'opcion_multiple', difficulty: 'facil', text: '¿Qué colores tiene la bandera dominicana?', options: ['Azul, rojo y blanco', 'Rojo y amarillo', 'Verde y blanco', 'Azul y blanco'], correctIndex: 0, explanation: 'La bandera tiene azul ultramar, rojo bermellón y una cruz blanca.' });
  q.push({ categoryId: sim, type: 'opcion_multiple', difficulty: 'facil', text: '¿Quién escribió el himno nacional dominicano?', options: ['Emilio Prud\'Homme', 'Juan Pablo Duarte', 'Pedro Francisco Bonó', 'Salomé Ureña'], correctIndex: 0, explanation: 'Emilio Prud\'Homme escribió la letra del himno.' });
  q.push({ categoryId: sim, type: 'opcion_multiple', difficulty: 'facil', text: '¿Quién compuso la música del himno nacional?', options: ['José Reyes', 'Emilio Prud\'Homme', 'Rafael Estrella', 'Juan Bautista Alfonseca'], correctIndex: 0, explanation: 'El maestro José Reyes compuso la música.' });
  q.push({ categoryId: sim, type: 'opcion_multiple', difficulty: 'facil', text: '¿Qué ave aparece en el escudo nacional?', options: ['Palma', 'Águila', 'El espíritu santo', 'García'], correctIndex: 0, explanation: 'La palma es uno de los símbolos del escudo.' });
  q.push({ categoryId: sim, type: 'verdadero_falso', difficulty: 'media', text: 'La bandera dominicana tiene una cruz blanca en el centro.', options: ['Verdadero', 'Falso'], correctIndex: 0, explanation: 'Sí, la cruz blanca cristiana es el símbolo central.' });
  q.push({ categoryId: sim, type: 'opcion_multiple', difficulty: 'dificil', text: '¿Qué frase aparece en la cinta del escudo nacional?', options: ['Dios, Patria y Libertad', 'Paz y Prosperidad', 'Independencia o Muerte', 'República Dominicana'], correctIndex: 0, explanation: 'El lema es "Dios, Patria y Libertad".' });
  q.push({ categoryId: sim, type: 'opcion_multiple', difficulty: 'dificil', text: '¿Qué flor es considerada la flor nacional?', options: ['La caoba (flor de caoba)', 'La rosa', 'La orquídea', 'El girasol'], correctIndex: 0, explanation: 'La flor nacional es la caoba, aunque el árbol nacional es típicamente la caoba.' });
  q.push({ categoryId: sim, type: 'opcion_multiple', difficulty: 'dificil', text: '¿Cuál es el árbol nacional de la República Dominicana?', options: ['La caoba', 'El ébano', 'El pino', 'La palma real'], correctIndex: 0, explanation: 'La caoba es el árbol nacional.' });

  // ---------------- PERSONAJES HISTÓRICOS ----------------
  const per = catMap['personajes-historicos'].id;
  q.push({ categoryId: per, type: 'opcion_multiple', difficulty: 'facil', text: '¿Quién es considerado el padre de la patria dominicana?', options: ['Juan Pablo Duarte', 'Pedro Santana', 'Gregorio Luperón', 'Buenaventura Báez'], correctIndex: 0, explanation: 'Juan Pablo Duarte es el padre fundador.' });
  q.push({ categoryId: per, type: 'opcion_multiple', difficulty: 'facil', text: '¿Quién de los Padres de la Patria dio el trabucazo el 27 de febrero de 1844?', options: ['Ramón Matías Mella', 'Juan Pablo Duarte', 'Francisco del Rosario Sánchez', 'Pedro Santana'], correctIndex: 0, explanation: 'Mella disparó el trabucazo que inició el grito de independencia.' });
  q.push({ categoryId: per, type: 'opcion_multiple', difficulty: 'facil', text: '¿Quién fue la poetisa y educadora dominicana considerada "La Musa del Cibao"?', options: ['Salomé Ureña', 'Julia Álvarez', 'Carmen Natalia', 'Aída Cartagena'], correctIndex: 0, explanation: 'Salomé Ureña fue destacada poeta y educadora.' });
  q.push({ categoryId: per, type: 'opcion_multiple', difficulty: 'media', text: '¿Quién fue el general restaurador apodado "El Restaurador"?', options: ['Gregorio Luperón', 'Pedro Santana', 'Ulises Heureaux', 'Máximo Gómez'], correctIndex: 0, explanation: 'Gregorio Luperón lideró la Restauración.' });
  q.push({ categoryId: per, type: 'opcion_multiple', difficulty: 'media', text: '¿Qué expresidente dominicano fue derrocado en 1963 por un golpe militar?', options: ['Juan Bosch', 'Joaquín Balaguer', 'Héctor Trujillo', 'Antonio Guzmán'], correctIndex: 0, explanation: 'Juan Bosch fue el primer presidente electo tras la dictadura y fue derrocado.' });
  q.push({ categoryId: per, type: 'opcion_multiple', difficulty: 'dificil', text: '¿Qué escritora dominicana escribió "En el tiempo de las mariposas"?', options: ['Julia Álvarez', 'Salomé Ureña', 'Aída Cartagena', 'Hilma Contreras'], correctIndex: 0, explanation: 'Julia Álvarez, escritora dominicana.' });
  q.push({ categoryId: per, type: 'opcion_multiple', difficulty: 'dificil', text: '¿Quién fue el dictador que gobernó RD de 1930 a 1961?', options: ['Rafael Trujillo', 'Joaquín Balaguer', 'Pedro Santana', 'Ulises Heureaux'], correctIndex: 0, explanation: 'Rafael Leonidas Trujillo.' });
  q.push({ categoryId: per, type: 'opcion_multiple', difficulty: 'dificil', text: '¿Qué figura femenina es conocida por las "Hermanas Mirabal"?', options: ['Las Patricias Mirabal', 'Las Trinitarias', 'Las Mussoveteras', 'Las Cacicas'], correctIndex: 0, explanation: 'Las hermanas Mirabal, Patria, Minerva y María Teresa.' });

  // ---------------- PRESIDENTES ----------------
  const pre = catMap['presidentes'].id;
  q.push({ categoryId: pre, type: 'opcion_multiple', difficulty: 'facil', text: '¿Quién fue el primer presidente de la República Dominicana?', options: ['Pedro Santana', 'Buenaventura Báez', 'Juan Pablo Duarte', 'Ramón Matías Mella'], correctIndex: 0, explanation: 'Pedro Santana fue el primer presidente de la Junta.' });
  q.push({ categoryId: pre, type: 'opcion_multiple', difficulty: 'facil', text: '¿Qué expresidente gobernó por décadas y fue derrocado en 1978?', options: ['Joaquín Balaguer', 'Juan Bosch', 'Rafael Trujillo', 'Antonio Guzmán'], correctIndex: 0, explanation: 'Balaguer gobernó durante las décadas de 1960 a 1990.' });
  q.push({ categoryId: pre, type: 'opcion_multiple', difficulty: 'media', text: '¿Quién fue presidente en 1963 tras las elecciones libres?', options: ['Juan Bosch', 'Balaguer', 'Trujillo', 'Guzmán'], correctIndex: 0, explanation: 'Juan Bosch asumió la presidencia en 1963.' });
  q.push({ categoryId: pre, type: 'opcion_multiple', difficulty: 'media', text: '¿Qué presidente inició la obra del "Faro a Colón"?', options: ['Joaquín Balaguer', 'Juan Bosch', 'Leonel Fernández', 'Hipólito Mejía'], correctIndex: 0, explanation: 'Balaguer impulsó el Faro a Colón.' });
  q.push({ categoryId: pre, type: 'opcion_multiple', difficulty: 'dificil', text: '¿Qué presidente dominicano fue reelecto en 1996 y gobernó de 1996 a 2000?', options: ['Leonel Fernández', 'Hipólito Mejía', 'Danilo Medina', 'Balaguer'], correctIndex: 0, explanation: 'Leonel Fernández gobernó en 1996-2000, 2004-2012.' });

  return q;
}

seed();
