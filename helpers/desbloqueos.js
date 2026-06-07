/**
 * Sistema de Desbloqueo Progresivo
 * Cada nivel se desbloquea completando el nivel anterior del mismo juego
 */

const PROGRESION = {
  memoria: ['facil', 'medio', 'dificil', 'experto', 'ultra', 'extremo', 'legendario'],
  puzzle: ['facil', 'medio', 'dificil', 'experto', 'ultra', 'extremo', 'legendario'],
  sopa: ['facil', 'medio', 'dificil', 'experto', 'ultra', 'extremo', 'legendario']
};

function estaDesbloqueado(juego, nivelId, completados) {
  const progresion = PROGRESION[juego];
  if (!progresion) return true;
  const index = progresion.indexOf(nivelId);
  if (index <= 0) return true;
  const requerido = progresion[index - 1];
  return (completados?.[juego] || []).includes(requerido);
}

function nivelRequerido(juego, nivelId) {
  const progresion = PROGRESION[juego];
  if (!progresion) return null;
  const index = progresion.indexOf(nivelId);
  if (index <= 0) return null;
  return progresion[index - 1];
}

function enriquecerConDesbloqueo(juego, niveles, completados) {
  return niveles.map(n => ({
    ...n,
    desbloqueado: estaDesbloqueado(juego, n.id, completados),
    nivelRequerido: nivelRequerido(juego, n.id)
  }));
}

function marcarCompletado(juego, nivelId, completados) {
  if (!completados) completados = {};
  if (!completados[juego]) completados[juego] = [];
  if (!completados[juego].includes(nivelId)) {
    completados[juego].push(nivelId);
  }
  return completados;
}

module.exports = {
  PROGRESION,
  estaDesbloqueado,
  nivelRequerido,
  enriquecerConDesbloqueo,
  marcarCompletado
};
