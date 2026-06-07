// Helper de Rompecabezas - Mundo Kids
// Genera rompecabezas con piezas para ordenar

const { mezclarArray, numeroAleatorio } = require('./aleatorizacion');
const { obtenerContinentes } = require('../data/continentes');

/**
 * Temas de puzzles disponibles
 */
const TEMAS_PUZZLE = [
  {
    id: 'mapa',
    nombre: 'Mapa del Mundo',
    icono: 'mapa',
    colores: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'],
    descripcion: 'Ordena las piezas del mapa mundial'
  },
  {
    id: 'continentes',
    nombre: 'Los Continentes',
    icono: 'continentes',
    colores: ['#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#6b7280', '#f97316', '#14b8a6'],
    descripcion: 'Acomoda los continentes en su lugar'
  },
  {
    id: 'banderas',
    nombre: 'Banderas del Mundo',
    icono: 'bandera',
    colores: ['#dc2626', '#2563eb', '#16a34a', '#eab308', '#9333ea', '#ea580c', '#0891b2', '#be123c'],
    descripcion: 'Forma la bandera correcta'
  },
  {
    id: 'animales',
    nombre: 'Animales del Mundo',
    icono: 'diana',
    colores: ['#d97706', '#059669', '#7c3aed', '#db2777', '#0284c7', '#65a30d', '#e11d48', '#0e7490'],
    descripcion: 'Descubre el animal geográfico'
  },
  {
    id: 'monumentos',
    nombre: 'Monumentos del Mundo',
    icono: 'historia',
    colores: ['#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f', '#65a30d', '#ca8a04', '#a16207'],
    descripcion: 'Lugares emblemáticos del planeta'
  }
];

/**
 * Genera temas de puzzles para continentes individuales dinámicamente
 */
function obtenerTemasContinentes() {
  const continentes = obtenerContinentes();
  return continentes.map(c => ({
    id: `continente-${c.id}`,
    nombre: `Puzzle: ${c.nombre}`,
    icono: c.svgIcon || c.id,
    continenteId: c.id,
    colores: [c.color, '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'],
    descripcion: `Arma el rompecabezas de ${c.nombre}`
  }));
}

/**
 * Niveles de dificultad para el puzzle
 */
const DIFICULTADES = [
  { id: 'facil', nombre: 'Fácil', filas: 3, columnas: 3, piezas: 9 },
  { id: 'medio', nombre: 'Medio', filas: 4, columnas: 4, piezas: 16 },
  { id: 'dificil', nombre: 'Difícil', filas: 5, columnas: 5, piezas: 25 },
  { id: 'experto', nombre: 'Experto', filas: 6, columnas: 6, piezas: 36 },
  { id: 'ultra', nombre: 'Ultra', filas: 7, columnas: 7, piezas: 49 },
  { id: 'extremo', nombre: 'Extremo', filas: 8, columnas: 8, piezas: 64 },
  { id: 'legendario', nombre: 'Legendario', filas: 9, columnas: 9, piezas: 81 }
];

/**
 * Genera las posiciones de las piezas para el puzzle
 * @param {string} temaId - ID del tema
 * @param {number} filas - Número de filas
 * @param {number} columnas - Número de columnas
 * @returns {Object} { piezas: Array, filas, columnas, totalPiezas }
 */
function generarPuzzle(temaId = 'mapa', filas = 3, columnas = 3) {
  // Crear piezas con información de posición
  const piezas = [];
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      const posCorrecta = f * columnas + c;
      piezas.push({
        id: posCorrecta,
        filaCorrecta: f,
        columnaCorrecta: c,
        posicionCorrecta: posCorrecta
      });
    }
  }

  // Desordenar piezas (pero garantizar que sea solucionable)
  const piezasDesordenadas = mezclarArray(piezas);
  
  // Verificar que no esté en el orden correcto por casualidad
  let enOrden = true;
  for (let i = 0; i < piezasDesordenadas.length; i++) {
    if (piezasDesordenadas[i].id !== i) {
      enOrden = false;
      break;
    }
  }
  
  // Si está en orden, intercambiar dos piezas aleatorias
  if (enOrden && piezasDesordenadas.length > 1) {
    const a = numeroAleatorio(0, Math.min(2, piezasDesordenadas.length - 1));
    const b = numeroAleatorio(piezasDesordenadas.length - 3, piezasDesordenadas.length - 1);
    [piezasDesordenadas[a], piezasDesordenadas[b]] = [piezasDesordenadas[b], piezasDesordenadas[a]];
  }

  return {
    piezas: piezasDesordenadas,
    filas,
    columnas,
    totalPiezas: filas * columnas,
    tema: TEMAS_PUZZLE.find(t => t.id === temaId) || TEMAS_PUZZLE[0]
  };
}

/**
 * Verifica si el puzzle está resuelto
 */
function verificarPuzzleCompletado(piezas) {
  for (let i = 0; i < piezas.length; i++) {
    if (piezas[i].posicionCorrecta !== i) {
      return false;
    }
  }
  return true;
}

/**
 * Verifica si una pieza está en su posición correcta
 */
function piezaEnPosicionCorrecta(pieza, indiceActual) {
  return pieza.posicionCorrecta === indiceActual;
}

module.exports = {
  obtenerTemas: () => TEMAS_PUZZLE,
  obtenerTemasContinentes,
  obtenerDificultades: () => DIFICULTADES,
  generarPuzzle,
  verificarPuzzleCompletado,
  piezaEnPosicionCorrecta
};
