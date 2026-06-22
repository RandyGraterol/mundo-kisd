/**
 * Sistema de Desbloqueo Progresivo - Mundo Kids
 *
 * Cada nivel se desbloquea tras completar el nivel anterior un número
 * mínimo de veces (REQUISITOS). Esto fomenta la rejugarabilidad: el
 * estudiante debe demostrar dominio del nivel fácil antes de avanzar.
 *
 * Formato de nivelesCompletados (nuevo):
 *   {
 *     memoria: {
 *       facil:   { count: 3, bestScore: 120, estrellas: 3 },
 *       medio:   { count: 1, bestScore: 80,  estrellas: 2 },
 *       ...
 *     },
 *     puzzle: { ... },
 *     sopa:   { ... }
 *   }
 *
 * Formato antiguo (legacy):
 *   { memoria: ['facil', 'medio'] }
 * Se migra automáticamente al cargar.
 */

const PROGRESION = {
  memoria: ['facil', 'medio', 'dificil', 'experto', 'ultra', 'extremo', 'legendario'],
  puzzle: ['facil', 'medio', 'dificil', 'experto', 'ultra', 'extremo', 'legendario'],
  sopa: ['facil', 'medio', 'dificil', 'experto', 'ultra', 'extremo', 'legendario']
};

// Número de completaciones requeridas del nivel anterior para desbloquear el siguiente.
// Escalable: los primeros niveles requieren menos, los avanzados más.
const REQUISITOS = {
  facil: 0,      // Siempre disponible
  medio: 2,      // 2 completaciones de "facil"
  dificil: 3,    // 3 completaciones de "medio"
  experto: 3,    // 3 completaciones de "dificil"
  ultra: 4,      // 4 completaciones de "experto"
  extremo: 4,    // 4 completaciones de "ultra"
  legendario: 5  // 5 completaciones de "extremo"
};

/**
 * Migra el formato antiguo (array) al nuevo formato (objeto con stats).
 * Si ya está en formato nuevo, lo devuelve sin cambios.
 *
 * Para el formato antiguo, se preservan los desbloqueos: si un nivel N+1
 * estaba marcado como completado, se le da al nivel N suficientes completaciones
 * para satisfacer el requisito de desbloqueo de N+1.
 *
 * @param {Object} completados - Estructura de niveles completados
 * @returns {Object} Estructura migrada al nuevo formato
 */
function migrarFormato(completados) {
  if (!completados || typeof completados !== 'object') return {};
  const migrado = {};
  for (const juego of Object.keys(completados)) {
    const valor = completados[juego];
    if (Array.isArray(valor)) {
      // Formato antiguo: ['facil', 'medio'] → { facil: { count, bestScore, estrellas }, ... }
      migrado[juego] = {};
      const progresion = PROGRESION[juego] || [];
      for (const nivelId of valor) {
        // Determinar cuántas completaciones dar: si el SIGUIENTE nivel en la
        // progresión también está en el array, necesitamos al menos el requisito
        // de ese siguiente nivel. Si no, dar 1.
        const idx = progresion.indexOf(nivelId);
        let count = 1;
        if (idx >= 0 && idx < progresion.length - 1) {
          const siguienteId = progresion[idx + 1];
          if (valor.includes(siguienteId)) {
            count = REQUISITOS[siguienteId] || 1;
          }
        }
        migrado[juego][nivelId] = { count, bestScore: 0, estrellas: 1 };
      }
    } else if (valor && typeof valor === 'object') {
      // Formato nuevo: copiar sin cambios
      migrado[juego] = {};
      for (const nivelId of Object.keys(valor)) {
        const stats = valor[nivelId];
        if (stats && typeof stats === 'object') {
          migrado[juego][nivelId] = {
            count: stats.count || 1,
            bestScore: stats.bestScore || 0,
            estrellas: stats.estrellas || 1
          };
        }
      }
    }
  }
  return migrado;
}

/**
 * Obtiene las stats de un nivel completado.
 * @param {string} juego - 'memoria', 'puzzle', 'sopa'
 * @param {string} nivelId - ID del nivel
 * @param {Object} completados - Estructura (formato nuevo)
 * @returns {Object|null} { count, bestScore, estrellas } o null
 */
function obtenerStats(juego, nivelId, completados) {
  const migrado = migrarFormato(completados);
  return migrado?.[juego]?.[nivelId] || null;
}

/**
 * Verifica si un nivel está desbloqueado.
 * El primer nivel siempre está desbloqueado. Los siguientes requieren
 * completar el nivel anterior un mínimo de veces (REQUISITOS).
 * @param {string} juego - 'memoria', 'puzzle', 'sopa'
 * @param {string} nivelId - ID del nivel a verificar
 * @param {Object} completados - Estructura de niveles completados
 * @returns {boolean}
 */
function estaDesbloqueado(juego, nivelId, completados) {
  const progresion = PROGRESION[juego];
  if (!progresion) return true;
  const index = progresion.indexOf(nivelId);
  if (index <= 0) return true; // Primer nivel siempre disponible
  const requerido = progresion[index - 1];
  const stats = obtenerStats(juego, requerido, completados);
  if (!stats) return false;
  const minCompletaciones = REQUISITOS[nivelId] || 1;
  return stats.count >= minCompletaciones;
}

/**
 * Devuelve el nivel requerido (anterior) para desbloquear el nivel dado.
 * @param {string} juego - 'memoria', 'puzzle', 'sopa'
 * @param {string} nivelId - ID del nivel
 * @returns {string|null} ID del nivel requerido o null
 */
function nivelRequerido(juego, nivelId) {
  const progresion = PROGRESION[juego];
  if (!progresion) return null;
  const index = progresion.indexOf(nivelId);
  if (index <= 0) return null;
  return progresion[index - 1];
}

/**
 * Devuelve el número de completaciones requeridas para desbloquear el nivel dado.
 * @param {string} nivelId - ID del nivel
 * @returns {number}
 */
function completacionesRequeridas(nivelId) {
  return REQUISITOS[nivelId] || 0;
}

/**
 * Enriquece una lista de niveles con info de desbloqueo y progreso.
 * @param {string} juego - 'memoria', 'puzzle', 'sopa'
 * @param {Array} niveles - Lista de niveles del juego
 * @param {Object} completados - Estructura de niveles completados
 * @returns {Array} Niveles con campos: desbloqueado, nivelRequerido, progresoDesbloqueo, completadoCount, bestScore, estrellas
 */
function enriquecerConDesbloqueo(juego, niveles, completados) {
  const migrado = migrarFormato(completados);
  return niveles.map(n => {
    const index = PROGRESION[juego]?.indexOf(n.id);
    const desbloqueado = estaDesbloqueado(juego, n.id, completados);
    const nivelReq = nivelRequerido(juego, n.id);
    const stats = migrado?.[juego]?.[n.id] || null;

    // Progreso hacia el desbloqueo del SIGUIENTE nivel
    let progresoDesbloqueoSiguiente = null;
    if (index !== undefined && index >= 0 && index < PROGRESION[juego].length - 1) {
      const siguienteId = PROGRESION[juego][index + 1];
      const reqSiguiente = REQUISITOS[siguienteId] || 1;
      const countActual = stats?.count || 0;
      progresoDesbloqueoSiguiente = {
        siguienteNivel: siguienteId,
        completadoActual: countActual,
        requerido: reqSiguiente
      };
    }

    // Progreso para desbloquear ESTE nivel (cuántas veces se ha completado el anterior)
    let progresoHaciaDesbloqueo = null;
    if (!desbloqueado && nivelReq) {
      const statsReq = migrado?.[juego]?.[nivelReq] || null;
      const req = REQUISITOS[n.id] || 1;
      progresoHaciaDesbloqueo = {
        nivelRequerido: nivelReq,
        completadoActual: statsReq?.count || 0,
        requerido: req
      };
    }

    return {
      ...n,
      desbloqueado,
      nivelRequerido: nivelReq,
      completadoCount: stats?.count || 0,
      bestScore: stats?.bestScore || 0,
      estrellas: stats?.estrellas || 0,
      progresoDesbloqueoSiguiente,
      progresoHaciaDesbloqueo
    };
  });
}

/**
 * Marca un nivel como completado, incrementando el contador y actualizando stats.
 * @param {string} juego - 'memoria', 'puzzle', 'sopa'
 * @param {string} nivelId - ID del nivel completado
 * @param {Object} completados - Estructura actual (se migrará si es formato antiguo)
 * @param {number} [score=0] - Puntaje obtenido en esta partida
 * @param {number} [estrellas=1] - Estrellas obtenidas (1-3)
 * @returns {Object} Nueva estructura de completados (formato nuevo)
 */
function marcarCompletado(juego, nivelId, completados, score = 0, estrellas = 1) {
  const migrado = migrarFormato(completados);
  if (!migrado[juego]) migrado[juego] = {};
  const actual = migrado[juego][nivelId] || { count: 0, bestScore: 0, estrellas: 0 };
  migrado[juego][nivelId] = {
    count: (actual.count || 0) + 1,
    bestScore: Math.max(actual.bestScore || 0, score),
    estrellas: Math.max(actual.estrellas || 0, estrellas)
  };
  return migrado;
}

module.exports = {
  PROGRESION,
  REQUISITOS,
  migrarFormato,
  obtenerStats,
  estaDesbloqueado,
  nivelRequerido,
  completacionesRequeridas,
  enriquecerConDesbloqueo,
  marcarCompletado
};
