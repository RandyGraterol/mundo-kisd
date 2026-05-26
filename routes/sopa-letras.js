// Rutas de Sopa de Letras - Mundo Kids
const express = require('express');
const router = express.Router();
const { generarSopaLetras, obtenerTemas } = require('../helpers/sopa-letras');
const { obtenerContinentes } = require('../data/continentes');
const { registrarActividad, actualizarPuntosYNivel } = require('../database/db');

// Middleware de verificación de sesión
function verificarSesion(req, res, next) {
  if (req.session.usuarioId || req.session.nombreUsuario) {
    res.locals.progreso = req.session.progreso || { nivel: 1, puntosTotal: 0, continentesVisitados: [], retosCompletados: [] };
    res.locals.nombreUsuario = req.session.nombreUsuario || (req.usuario && req.usuario.nombre_completo) || 'Estudiante';
    res.locals.genero = req.session.genero || 'masculino';
    return next();
  }
  res.redirect('/');
}

/**
 * GET /sopa-letras - Página principal de sopa de letras
 */
router.get('/', verificarSesion, (req, res) => {
  const temas = obtenerTemas();
  const continentes = obtenerContinentes().map(c => ({
    id: c.id,
    nombre: c.nombre,
    emoji: c.emoji,
    color: c.color
  }));

  res.render('sopa-letras', {
    temas,
    continentes,
    juego: null,
    mensaje: null
  });
});

/**
 * GET /sopa-letras/jugar - Generar nueva sopa de letras
 */
router.get('/jugar', verificarSesion, (req, res) => {
  const temaId = req.query.tema || 'global';
  const tamano = parseInt(req.query.tamano) || 12;
  
  const juego = generarSopaLetras(tamano, temaId);
  const temas = obtenerTemas();
  const temaSeleccionado = temas.find(t => t.id === temaId) || temas[0];

  // Guardar en sesión para verificar respuestas
  req.session.sopaLetras = {
    palabras: juego.palabras,
    posiciones: juego.posiciones
  };

  res.render('sopa-letras', {
    temas,
    juego: {
      grid: juego.grid,
      palabras: juego.palabras,
      tamano,
      tema: temaSeleccionado
    },
    mensaje: null
  });
});

/**
 * POST /sopa-letras/verificar - Verificar palabras encontradas (API)
 */
router.post('/verificar', express.json(), verificarSesion, (req, res) => {
  const { palabra } = req.body;
  const juegoGuardado = req.session.sopaLetras;

  if (!juegoGuardado || !juegoGuardado.palabras) {
    return res.json({ correcta: false, error: 'Sesión de juego no encontrada' });
  }

  const palabraUpper = palabra.toUpperCase().trim();
  const esCorrecta = juegoGuardado.palabras.includes(palabraUpper);

  // Acumular puntos si la palabra es correcta
  if (esCorrecta) {
    if (!req.session.palabrasEncontradas) {
      req.session.palabrasEncontradas = [];
    }
    if (!req.session.palabrasEncontradas.includes(palabraUpper)) {
      req.session.palabrasEncontradas.push(palabraUpper);
      
      // Sumar puntos en el progreso
      if (req.session.progreso) {
        req.session.progreso.puntosTotal += 5;
        const nivelAnterior = req.session.progreso.nivel;
        const nuevoNivel = Math.floor(req.session.progreso.puntosTotal / 30) + 1;
        if (nuevoNivel > nivelAnterior) {
          req.session.progreso.nivel = nuevoNivel;
        }
      }
      
      // Registrar actividad en BD si el usuario está autenticado
      if (req.session.usuarioId) {
        registrarActividad({
          usuarioId: req.session.usuarioId,
          tipoActividad: 'sopa_letras',
          puntajeObtenido: 5,
          respuestasCorrectas: 1,
          respuestasTotales: juegoGuardado.palabras.length,
          tiempoSegundos: null
        });
        actualizarPuntosYNivel(req.session.usuarioId, 5);
      }
    }
  }

  const juegoCompletado = esCorrecta && (req.session.palabrasEncontradas?.length || 0) >= juegoGuardado.palabras.length;

  res.json({
    correcta: esCorrecta,
    puntosGanados: esCorrecta ? 5 : 0,
    totalPalabras: juegoGuardado.palabras.length,
    palabrasEncontradas: req.session.palabrasEncontradas?.length || 0,
    juegoCompletado
  });
});

module.exports = router;
