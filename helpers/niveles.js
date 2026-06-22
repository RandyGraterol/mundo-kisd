/**
 * Sistema de Niveles Unificado - Mundo Kids
 *
 * Curva MUY LENTA: 200 * n * (n-1) XP acumulados para alcanzar el nivel n.
 *   Nivel 1: 0 XP
 *   Nivel 2: 400 XP
 *   Nivel 3: 1,200 XP
 *   Nivel 4: 2,400 XP
 *   Nivel 5: 4,000 XP
 *   Nivel 6: 6,000 XP
 *
 * Fórmula inversa: n = (1 + sqrt(1 + 0.02 * XP)) / 2
 * Derivación: 200*n*(n-1) = XP → n² - n - XP/200 = 0
 *             → n = (1 + sqrt(1 + 4*XP/200)) / 2 = (1 + sqrt(1 + 0.02*XP)) / 2
 *
 * Con esta curva, un alumno necesita aproximadamente:
 *   - 8-10 actividades fáciles completadas para subir al nivel 2
 *   - 12-15 actividades para nivel 3
 *   - Actividades difíciles dan más XP (multiplicador) para recompensar el esfuerzo
 */

const MULTIPLICADOR_DIFICULTAD = {
  facil: 1,
  medio: 1.5,
  dificil: 2,
  experto: 2.5,
  ultra: 3,
  extremo: 3.5,
  legendario: 4
};

/**
 * Calcula el nivel del usuario basado en puntos totales.
 * @param {number} puntosTotal - Puntos acumulados por el usuario
 * @returns {number} Nivel calculado (mínimo 1)
 */
function calcularNivel(puntosTotal) {
  if (puntosTotal <= 0) return 1;
  return Math.floor((1 + Math.sqrt(1 + 0.02 * puntosTotal)) / 2);
}

/**
 * Devuelve los puntos acumulados necesarios para alcanzar un nivel dado.
 * Útil para mostrar barras de progreso hacia el siguiente nivel.
 * @param {number} nivel - Nivel objetivo
 * @returns {number} XP acumulada requerida
 */
function xpParaNivel(nivel) {
  if (nivel <= 1) return 0;
  return 200 * nivel * (nivel - 1);
}

/**
 * Calcula el progreso hacia el siguiente nivel.
 * @param {number} puntosTotal - Puntos actuales
 * @returns {{nivelActual: number, nivelSiguiente: number, xpActual: number, xpNecesaria: number, xpFaltante: number, progreso: number}}
 */
function calcularProgresoNivel(puntosTotal) {
  const nivelActual = calcularNivel(puntosTotal);
  const nivelSiguiente = nivelActual + 1;
  const xpActual = xpParaNivel(nivelActual);
  const xpNecesaria = xpParaNivel(nivelSiguiente);
  const xpEnNivel = puntosTotal - xpActual;
  const xpRangoNivel = xpNecesaria - xpActual;
  const xpFaltante = Math.max(0, xpNecesaria - puntosTotal);
  const progreso = xpRangoNivel > 0 ? Math.min(100, Math.round((xpEnNivel / xpRangoNivel) * 100)) : 0;

  return {
    nivelActual,
    nivelSiguiente,
    xpActual: puntosTotal,
    xpInicioNivel: xpActual,
    xpFinNivel: xpNecesaria,
    xpFaltante,
    progreso
  };
}

/**
 * Devuelve el multiplicador de XP para un nivel de dificultad.
 * Las actividades más difíciles otorgan más puntos para recompensar el esfuerzo.
 * @param {string} nivelId - ID del nivel (facil, medio, dificil, etc.)
 * @returns {number} Multiplicador (1 a 4)
 */
function multiplicadorDificultad(nivelId) {
  return MULTIPLICADOR_DIFICULTAD[nivelId] || 1;
}

module.exports = {
  calcularNivel,
  xpParaNivel,
  calcularProgresoNivel,
  multiplicadorDificultad
};
