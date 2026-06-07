/**
 * Calcula el nivel del usuario basado en puntos totales.
 * Curva: 20 * n * (n - 1) XP acumulados para el nivel n
 * Nivel 1: 0 XP, Nivel 2: 40 XP, Nivel 3: 120 XP, Nivel 4: 240 XP...
 * Inverso: n = (1 + sqrt(1 + 0.2 * XP)) / 2
 */
function calcularNivel(puntosTotal) {
  if (puntosTotal <= 0) return 1;
  return Math.floor((1 + Math.sqrt(1 + 0.2 * puntosTotal)) / 2);
}

module.exports = { calcularNivel };
