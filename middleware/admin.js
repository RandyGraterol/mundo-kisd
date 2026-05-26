// Middleware de Admin - Mundo Kids
// Verifica que el usuario autenticado tenga rol de profesor

/**
 * Middleware: Verifica que el usuario es profesor
 * Redirige al menú si no tiene permisos de admin
 */
function verificarAdmin(req, res, next) {
  // Verificar que hay sesión activa
  if (!req.session.usuarioId) {
    return res.redirect('/auth/login');
  }

  // Si el middleware de auth ya cargó el usuario, usarlo
  if (req.usuario && req.usuario.rol === 'profesor') {
    return next();
  }

  // Si no, cargar usuario de BD
  const { buscarUsuarioPorId } = require('../database/db');
  const usuario = buscarUsuarioPorId(req.session.usuarioId);

  if (!usuario || usuario.rol !== 'profesor') {
    // No tiene permisos de admin
    return res.redirect('/menu');
  }

  // Hacer datos del usuario disponibles
  res.locals.usuario = usuario;
  res.locals.nombreUsuario = usuario.nombre_completo;
  res.locals.genero = usuario.genero;
  res.locals.esAdmin = true;
  req.usuario = usuario;
  next();
}

module.exports = { verificarAdmin };
