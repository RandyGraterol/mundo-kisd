// Rutas de Rompecabezas (Puzzle) - Mundo Kids
const express = require('express');
const router = express.Router();
const { generarPuzzle, obtenerTemas, obtenerTemasContinentes, obtenerDificultades, verificarPuzzleCompletado } = require('../helpers/puzzle');
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
 * GET /puzzle - Página principal del rompecabezas
 */
router.get('/', verificarSesion, (req, res) => {
  const temas = obtenerTemas();
  const temasContinentes = obtenerTemasContinentes();
  const dificultades = obtenerDificultades();
  res.render('puzzle', {
    temas,
    temasContinentes,
    dificultades,
    juego: null
  });
});

/**
 * GET /puzzle/jugar - Iniciar nuevo puzzle
 */
router.get('/jugar', verificarSesion, (req, res) => {
  const temaId = req.query.tema || 'mapa';
  const dificultadId = req.query.dificultad || 'facil';

  const dificultades = obtenerDificultades();
  const dificultad = dificultades.find(d => d.id === dificultadId) || dificultades[0];
  
  const juego = generarPuzzle(temaId, dificultad.filas, dificultad.columnas);
  const temas = obtenerTemas();
  const temasContinentes = obtenerTemasContinentes();
  const todosLosTemas = [...temas, ...temasContinentes];
  const temaSeleccionado = todosLosTemas.find(t => t.id === temaId) || temas[0];

  // Guardar en sesión
  req.session.puzzleJuego = {
    piezas: juego.piezas,
    filas: juego.filas,
    columnas: juego.columnas,
    totalPiezas: juego.totalPiezas,
    movimientos: 0
  };

  res.render('puzzle', {
    temas,
    dificultades,
    juego: {
      piezas: juego.piezas,
      filas: juego.filas,
      columnas: juego.columnas,
      totalPiezas: juego.totalPiezas,
      tema: temaSeleccionado,
      dificultad
    }
  });
});

/**
 * POST /puzzle/mover - Mover una pieza (API)
 */
router.post('/mover', express.json(), verificarSesion, (req, res) => {
  const { deIndex, aIndex } = req.body;
  const juegoGuardado = req.session.puzzleJuego;

  if (!juegoGuardado || !juegoGuardado.piezas) {
    return res.json({ error: 'Sesión de juego no encontrada' });
  }

  // Validar índices
  if (deIndex < 0 || deIndex >= juegoGuardado.piezas.length ||
      aIndex < 0 || aIndex >= juegoGuardado.piezas.length) {
    return res.json({ error: 'Índices inválidos' });
  }

  // Intercambiar piezas
  [juegoGuardado.piezas[deIndex], juegoGuardado.piezas[aIndex]] = 
  [juegoGuardado.piezas[aIndex], juegoGuardado.piezas[deIndex]];
  
  juegoGuardado.movimientos++;

  const completado = verificarPuzzleCompletado(juegoGuardado.piezas);

  // Puntos por completar el puzzle
  if (completado && req.session.progreso) {
    const puntosBase = juegoGuardado.filas * juegoGuardado.columnas * 2;
    const bonificacionMovimientos = Math.max(0, Math.floor((50 - juegoGuardado.movimientos) / 5));
    const puntosTotales = puntosBase + bonificacionMovimientos;
    
    req.session.progreso.puntosTotal += puntosTotales;
    const nivelAnterior = req.session.progreso.nivel;
    const nuevoNivel = Math.floor(req.session.progreso.puntosTotal / 30) + 1;
    if (nuevoNivel > nivelAnterior) {
      req.session.progreso.nivel = nuevoNivel;
    }
    
    // Registrar actividad en BD si el usuario está autenticado
    if (req.session.usuarioId) {
      registrarActividad({
        usuarioId: req.session.usuarioId,
        tipoActividad: 'puzzle',
        puntajeObtenido: puntosTotales,
        respuestasCorrectas: 1,
        respuestasTotales: 1,
        tiempoSegundos: null
      });
      actualizarPuntosYNivel(req.session.usuarioId, puntosTotales);
    }

    return res.json({
      piezas: juegoGuardado.piezas,
      movimientos: juegoGuardado.movimientos,
      completado: true,
      puntosGanados: puntosTotales
    });
  }

  res.json({
    piezas: juegoGuardado.piezas,
    movimientos: juegoGuardado.movimientos,
    completado: false
  });
});

module.exports = router;
