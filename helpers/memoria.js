// Helper de Juego de Memoria - Mundo Kids
// Genera cartas emparejadas con países, banderas y datos geográficos

const { mezclarArray, seleccionarAleatorio } = require('./aleatorizacion');

/**
 * Niveles de dificultad para el juego de memoria
 */
const NIVELES_MEMORIA = [
  { id: 'facil', nombre: 'Fácil', pares: 4, columnas: 4, descripcion: '4 pares • Ideal para empezar', tiempoSegundos: 60 },
  { id: 'medio', nombre: 'Medio', pares: 6, columnas: 4, descripcion: '6 pares • Un buen reto', tiempoSegundos: 90 },
  { id: 'dificil', nombre: 'Difícil', pares: 8, columnas: 4, descripcion: '8 pares • Para expertos', tiempoSegundos: 120 },
  { id: 'experto', nombre: 'Experto', pares: 10, columnas: 5, descripcion: '10 pares • Sólo valientes', tiempoSegundos: 150 },
  { id: 'ultra', nombre: 'Ultra', pares: 12, columnas: 5, descripcion: '12 pares • Muy difícil', tiempoSegundos: 180 },
  { id: 'extremo', nombre: 'Extremo', pares: 15, columnas: 5, descripcion: '15 pares • Desafío total', tiempoSegundos: 210 },
  { id: 'legendario', nombre: 'Legendario', pares: 18, columnas: 6, descripcion: '18 pares • Sólo leyendas', tiempoSegundos: 240 }
];

/**
 * Base de datos de cartas para el juego de memoria
 * Cada carta tiene un par: { id, contenido, emoji, descripcion }
 * Ordenadas por continente con suficientes cartas para todos los niveles
 */
const CARTAS_POR_CONTINENTE = {
  america: [
    { id: 'us', contenido: 'Estados Unidos', emoji: '🇺🇸', descripcion: 'País de América del Norte' },
    { id: 'br', contenido: 'Brasil', emoji: '🇧🇷', descripcion: 'El país más grande de Sudamérica' },
    { id: 'mx', contenido: 'México', emoji: '🇲🇽', descripcion: 'Tierra de los Aztecas' },
    { id: 'ar', contenido: 'Argentina', emoji: '🇦🇷', descripcion: 'El país del tango' },
    { id: 'co', contenido: 'Colombia', emoji: '🇨🇴', descripcion: 'El país del café' },
    { id: 've', contenido: 'Venezuela', emoji: '🇻🇪', descripcion: 'Tierra del Salto Ángel' },
    { id: 'pe', contenido: 'Perú', emoji: '🇵🇪', descripcion: 'País de los Incas' },
    { id: 'cl', contenido: 'Chile', emoji: '🇨🇱', descripcion: 'El país más largo del mundo' },
    { id: 'ca', contenido: 'Canadá', emoji: '🇨🇦', descripcion: 'Tierra de bosques y lagos' },
    { id: 'cu', contenido: 'Cuba', emoji: '🇨🇺', descripcion: 'La isla del Caribe' },
    { id: 'ec', contenido: 'Ecuador', emoji: '🇪🇨', descripcion: 'La línea del Ecuador' },
    { id: 'uy', contenido: 'Uruguay', emoji: '🇺🇾', descripcion: 'El país del mate' }
  ],
  europa: [
    { id: 'fr', contenido: 'Francia', emoji: '🇫🇷', descripcion: 'La Torre Eiffel' },
    { id: 'it', contenido: 'Italia', emoji: '🇮🇹', descripcion: 'El Coliseo Romano' },
    { id: 'es', contenido: 'España', emoji: '🇪🇸', descripcion: 'País del Flamenco' },
    { id: 'uk', contenido: 'Reino Unido', emoji: '🇬🇧', descripcion: 'El Big Ben' },
    { id: 'de', contenido: 'Alemania', emoji: '🇩🇪', descripcion: 'País de los castillos' },
    { id: 'gr', contenido: 'Grecia', emoji: '🇬🇷', descripcion: 'Cuna de la democracia' },
    { id: 'pt', contenido: 'Portugal', emoji: '🇵🇹', descripcion: 'El país del fado' },
    { id: 'nl', contenido: 'Países Bajos', emoji: '🇳🇱', descripcion: 'Tierra de molinos' },
    { id: 'se', contenido: 'Suecia', emoji: '🇸🇪', descripcion: 'Tierra de los vikingos' },
    { id: 'ch', contenido: 'Suiza', emoji: '🇨🇭', descripcion: 'País de los Alpes' },
    { id: 'ie', contenido: 'Irlanda', emoji: '🇮🇪', descripcion: 'La isla esmeralda' },
    { id: 'no', contenido: 'Noruega', emoji: '🇳🇴', descripcion: 'Tierra de fiordos' }
  ],
  asia: [
    { id: 'cn', contenido: 'China', emoji: '🇨🇳', descripcion: 'La Gran Muralla' },
    { id: 'jp', contenido: 'Japón', emoji: '🇯🇵', descripcion: 'Tierra del Sol Naciente' },
    { id: 'in', contenido: 'India', emoji: '🇮🇳', descripcion: 'El Taj Mahal' },
    { id: 'kr', contenido: 'Corea del Sur', emoji: '🇰🇷', descripcion: 'País del K-Pop' },
    { id: 'th', contenido: 'Tailandia', emoji: '🇹🇭', descripcion: 'Tierra de templos' },
    { id: 'vn', contenido: 'Vietnam', emoji: '🇻🇳', descripcion: 'País del dragón' },
    { id: 'ru', contenido: 'Rusia', emoji: '🇷🇺', descripcion: 'El país más extenso' },
    { id: 'id', contenido: 'Indonesia', emoji: '🇮🇩', descripcion: 'El país de las mil islas' },
    { id: 'ph', contenido: 'Filipinas', emoji: '🇵🇭', descripcion: 'Perlas del Pacífico' },
    { id: 'my', contenido: 'Malasia', emoji: '🇲🇾', descripcion: 'Tierra de contrastes' },
    { id: 'sg', contenido: 'Singapur', emoji: '🇸🇬', descripcion: 'La ciudad jardín' },
    { id: 'mn', contenido: 'Mongolia', emoji: '🇲🇳', descripcion: 'Tierra del Gran Khan' }
  ],
  africa: [
    { id: 'eg', contenido: 'Egipto', emoji: '🇪🇬', descripcion: 'Las Pirámides' },
    { id: 'za', contenido: 'Sudáfrica', emoji: '🇿🇦', descripcion: 'El país del arcoíris' },
    { id: 'ng', contenido: 'Nigeria', emoji: '🇳🇬', descripcion: 'El gigante de África' },
    { id: 'ke', contenido: 'Kenia', emoji: '🇰🇪', descripcion: 'Safari africano' },
    { id: 'ma', contenido: 'Marruecos', emoji: '🇲🇦', descripcion: 'Tierra del desierto' },
    { id: 'et', contenido: 'Etiopía', emoji: '🇪🇹', descripcion: 'Cuna de la humanidad' },
    { id: 'tz', contenido: 'Tanzania', emoji: '🇹🇿', descripcion: 'Monte Kilimanjaro' },
    { id: 'gh', contenido: 'Ghana', emoji: '🇬🇭', descripcion: 'Costa del Oro' },
    { id: 'mg', contenido: 'Madagascar', emoji: '🇲🇬', descripcion: 'La isla roja' },
    { id: 'dz', contenido: 'Argelia', emoji: '🇩🇿', descripcion: 'El país más grande de África' },
    { id: 'sn', contenido: 'Senegal', emoji: '🇸🇳', descripcion: 'Tierra de la Teranga' },
    { id: 'ug', contenido: 'Uganda', emoji: '🇺🇬', descripcion: 'La perla de África' }
  ],
  oceania: [
    { id: 'au', contenido: 'Australia', emoji: '🇦🇺', descripcion: 'Tierra de canguros' },
    { id: 'nz', contenido: 'Nueva Zelanda', emoji: '🇳🇿', descripcion: 'El país del Kiwi' },
    { id: 'fj', contenido: 'Fiyi', emoji: '🇫🇯', descripcion: 'Paraíso tropical' },
    { id: 'pg', contenido: 'Papúa N. Guinea', emoji: '🇵🇬', descripcion: 'Tierra de tribus' },
    { id: 'sb', contenido: 'Islas Salomón', emoji: '🇸🇧', descripcion: 'Tesoro del Pacífico' },
    { id: 'vu', contenido: 'Vanuatu', emoji: '🇻🇺', descripcion: 'Volcanes del Pacífico' },
    { id: 'ws', contenido: 'Samoa', emoji: '🇼🇸', descripcion: 'Corazón de la Polinesia' },
    { id: 'ki', contenido: 'Kiribati', emoji: '🇰🇮', descripcion: 'Islas de la línea' }
  ],
  antartida: [
    { id: 'an1', contenido: 'Pingüino Emperador', emoji: '🐧', descripcion: 'Rey de la Antártida' },
    { id: 'an2', contenido: 'Iceberg Gigante', emoji: '🏔️', descripcion: 'Montaña de hielo' },
    { id: 'an3', contenido: 'Aurora Austral', emoji: '🌌', descripcion: 'Luces del sur' },
    { id: 'an4', contenido: 'Base Científica', emoji: '🔬', descripcion: 'Investigación polar' },
    { id: 'an5', contenido: 'Foca Leopardo', emoji: '🦭', descripcion: 'Depredador del hielo' },
    { id: 'an6', contenido: 'Ballena Jorobada', emoji: '🐋', descripcion: 'Gigante del océano' },
    { id: 'an7', contenido: 'Albatros Viajero', emoji: '🕊️', descripcion: 'Ave de los mares' },
    { id: 'an8', contenido: 'Nevasca Polar', emoji: '❄️', descripcion: 'Tormenta de nieve' },
    { id: 'an9', contenido: 'Estación Vernadsky', emoji: '🏗️', descripcion: 'Base de investigación' },
    { id: 'an10', contenido: 'Krill Antártico', emoji: '🦐', descripcion: 'Base de la cadena alimenticia' },
    { id: 'an11', contenido: 'Placa de Hielo', emoji: '🧊', descripcion: 'Plataforma glacial' },
    { id: 'an12', contenido: 'Sol de Medianoche', emoji: '☀️', descripcion: 'Sol sin ocaso' }
  ]
};

/**
 * Cartas de monumentos para el tema "Vuelta al Mundo"
 * Cada carta tiene un monumento o lugar icónico representativo de cada país
 */
const CARTAS_MONUMENTOS = [
  // ── AMÉRICA ──
  { id: 'us', contenido: 'Estatua de la Libertad', emoji: '🗽', descripcion: 'Nueva York, EE.UU.' },
  { id: 'br', contenido: 'Cristo Redentor', emoji: '⛪', descripcion: 'Río de Janeiro, Brasil' },
  { id: 'mx', contenido: 'Chichén Itzá', emoji: '🏛️', descripcion: 'Yucatán, México' },
  { id: 'ar', contenido: 'Obelisco de Buenos Aires', emoji: '🏗️', descripcion: 'Buenos Aires, Argentina' },
  { id: 'co', contenido: 'Cartagena de Indias', emoji: '🏰', descripcion: 'Cartagena, Colombia' },
  { id: 've', contenido: 'Salto Ángel', emoji: '🌊', descripcion: 'Canaima, Venezuela' },
  { id: 'pe', contenido: 'Machu Picchu', emoji: '🏔️', descripcion: 'Cusco, Perú' },
  { id: 'cl', contenido: 'Moái de Rapa Nui', emoji: '🗿', descripcion: 'Isla de Pascua, Chile' },
  { id: 'ca', contenido: 'Torre CN', emoji: '🏗️', descripcion: 'Toronto, Canadá' },
  { id: 'cu', contenido: 'Malecón de La Habana', emoji: '🌊', descripcion: 'La Habana, Cuba' },
  { id: 'ec', contenido: 'Mitad del Mundo', emoji: '🌍', descripcion: 'Quito, Ecuador' },
  { id: 'uy', contenido: 'Teatro Solís', emoji: '🏛️', descripcion: 'Montevideo, Uruguay' },
  { id: 'brooklyn', contenido: 'Puente de Brooklyn', emoji: '🌉', descripcion: 'Nueva York, EE.UU.' },
  { id: 'canyon', contenido: 'Gran Cañón', emoji: '🏜️', descripcion: 'Arizona, EE.UU.' },
  // ── EUROPA ──
  { id: 'fr', contenido: 'Torre Eiffel', emoji: '🗼', descripcion: 'París, Francia' },
  { id: 'it', contenido: 'Coliseo Romano', emoji: '🏛️', descripcion: 'Roma, Italia' },
  { id: 'es', contenido: 'Sagrada Familia', emoji: '⛪', descripcion: 'Barcelona, España' },
  { id: 'uk', contenido: 'Big Ben', emoji: '🕰️', descripcion: 'Londres, Reino Unido' },
  { id: 'de', contenido: 'Castillo de Neuschwanstein', emoji: '🏰', descripcion: 'Baviera, Alemania' },
  { id: 'pisa', contenido: 'Torre de Pisa', emoji: '🗼', descripcion: 'Pisa, Italia' },
  { id: 'gr', contenido: 'Partenón', emoji: '🏛️', descripcion: 'Atenas, Grecia' },
  { id: 'pt', contenido: 'Torre de Belém', emoji: '🏰', descripcion: 'Lisboa, Portugal' },
  { id: 'nl', contenido: 'Molinos de Kinderdijk', emoji: '🌬️', descripcion: 'Róterdam, Países Bajos' },
  { id: 'se', contenido: 'Museo Vasa', emoji: '⛵', descripcion: 'Estocolmo, Suecia' },
  { id: 'ch', contenido: 'Matterhorn', emoji: '🏔️', descripcion: 'Alpes Suizos' },
  { id: 'ie', contenido: 'Acantilados de Moher', emoji: '🏞️', descripcion: 'Irlanda' },
  { id: 'no', contenido: 'Fiordo de Geiranger', emoji: '🏔️', descripcion: 'Noruega' },
  // ── ASIA ──
  { id: 'cn', contenido: 'Gran Muralla China', emoji: '🏯', descripcion: 'China' },
  { id: 'jp', contenido: 'Monte Fuji', emoji: '🗻', descripcion: 'Honshu, Japón' },
  { id: 'in', contenido: 'Taj Mahal', emoji: '🕌', descripcion: 'Agra, India' },
  { id: 'kr', contenido: 'Palacio Gyeongbokgung', emoji: '🏯', descripcion: 'Seúl, Corea del Sur' },
  { id: 'th', contenido: 'Wat Phra Kaew', emoji: '🛕', descripcion: 'Bangkok, Tailandia' },
  { id: 'vn', contenido: 'Bahía de Ha Long', emoji: '🏝️', descripcion: 'Vietnam' },
  { id: 'ru', contenido: 'Catedral de San Basilio', emoji: '⛪', descripcion: 'Moscú, Rusia' },
  { id: 'id', contenido: 'Borobudur', emoji: '🛕', descripcion: 'Java, Indonesia' },
  { id: 'ph', contenido: 'Terrazas de Banaue', emoji: '🏞️', descripcion: 'Filipinas' },
  { id: 'my', contenido: 'Torres Petronas', emoji: '🏗️', descripcion: 'Kuala Lumpur, Malasia' },
  { id: 'sg', contenido: 'Marina Bay Sands', emoji: '🏗️', descripcion: 'Singapur' },
  { id: 'mn', contenido: 'Desierto del Gobi', emoji: '🏜️', descripcion: 'Mongolia' },
  // ── ÁFRICA ──
  { id: 'eg', contenido: 'Pirámides de Guiza', emoji: '🔺', descripcion: 'El Cairo, Egipto' },
  { id: 'za', contenido: 'Montaña de la Mesa', emoji: '🏔️', descripcion: 'Ciudad del Cabo, Sudáfrica' },
  { id: 'ng', contenido: 'Puerta Zuma', emoji: '🏗️', descripcion: 'Abuya, Nigeria' },
  { id: 'ke', contenido: 'Masái Mara', emoji: '🌅', descripcion: 'Kenia' },
  { id: 'ma', contenido: 'Mezquita Hassan II', emoji: '🕌', descripcion: 'Casablanca, Marruecos' },
  { id: 'et', contenido: 'Iglesias de Lalibela', emoji: '⛪', descripcion: 'Etiopía' },
  { id: 'tz', contenido: 'Monte Kilimanjaro', emoji: '🗻', descripcion: 'Tanzania' },
  { id: 'gh', contenido: 'Castillo de Elmina', emoji: '🏰', descripcion: 'Ghana' },
  { id: 'mg', contenido: 'Avenida de los Baobabs', emoji: '🌳', descripcion: 'Madagascar' },
  { id: 'dz', contenido: 'Casbah de Argel', emoji: '🏰', descripcion: 'Argel, Argelia' },
  { id: 'sn', contenido: 'Lago Rosa', emoji: '🏞️', descripcion: 'Senegal' },
  { id: 'ug', contenido: 'Montañas Rwenzori', emoji: '🏔️', descripcion: 'Uganda' },
  // ── OCEANÍA ──
  { id: 'au', contenido: 'Ópera de Sídney', emoji: '🎭', descripcion: 'Sídney, Australia' },
  { id: 'nz', contenido: 'Monte Ngauruhoe', emoji: '🗻', descripcion: 'Tongariro, Nueva Zelanda' },
  { id: 'fj', contenido: 'Islas Yasawa', emoji: '🏝️', descripcion: 'Fiyi' },
  { id: 'pg', contenido: 'Tierras Altas', emoji: '🏞️', descripcion: 'Papúa Nueva Guinea' },
  { id: 'sb', contenido: 'Arrecifes de coral', emoji: '🏝️', descripcion: 'Islas Salomón' },
  { id: 'vu', contenido: 'Volcán Yasur', emoji: '🌋', descripcion: 'Vanuatu' },
  { id: 'ws', contenido: 'Cascada de Sopoaga', emoji: '🏞️', descripcion: 'Samoa' },
  { id: 'ki', contenido: 'Laguna de Christmas', emoji: '🏝️', descripcion: 'Kiribati' }
];

/**
 * Cartas de animales para el tema "Animales del Mundo"
 * Cada carta tiene un emoji grande que funciona como figura visual
 */
const CARTAS_ANIMALES = [
  { id: 'leon', contenido: 'León', emoji: '🦁', descripcion: 'Rey de la sabana africana' },
  { id: 'elefante', contenido: 'Elefante', emoji: '🐘', descripcion: 'El animal terrestre más grande' },
  { id: 'jirafa', contenido: 'Jirafa', emoji: '🦒', descripcion: 'El animal más alto del mundo' },
  { id: 'panda', contenido: 'Panda', emoji: '🐼', descripcion: 'El oso más tierno de Asia' },
  { id: 'tigre', contenido: 'Tigre', emoji: '🐯', descripcion: 'El felino más grande del mundo' },
  { id: 'canguro', contenido: 'Canguro', emoji: '🦘', descripcion: 'El saltador de Oceanía' },
  { id: 'koala', contenido: 'Koala', emoji: '🐨', descripcion: 'El marsupial australiano' },
  { id: 'aguila', contenido: 'Águila', emoji: '🦅', descripcion: 'La reina de las aves' },
  { id: 'cocodrilo', contenido: 'Cocodrilo', emoji: '🐊', descripcion: 'El reptil más temible' },
  { id: 'tiburon', contenido: 'Tiburón', emoji: '🦈', descripcion: 'El depredador del océano' },
  { id: 'gorila', contenido: 'Gorila', emoji: '🦍', descripcion: 'El primate más fuerte' },
  { id: 'cebra', contenido: 'Cebra', emoji: '🦓', descripcion: 'El caballo de rayas' },
  { id: 'hipopotamo', contenido: 'Hipopótamo', emoji: '🦛', descripcion: 'El gigante del río' },
  { id: 'camello', contenido: 'Camello', emoji: '🐫', descripcion: 'El barco del desierto' },
  { id: 'flamenco', contenido: 'Flamenco', emoji: '🦩', descripcion: 'El ave de color rosa' },
  { id: 'loro', contenido: 'Loro', emoji: '🦜', descripcion: 'El ave que habla' },
  { id: 'osopardo', contenido: 'Oso Pardo', emoji: '🐻', descripcion: 'El gigante del bosque' },
  { id: 'leopardo', contenido: 'Leopardo', emoji: '🐆', descripcion: 'El felino manchado' },
  { id: 'zorro', contenido: 'Zorro', emoji: '🦊', descripcion: 'El astuto del bosque' },
  { id: 'ballena', contenido: 'Ballena Jorobada', emoji: '🐋', descripcion: 'El gigante del océano' },
  { id: 'mariposa', contenido: 'Mariposa', emoji: '🦋', descripcion: 'Belleza alada de colores' },
  { id: 'tortuga', contenido: 'Tortuga', emoji: '🐢', descripcion: 'El reptil de caparazón' },
  { id: 'delfin', contenido: 'Delfín', emoji: '🐬', descripcion: 'El inteligente del océano' },
  { id: 'serpiente', contenido: 'Serpiente', emoji: '🐍', descripcion: 'El reptil sin patas' },
  { id: 'buho', contenido: 'Búho', emoji: '🦉', descripcion: 'El sabio de la noche' },
  { id: 'mono', contenido: 'Mono', emoji: '🐒', descripcion: 'El travieso de la selva' },
  { id: 'pulpo', contenido: 'Pulpo', emoji: '🐙', descripcion: 'El maestro del camuflaje' },
  { id: 'erizo', contenido: 'Erizo', emoji: '🦔', descripcion: 'La bola de púas' },
  { id: 'mapache', contenido: 'Mapache', emoji: '🦝', descripcion: 'El enmascarado del bosque' }
];

// Cartas globales (mezcla de todos los continentes, excluyendo Antártida)
// para mantener consistencia visual (todas las cartas tienen banderas reales)
const CARTAS_GLOBALES = (() => {
  const { antartida, ...continentesConBanderas } = CARTAS_POR_CONTINENTE;
  return Object.values(continentesConBanderas).flat();
})();

/**
 * Obtiene los niveles de dificultad
 */
function obtenerNivelesMemoria() {
  return NIVELES_MEMORIA;
}

/**
 * Obtiene un nivel por su ID
 */
function obtenerNivelPorId(id) {
  return NIVELES_MEMORIA.find(n => n.id === id) || NIVELES_MEMORIA[1]; // default: medio
}

/**
 * Obtiene los temas disponibles
 */
function obtenerTemasMemoria() {
  return [
    { id: 'global', nombre: 'Vuelta al Mundo', icono: 'continentes', descripcion: 'Monumentos y lugares emblemáticos del mundo' },
    { id: 'banderas', nombre: 'Banderas del Mundo', icono: 'bandera', descripcion: 'Encuentra los pares de banderas' },
    { id: 'animales', nombre: 'Animales del Mundo', icono: 'diana', descripcion: 'Fauna emblemática de cada continente' }
  ];
}

/**
 * Obtiene cartas para un tema específico
 */
function obtenerCartasPorTema(temaId) {
  if (temaId === 'global') return CARTAS_MONUMENTOS;
  if (temaId === 'banderas') return CARTAS_GLOBALES;
  if (temaId === 'animales') return CARTAS_ANIMALES;
  return CARTAS_POR_CONTINENTE[temaId] || CARTAS_GLOBALES;
}

/**
 * Genera un juego de memoria con un nivel de dificultad específico
 * @param {string} temaId - ID del tema
 * @param {string} nivelId - ID del nivel de dificultad
 * @param {string} modo - 'normal' o 'contrarreloj'
 * @returns {Object} { cartas: Array, totalPares: number, nivel: Object, modo: string, tiempoLimite: number|null }
 */
function generarJuegoMemoria(temaId = 'global', nivelId = 'medio', modo = 'normal') {
  const nivel = obtenerNivelPorId(nivelId);
  const disponibles = obtenerCartasPorTema(temaId);
  const pares = Math.min(nivel.pares, disponibles.length);
  const seleccionadas = seleccionarAleatorio(disponibles, pares);
  
  // Crear pares (cada carta aparece 2 veces) y mezclar
  const esTemaAnimales = temaId === 'animales';
  const esTemaMonumentos = temaId === 'global';
  const cartas = [];
  for (const carta of seleccionadas) {
    // Detectar si es un país con bandera (código de 2 letras, no antártida)
    const usarBandera = carta.id.length === 2;
    const codigoPais = carta.id === 'uk' ? 'gb' : carta.id; // UK usa 'gb' en flagcdn
    
    const cartaBase = {
      idUnico: `${carta.id}-a`,
      parId: carta.id,
      contenido: carta.contenido,
      emoji: carta.emoji,
      descripcion: carta.descripcion,
      usarBandera: usarBandera,
      codigoPais: usarBandera ? codigoPais : null,
      esAnimal: esTemaAnimales,
      esMonumento: esTemaMonumentos
    };
    const cartaBaseB = {
      idUnico: `${carta.id}-b`,
      parId: carta.id,
      contenido: carta.contenido,
      emoji: carta.emoji,
      descripcion: carta.descripcion,
      usarBandera: usarBandera,
      codigoPais: usarBandera ? codigoPais : null,
      esAnimal: esTemaAnimales,
      esMonumento: esTemaMonumentos
    };
    cartas.push(cartaBase, cartaBaseB);
  }

  return {
    cartas: mezclarArray(cartas),
    totalPares: seleccionadas.length,
    nivel,
    modo,
    tiempoLimite: modo === 'contrarreloj' ? nivel.tiempoSegundos : null
  };
}

/**
 * Verifica si dos cartas forman un par
 */
function verificarPar(carta1, carta2) {
  return carta1.parId === carta2.parId;
}

module.exports = {
  obtenerNivelesMemoria,
  obtenerNivelPorId,
  obtenerTemasMemoria,
  obtenerCartasPorTema,
  generarJuegoMemoria,
  verificarPar
};
