/**
 * Sistema de Estrellas - Mundo Kids
 *
 * Calcula estrellas (1-3) según el desempeño en cada actividad.
 *   1 estrella = completado
 *   2 estrellas = buen desempeño
 *   3 estrellas = desempeño excelente
 *
 * Las estrellas se usan para mostrar dominio del nivel y motivar la rejugarabilidad.
 */

/**
 * Calcula estrellas para el juego de memoria.
 * Basado en la relación entre pares encontrados e intentos.
 * @param {number} paresEncontrados - Pares encontrados
 * @param {number} totalPares - Total de pares del nivel
 * @param {number} intentos - Total de intentos realizados
 * @returns {number} 1, 2 o 3 estrellas
 */
function estrellasMemoria(paresEncontrados, totalPares, intentos) {
  if (paresEncontrados < totalPares) return 0; // No completado
  if (totalPares === 0) return 1;
  // Eficiencia = pares / intentos. Ideal = 1.0 (cada intento fue un par)
  // 3 estrellas si eficiencia >= 0.75, 2 si >= 0.5, 1 si completado
  const eficiencia = totalPares / Math.max(intentos, totalPares);
  if (eficiencia >= 0.75) return 3;
  if (eficiencia >= 0.5) return 2;
  return 1;
}

/**
 * Calcula estrellas para el rompecabezas.
 * Basado en la relación entre piezas y movimientos.
 * @param {number} totalPiezas - Total de piezas del puzzle
 * @param {number} movimientos - Movimientos realizados
 * @returns {number} 1, 2 o 3 estrellas
 */
function estrellasPuzzle(totalPiezas, movimientos) {
  if (totalPiezas === 0) return 1;
  // 3 estrellas si movimientos <= totalPiezas * 1.5
  // 2 estrellas si movimientos <= totalPiezas * 3
  // 1 estrella si completado
  if (movimientos <= totalPiezas * 1.5) return 3;
  if (movimientos <= totalPiezas * 3) return 2;
  return 1;
}

/**
 * Calcula estrellas para la sopa de letras.
 * Basado en el tiempo usado vs tiempo límite (o tiempo óptimo estimado).
 * @param {number} totalPalabras - Total de palabras a encontrar
 * @param {number} palabrasEncontradas - Palabras encontradas
 * @param {number} tiempoSegundos - Tiempo usado (opcional)
 * @param {number} tiempoLimite - Tiempo límite del nivel (opcional)
 * @returns {number} 1, 2 o 3 estrellas
 */
function estrellasSopaLetras(totalPalabras, palabrasEncontradas, tiempoSegundos, tiempoLimite) {
  if (palabrasEncontradas < totalPalabras) return 0; // No completado
  // Si no hay tiempo, dar 2 estrellas por defecto (completado sin contrarreloj)
  if (!tiempoSegundos) return 2;
  // Calcular tiempo óptimo: 3 segundos por palabra
  const tiempoOptimo = totalPalabras * 3;
  if (tiempoSegundos <= tiempoOptimo) return 3;
  if (tiempoLimite && tiempoSegundos <= tiempoLimite * 0.5) return 3;
  if (tiempoLimite && tiempoSegundos <= tiempoLimite * 0.75) return 2;
  if (tiempoSegundos <= tiempoOptimo * 2) return 2;
  return 1;
}

/**
 * Devuelve un string representando las estrellas para mostrar en la UI.
 * @param {number} estrellas - Número de estrellas (0-3)
 * @returns {string} "★★★", "★★☆", "★☆☆", "☆☆☆"
 */
function estrellasHTML(estrellas) {
  const llenas = Math.max(0, Math.min(3, estrellas));
  return '★'.repeat(llenas) + '☆'.repeat(3 - llenas);
}

module.exports = {
  estrellasMemoria,
  estrellasPuzzle,
  estrellasSopaLetras,
  estrellasHTML
};
