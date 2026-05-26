// Helper de Aleatorización - Mundo Kids
// Funciones para mezclar preguntas, opciones y contenido de forma dinámica

/**
 * Mezcla un array usando el algoritmo Fisher-Yates (Knuth shuffle)
 * @param {Array} array - Array a mezclar (no modifica el original)
 * @returns {Array} Nuevo array mezclado
 */
function mezclarArray(array) {
  if (!array || array.length === 0) return [];
  const resultado = [...array];
  for (let i = resultado.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [resultado[i], resultado[j]] = [resultado[j], resultado[i]];
  }
  return resultado;
}

/**
 * Selecciona N elementos aleatorios de un array
 * @param {Array} array - Array de origen
 * @param {number} cantidad - Cantidad de elementos a seleccionar
 * @returns {Array} Array con los elementos seleccionados (mezclados)
 */
function seleccionarAleatorio(array, cantidad = 1) {
  if (!array || array.length === 0) return [];
  const mezclado = mezclarArray(array);
  return mezclado.slice(0, Math.min(cantidad, array.length));
}

/**
 * Mezcla las opciones de respuesta y devuelve las opciones mezcladas con el nuevo índice correcto
 * @param {Array} opciones - Array de opciones originales
 * @param {number} indiceCorrecto - Índice de la respuesta correcta en el array original
 * @returns {Object} { opciones: Array, nuevoIndiceCorrecto: number }
 */
function mezclarOpciones(opciones, indiceCorrecto) {
  if (!opciones || opciones.length === 0) {
    return { opciones: [], nuevoIndiceCorrecto: -1 };
  }

  const respuestaCorrecta = opciones[indiceCorrecto];
  const indices = opciones.map((_, i) => i);
  const indicesMezclados = mezclarArray(indices);
  const opcionesMezcladas = indicesMezclados.map(i => opciones[i]);
  const nuevoIndiceCorrecto = opcionesMezcladas.indexOf(respuestaCorrecta);

  return {
    opciones: opcionesMezcladas,
    nuevoIndiceCorrecto
  };
}

/**
 * Genera un ID único para cada partida
 * @returns {string} ID único
 */
function generarIdPartida() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * Obtiene un número entero aleatorio entre min y max (inclusivo)
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {number} Número aleatorio
 */
function numeroAleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  mezclarArray,
  seleccionarAleatorio,
  mezclarOpciones,
  generarIdPartida,
  numeroAleatorio
};
