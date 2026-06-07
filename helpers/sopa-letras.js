// Helper de Sopa de Letras - Mundo Kids
// Genera cuadrículas de sopa de letras con vocabulario geográfico

const { numeroAleatorio, mezclarArray } = require('./aleatorizacion');

/**
 * Niveles de dificultad para la sopa de letras
 */
const NIVELES_SOPA = [
  { id: 'facil', nombre: 'Fácil', tamano: 8, palabras: 5, descripcion: '8×8 • 5 palabras', tiempoSegundos: 120 },
  { id: 'medio', nombre: 'Medio', tamano: 10, palabras: 7, descripcion: '10×10 • 7 palabras', tiempoSegundos: 100 },
  { id: 'dificil', nombre: 'Difícil', tamano: 12, palabras: 9, descripcion: '12×12 • 9 palabras', tiempoSegundos: 80 },
  { id: 'experto', nombre: 'Experto', tamano: 14, palabras: 11, descripcion: '14×14 • 11 palabras', tiempoSegundos: 60 },
  { id: 'ultra', nombre: 'Ultra', tamano: 15, palabras: 13, descripcion: '15×15 • 13 palabras', tiempoSegundos: 50 },
  { id: 'extremo', nombre: 'Extremo', tamano: 16, palabras: 15, descripcion: '16×16 • 15 palabras', tiempoSegundos: 40 },
  { id: 'legendario', nombre: 'Legendario', tamano: 18, palabras: 18, descripcion: '18×18 • 18 palabras', tiempoSegundos: 30 }
];

/**
 * Vocabulario geográfico organizado por continente
 */
const VOCABULARIO_POR_CONTINENTE = {
  america: ['AMAZONAS', 'ANDES', 'BRASIL', 'MAYAS', 'MEXICO', 'CANADA', 'ARGENTINA', 'INCAS', 'ORINOCO'],
  europa: ['ALEMANIA', 'FRANCIA', 'ITALIA', 'LONDRES', 'ROMA', 'VATICANO', 'GRECIA', 'ALPES', 'RUSIA'],
  asia: ['EVEREST', 'CHINA', 'JAPON', 'HIMALAYA', 'INDIA', 'MONZON', 'BUDISMO', 'GANGES', 'TOKIO'],
  africa: ['NILO', 'SAHARA', 'NIGERIA', 'EGIPTO', 'SABANA', 'LEON', 'ETIOPIA', 'KENIA', 'MARRUECOS'],
  oceania: ['AUSTRALIA', 'CANGURO', 'KOALA', 'FIJI', 'CORAL', 'SIDNEY', 'KIWI', 'PACIFICO', 'ABORIGEN'],
  antartida: ['PINGUINO', 'HIELO', 'FOCA', 'POLO_SUR', 'GLACIAR', 'BALLENA', 'ALBATROS', 'AURORA', 'BASE']
};

// Vocabulario global (todos los continentes mezclados)
const VOCABULARIO_GLOBAL = Object.values(VOCABULARIO_POR_CONTINENTE).flat();

// Temas disponibles
const TEMAS_SOPA = [
  { id: 'global', nombre: 'Viaje Mundial', icono: 'continentes', palabras: VOCABULARIO_GLOBAL },
  { id: 'america', nombre: 'América', icono: 'america', palabras: VOCABULARIO_POR_CONTINENTE.america },
  { id: 'europa', nombre: 'Europa', icono: 'europa', palabras: VOCABULARIO_POR_CONTINENTE.europa },
  { id: 'asia', nombre: 'Asia', icono: 'asia', palabras: VOCABULARIO_POR_CONTINENTE.asia },
  { id: 'africa', nombre: 'África', icono: 'africa', palabras: VOCABULARIO_POR_CONTINENTE.africa },
  { id: 'oceania', nombre: 'Oceanía', icono: 'oceania', palabras: VOCABULARIO_POR_CONTINENTE.oceania },
  { id: 'antartida', nombre: 'Antártida', icono: 'antartida', palabras: VOCABULARIO_POR_CONTINENTE.antartida }
];

/**
 * Obtiene los temas disponibles para la sopa de letras
 */
function obtenerTemas() {
  return TEMAS_SOPA;
}

/**
 * Obtiene los niveles disponibles
 */
function obtenerNiveles() {
  return NIVELES_SOPA;
}

/**
 * Obtiene un nivel por su ID
 */
function obtenerNivelPorId(id) {
  return NIVELES_SOPA.find(n => n.id === id) || NIVELES_SOPA[0];
}

/**
 * Genera una sopa de letras para un tema y nivel específicos
 */
function generarSopaPorNivel(temaId, nivelId) {
  const nivel = obtenerNivelPorId(nivelId);
  let palabrasBase = obtenerPalabrasPorTema(temaId);
  // If the theme doesn't have enough words, supplement with global words
  if (palabrasBase.length < nivel.palabras) {
    const extras = VOCABULARIO_GLOBAL.filter(p => !palabrasBase.includes(p));
    palabrasBase = [...palabrasBase, ...extras];
  }
  const palabrasSeleccionadas = mezclarArray(palabrasBase).slice(0, nivel.palabras);
  return generarSopaLetrasConPalabras(palabrasSeleccionadas, nivel.tamano);
}

/**
 * Coloca una palabra en la cuadrícula en una dirección específica
 */
function colocarPalabra(grid, tamano, palabra, fila, col, direccion) {
  const direcciones = [
    [0, 1],   // horizontal derecha
    [1, 0],   // vertical abajo
    [1, 1],   // diagonal abajo-derecha
    [0, -1],  // horizontal izquierda
    [-1, 0],  // vertical arriba
    [-1, -1], // diagonal arriba-izquierda
    [1, -1],  // diagonal abajo-izquierda
    [-1, 1]   // diagonal arriba-derecha
  ];

  const [df, dc] = direcciones[direccion];
  
  // Verificar que la palabra cabe en la posición
  for (let i = 0; i < palabra.length; i++) {
    const f = fila + df * i;
    const c = col + dc * i;
    if (f < 0 || f >= tamano || c < 0 || c >= tamano) return false;
    if (grid[f][c] !== '' && grid[f][c] !== palabra[i]) return false;
  }

  // Colocar la palabra
  for (let i = 0; i < palabra.length; i++) {
    const f = fila + df * i;
    const c = col + dc * i;
    grid[f][c] = palabra[i];
  }

  return true;
}

/**
 * Genera una cuadrícula de sopa de letras
 * @param {number} tamano - Tamaño de la cuadrícula (ej: 12 para 12x12)
 * @param {string[]} palabrasPersonalizadas - Palabras adicionales opcionales
 * @returns {Object} { grid, palabras, posiciones }
 */
function generarSopaLetras(tamano = 12, palabrasPersonalizadas = []) {
  // Si se pasa un temaId como segundo argumento, usarlo para filtrar palabras
  if (typeof palabrasPersonalizadas === 'string') {
    return generarSopaPorTema(palabrasPersonalizadas, tamano);
  }
  // Seleccionar palabras del vocabulario global
  const todasPalabras = [...VOCABULARIO_GLOBAL, ...palabrasPersonalizadas];
  const palabrasUnicas = [...new Set(todasPalabras)];
  const palabras = mezclarArray(palabrasUnicas).slice(0, 8);

  // Inicializar cuadrícula vacía
  const grid = Array.from({ length: tamano }, () => Array(tamano).fill(''));
  
  const posiciones = [];
  const palabrasColocadas = [];
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  // Colocar cada palabra
  for (const palabra of palabras) {
    let colocada = false;
    let intentos = 0;
    
    while (!colocada && intentos < 100) {
      const fila = numeroAleatorio(0, tamano - 1);
      const col = numeroAleatorio(0, tamano - 1);
      const direccion = numeroAleatorio(0, 7);
      
      if (colocarPalabra(grid, tamano, palabra, fila, col, direccion)) {
        posiciones.push({ palabra, fila, col, direccion });
        colocada = true;
        palabrasColocadas.push(palabra);
      }
      intentos++;
    }
  }

  // Llenar espacios vacíos con letras aleatorias
  for (let f = 0; f < tamano; f++) {
    for (let c = 0; c < tamano; c++) {
      if (grid[f][c] === '') {
        grid[f][c] = letras[numeroAleatorio(0, letras.length - 1)];
      }
    }
  }

  return { grid, palabras: palabrasColocadas, posiciones };
}

/**
 * Obtiene el vocabulario para un tema específico
 */
function obtenerPalabrasPorTema(temaId) {
  if (temaId === 'global') return VOCABULARIO_GLOBAL;
  return VOCABULARIO_POR_CONTINENTE[temaId] || VOCABULARIO_GLOBAL;
}

/**
 * Genera una sopa de letras para un tema específico
 */
function generarSopaPorTema(temaId, tamano = 12) {
  const palabrasBase = obtenerPalabrasPorTema(temaId);
  const palabrasSeleccionadas = mezclarArray(palabrasBase).slice(0, 8);
  return generarSopaLetrasConPalabras(palabrasSeleccionadas, tamano);
}

/**
 * Genera sopa de letras con palabras específicas
 */
function generarSopaLetrasConPalabras(palabras, tamano = 12) {
  const grid = Array.from({ length: tamano }, () => Array(tamano).fill(''));
  const posiciones = [];
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const palabrasColocadas = [];

  for (const palabra of palabras) {
    let colocada = false;
    let intentos = 0;
    
    while (!colocada && intentos < 100) {
      const fila = numeroAleatorio(0, tamano - 1);
      const col = numeroAleatorio(0, tamano - 1);
      const direccion = numeroAleatorio(0, 7);
      
      if (colocarPalabra(grid, tamano, palabra, fila, col, direccion)) {
        posiciones.push({ palabra, fila, col, direccion });
        colocada = true;
        palabrasColocadas.push(palabra);
      }
      intentos++;
    }
  }

  // Llenar vacíos
  for (let f = 0; f < tamano; f++) {
    for (let c = 0; c < tamano; c++) {
      if (grid[f][c] === '') {
        grid[f][c] = letras[numeroAleatorio(0, letras.length - 1)];
      }
    }
  }

  return { grid, palabras: palabrasColocadas, posiciones };
}

module.exports = {
  obtenerTemas,
  obtenerNiveles,
  obtenerNivelPorId,
  generarSopaLetras,
  generarSopaPorTema,
  generarSopaPorNivel,
  generarSopaLetrasConPalabras,
  VOCABULARIO_POR_CONTINENTE,
  VOCABULARIO_GLOBAL
};
