// Middleware de Autenticación - Mundo Kids
// Verifica sesión contra la base de datos

const { buscarUsuarioPorId, actualizarUltimoAcceso, obtenerTodoProgreso } = require('../database/db');

/**
 * Middleware: Verifica que el usuario tiene sesión activa en la BD
 * Redirige a login si no hay sesión
 */
function verificarSesion(req, res, next) {
  if (!req.session.usuarioId) {
    return res.redirect('/auth/login');
  }
  
  // Verificar que el usuario existe en la BD
  const usuario = buscarUsuarioPorId(req.session.usuarioId);
  
  if (!usuario) {
    // Sesión inválida, limpiar y redirigir
    req.session.destroy();
    return res.redirect('/auth/login');
  }
  
  // Actualizar último acceso
  actualizarUltimoAcceso(usuario.id);
  
  // Hacer datos del usuario disponibles en todas las vistas
  res.locals.nombreUsuario = usuario.nombre_completo;
  res.locals.genero = usuario.genero;
  res.locals.usuario = usuario;
  
  // Obtener progreso de continentes para calcular continentes visitados
  let continentesVisitados = [];
  let retosCompletados = [];
  try {
    const progresoContinentes = obtenerTodoProgreso(usuario.id);
    continentesVisitados = progresoContinentes.map(p => p.continente_id).filter(Boolean);
    retosCompletados = progresoContinentes
      .filter(p => (p.retos_completados || 0) > 0)
      .map(p => p.continente_id);
  } catch (e) {
    // Si falla la consulta, usar arrays vacíos
  }
  
  // [FIX] Inicializar req.session.progreso para que los route handlers
  // puedan acceder a continentesVisitados, retosCompletados, etc.
  // Sin esto, rutas como GET /continente/:id fallan con
  // "Cannot read properties of undefined (reading 'continentesVisitados')"
  if (!req.session.progreso) {
    req.session.progreso = {
      nivel: usuario.nivel,
      puntosTotal: usuario.puntos_total,
      continentesVisitados,
      retosCompletados,
      fechaRegistro: usuario.fecha_registro || new Date().toISOString()
    };
  }
  
  res.locals.progreso = req.session.progreso;
  
  req.usuario = usuario;
  next();
}

/**
 * Middleware: Redirige al menú si ya hay sesión activa
 * (para páginas de login/registro)
 */
function redirigirSiSesionActiva(req, res, next) {
  if (req.session.usuarioId) {
    return res.redirect('/menu');
  }
  next();
}

module.exports = { verificarSesion, redirigirSiSesionActiva };
