// Rutas de Autenticación - Mundo Kids
// Sistema de registro, inicio de sesión y cierre de sesión

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { crearUsuario, buscarUsuarioPorNombre, actualizarUltimoAcceso, actualizarPuntosYNivel } = require('../database/db');
const { redirigirSiSesionActiva } = require('../middleware/auth');

/**
 * GET /auth/login - Formulario de inicio de sesión
 */
router.get('/login', redirigirSiSesionActiva, (req, res) => {
  res.locals.esPaginaAuth = true;
  res.render('auth/login', { error: null });
});

/**
 * POST /auth/login - Procesar inicio de sesión
 */
router.post('/login', (req, res) => {
  const { nombreUsuario, contrasena, rol } = req.body;
  
  // Validar campos requeridos
  if (!nombreUsuario || !nombreUsuario.trim()) {
    return res.render('auth/login', { error: 'Por favor ingresa tu nombre de usuario.', esPaginaAuth: true });
  }
  
  if (!contrasena || !contrasena.trim()) {
    return res.render('auth/login', { error: 'Por favor ingresa tu contraseña.', esPaginaAuth: true });
  }
  
  // Validar rol
  if (!rol || (rol !== 'alumno' && rol !== 'profesor')) {
    return res.render('auth/login', { error: 'Por favor selecciona si eres Estudiante o Profesor.', esPaginaAuth: true });
  }
  
  // Buscar usuario en la base de datos
  const usuario = buscarUsuarioPorNombre(nombreUsuario.trim());
  
  if (!usuario) {
    return res.render('auth/login', { error: 'Usuario o contraseña incorrectos.', esPaginaAuth: true });
  }
  
  // Verificar contraseña
  const contrasenaValida = bcrypt.compareSync(contrasena, usuario.contrasena_hash);
  
  if (!contrasenaValida) {
    return res.render('auth/login', { error: 'Usuario o contraseña incorrectos.', esPaginaAuth: true });
  }
  
  // Verificar que el rol coincida con el del usuario
  if (usuario.rol !== rol) {
    return res.render('auth/login', { error: 'Esta cuenta no corresponde al rol seleccionado. Verifica que elegiste correctamente entre Estudiante o Profesor.', esPaginaAuth: true });
  }
  
  // Crear sesión con regeneración para seguridad
  req.session.regenerate((err) => {
    if (err) {
      console.error('Error al regenerar sesión:', err);
      return res.redirect('/auth/login');
    }
    req.session.usuarioId = usuario.id;
    actualizarUltimoAcceso(usuario.id);
    res.redirect(usuario.rol === 'profesor' ? '/admin' : '/menu');
  });
});

/**
 * GET /auth/registro - Formulario de registro
 */
router.get('/registro', redirigirSiSesionActiva, (req, res) => {
  res.locals.esPaginaAuth = true;
  res.render('auth/registro', { error: null });
});

/**
 * POST /auth/registro - Procesar registro de nuevo usuario
 */
router.post('/registro', (req, res) => {
  const { nombreCompleto, nombreUsuario, contrasena, confirmarContrasena, genero, rol } = req.body;
  
  // Validar campos requeridos
  if (!nombreCompleto || !nombreCompleto.trim()) {
    return res.render('auth/registro', { error: 'Por favor ingresa tu nombre completo.', esPaginaAuth: true });
  }
  
  if (!nombreUsuario || !nombreUsuario.trim()) {
    return res.render('auth/registro', { error: 'Por favor ingresa un nombre de usuario.', esPaginaAuth: true });
  }
  
  if (!contrasena || contrasena.length < 4) {
    return res.render('auth/registro', { error: 'La contraseña debe tener al menos 4 caracteres.', esPaginaAuth: true });
  }
  
  if (contrasena !== confirmarContrasena) {
    return res.render('auth/registro', { error: 'Las contraseñas no coinciden.', esPaginaAuth: true });
  }
  
  if (!rol || (rol !== 'alumno' && rol !== 'profesor')) {
    return res.render('auth/registro', { error: 'Por favor selecciona un rol (Estudiante o Profesor).', esPaginaAuth: true });
  }
  
  if (!genero || (genero !== 'masculino' && genero !== 'femenino')) {
    return res.render('auth/registro', { error: 'Por favor selecciona un género.', esPaginaAuth: true });
  }
  
  // Verificar que el nombre de usuario no esté en uso
  const usuarioExistente = buscarUsuarioPorNombre(nombreUsuario.trim());
  
  if (usuarioExistente) {
    return res.render('auth/registro', { error: 'Este nombre de usuario ya está en uso. Por favor elige otro.' });
  }
  
  // Hash de contraseña
  const salt = bcrypt.genSaltSync(10);
  const contrasenaHash = bcrypt.hashSync(contrasena, salt);
  
  // Crear usuario
  try {
    const usuarioId = crearUsuario({
      nombreCompleto: nombreCompleto.trim(),
      nombreUsuario: nombreUsuario.trim(),
      contrasenaHash,
      genero,
      rol
    });
    
    // Iniciar sesión automáticamente después del registro
    req.session.usuarioId = usuarioId;
    actualizarUltimoAcceso(usuarioId);
    if (rol === 'profesor') { return res.redirect('/admin'); }
    
    // Migrar progreso de sesión anónima (quick play) a la nueva cuenta
    if (req.session.progreso) {
      try {
        if (req.session.progreso.puntosTotal > 0) {
          actualizarPuntosYNivel(usuarioId, req.session.progreso.puntosTotal);
        }
        // Registrar continentes visitados en sesión anónima como progreso inicial
        if (req.session.progreso.continentesVisitados && req.session.progreso.continentesVisitados.length > 0) {
          for (const continenteId of req.session.progreso.continentesVisitados) {
            const db = require('../database/db');
            db.actualizarProgresoContinente(usuarioId, continenteId, 0);
          }
        }
        // Migrar niveles completados de sesión anónima
        if (req.session.progreso.nivelesCompletados && Object.keys(req.session.progreso.nivelesCompletados).length > 0) {
          const { guardarNivelesCompletados } = require('../database/db');
          guardarNivelesCompletados(usuarioId, req.session.progreso.nivelesCompletados);
        }
      } catch (e) {
        console.error('Error migrando progreso anónimo:', e.message);
      }
    }
    
    res.redirect('/menu');
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return res.render('auth/registro', { error: 'Ocurrió un error al crear tu cuenta. Intenta de nuevo.', esPaginaAuth: true });
  }
});

/**
 * GET /auth/logout - Cerrar sesión
 */
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
    }
    res.redirect('/auth/login');
  });
});

module.exports = router;
