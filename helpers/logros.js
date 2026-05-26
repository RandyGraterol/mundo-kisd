// Sistema de Logros - Mundo Kids
// Catálogo de logros y funciones de verificación

const {
  obtenerTodosLosLogros,
  obtenerLogrosUsuario,
  tieneLogro,
  desbloquearLogro,
  obtenerHistorial,
  obtenerHistorialCompleto,
  obtenerTodoProgreso,
  buscarUsuarioPorId,
  contarLogrosDesbloqueados
} = require('../database/db');

/**
 * Verifica y desbloquea logros para un usuario después de una actividad
 * @param {number} usuarioId - ID del usuario
 * @returns {Array} Lista de logros recién desbloqueados
 */
function verificarYDesbloquearLogros(usuarioId) {
  const logrosDesbloqueados = [];
  const logros = obtenerTodosLosLogros();
  const usuario = buscarUsuarioPorId(usuarioId);

  if (!usuario) return logrosDesbloqueados;

  for (const logro of logros) {
    // Si ya tiene el logro, saltar
    if (tieneLogro(usuarioId, logro.id)) continue;

    let desbloquear = false;

    switch (logro.condicion_tipo) {
      case 'nivel':
        desbloquear = usuario.nivel >= logro.condicion_valor;
        break;

      case 'puntos_totales':
        desbloquear = usuario.puntos_total >= logro.condicion_valor;
        break;

      case 'retos_completados': {
        const progreso = obtenerTodoProgreso(usuarioId);
        const totalRetos = progreso.reduce((sum, p) => sum + p.retos_completados, 0);
        desbloquear = totalRetos >= logro.condicion_valor;
        break;
      }

      case 'actividades_totales':
        desbloquear = obtenerHistorial(usuarioId, 1000).length >= logro.condicion_valor;
        break;

      case 'actividades_tipo':
        // Formato condicion_valor: tipo:cantidad (ej: 'trivia:1')
        try {
          const historialAct = obtenerHistorial(usuarioId, 1000);
          const partes = logro.condicion_valor.toString().split(':');
          const tipo = partes[0];
          const cantidad = parseInt(partes[1]) || 1;
          const count = historialAct.filter(h => h.tipo_actividad === tipo).length;
          desbloquear = count >= cantidad;
        } catch (e) {
          desbloquear = false;
        }
        break;

      case 'continentes_visitados': {
        const progreso = obtenerTodoProgreso(usuarioId);
        desbloquear = progreso.length >= logro.condicion_valor;
        break;
      }

      case 'porcentaje_aciertos': {
        const historial = obtenerHistorial(usuarioId, 1000);
        const totalCorrectas = historial.reduce((sum, h) => sum + h.respuestas_correctas, 0);
        const totalRespuestas = historial.reduce((sum, h) => sum + h.respuestas_totales, 0);
        const porcentaje = totalRespuestas > 0 ? (totalCorrectas / totalRespuestas) * 100 : 0;
        desbloquear = porcentaje >= logro.condicion_valor;
        break;
      }
      
      case 'racha_diaria': {
        // Verificar actividad en días consecutivos
        const historial = obtenerHistorialCompleto(usuarioId);
        if (historial.length === 0) break;
        
        const fechasUnicas = [...new Set(historial.map(h => 
          new Date(h.fecha).toISOString().split('T')[0]
        ))].sort().reverse();
        
        let racha = 1;
        for (let i = 1; i < fechasUnicas.length; i++) {
          const diff = (new Date(fechasUnicas[i - 1]) - new Date(fechasUnicas[i])) / (1000 * 60 * 60 * 24);
          if (diff === 1) {
            racha++;
          } else {
            break;
          }
        }
        desbloquear = racha >= logro.condicion_valor;
        break;
      }

      case 'siempre':
        desbloquear = true;
        break;
    }

    if (desbloquear) {
      desbloquearLogro(usuarioId, logro.id);
      logrosDesbloqueados.push(logro);
    }
  }

  return logrosDesbloqueados;
}

/**
 * Obtiene todos los logros con su estado para un usuario
 */
function obtenerLogrosConEstado(usuarioId) {
  const logros = obtenerTodosLosLogros();
  const logrosUsuario = obtenerLogrosUsuario(usuarioId);
  const idsDesbloqueados = new Set(logrosUsuario.map(l => l.id));

  return logros.map(logro => ({
    ...logro,
    desbloqueado: idsDesbloqueados.has(logro.id),
    fechaDesbloqueado: logrosUsuario.find(l => l.id === logro.id)?.fecha_desbloqueado || null
  }));
}

/**
 * Obtiene las categorías de logros
 */
function obtenerCategoriasLogros() {
  return [
    { id: 'progreso', nombre: 'Progreso', icono: 'grafico' },
    { id: 'actividades', nombre: 'Actividades', icono: 'actividad' },
    { id: 'habilidad', nombre: 'Habilidad', icono: 'diana' },
    { id: 'social', nombre: 'Social', icono: 'usuarios' },
    { id: 'especial', nombre: 'Especial', icono: 'estrella' }
  ];
}

module.exports = {
  verificarYDesbloquearLogros,
  obtenerLogrosConEstado,
  obtenerCategoriasLogros
};
