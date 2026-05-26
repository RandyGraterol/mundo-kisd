// Rutas de Juego de Memoria - Mundo Kids
const express = require('express');
const router = express.Router();
const { generarJuegoMemoria, obtenerTemasMemoria, obtenerNivelesMemoria, obtenerNivelPorId } = require('../helpers/memoria');
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
 * GET /memoria - Página principal del juego de memoria
 */
router.get('/', verificarSesion, (req, res) => {
  const temas = obtenerTemasMemoria();
  const niveles = obtenerNivelesMemoria();
  const continentes = obtenerContinentes().map(c => ({
    id: c.id,
    nombre: c.nombre,
    emoji: c.emoji,
    color: c.color
  }));

  res.render('memoria', {
    temas,
    niveles,
    continentes,
    juego: null
  });
});

/**
 * GET /memoria/jugar - Iniciar nueva partida
 */
router.get('/jugar', verificarSesion, (req, res) => {
  const temaId = req.query.tema || 'global';
  const nivelId = req.query.nivel || 'medio';
  const modo = req.query.modo || 'normal';

  const juego = generarJuegoMemoria(temaId, nivelId, modo);
  const temas = obtenerTemasMemoria();
  const niveles = obtenerNivelesMemoria();
  const temaSeleccionado = temas.find(t => t.id === temaId) || temas[0];
  const nivelSeleccionado = obtenerNivelPorId(nivelId);

  // Guardar juego en sesión para verificación
  req.session.memoriaJuego = {
    cartas: juego.cartas,
    totalPares: juego.totalPares,
    paresEncontrados: 0,
    intentos: 0,
    modo: juego.modo,
    tiempoLimite: juego.tiempoLimite
  };

  res.render('memoria', {
    temas,
    niveles,
    juego: {
      cartas: juego.cartas.map(c => ({
        ...c,
        volteada: false,
        encontrada: false
      })),
      totalPares: juego.totalPares,
      tema: temaSeleccionado,
      nivel: nivelSeleccionado,
      modo: juego.modo,
      tiempoLimite: juego.tiempoLimite
    }
  });
});

/**
 * POST /memoria/verificar - Verificar par de cartas (API)
 */
router.post('/verificar', express.json(), verificarSesion, (req, res) => {
  const { cartaId1, cartaId2 } = req.body;
  const juegoGuardado = req.session.memoriaJuego;

  if (!juegoGuardado || !juegoGuardado.cartas) {
    return res.json({ error: 'Sesión de juego no encontrada' });
  }

  const carta1 = juegoGuardado.cartas.find(c => c.idUnico === cartaId1);
  const carta2 = juegoGuardado.cartas.find(c => c.idUnico === cartaId2);

  if (!carta1 || !carta2) {
    return res.json({ error: 'Cartas no encontradas' });
  }

  const esPar = carta1.parId === carta2.parId;
  juegoGuardado.intentos++;

  if (esPar) {
    juegoGuardado.paresEncontrados++;
    
    // Puntos por cada par encontrado
    if (req.session.progreso) {
      req.session.progreso.puntosTotal += 10;
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
        tipoActividad: 'memoria',
        puntajeObtenido: 10,
        respuestasCorrectas: 1,
        respuestasTotales: juegoGuardado.totalPares,
        tiempoSegundos: null
      });
      actualizarPuntosYNivel(req.session.usuarioId, 10);
    }
  }

  const juegoCompletado = juegoGuardado.paresEncontrados >= juegoGuardado.totalPares;

  res.json({
    esPar,
    carta1,
    carta2,
    paresEncontrados: juegoGuardado.paresEncontrados,
    totalPares: juegoGuardado.totalPares,
    intentos: juegoGuardado.intentos,
    juegoCompletado
  });
});

/**
 * GET /memoria/reiniciar - Reiniciar sesión de memoria
 */
router.get('/reiniciar', verificarSesion, (req, res) => {
  delete req.session.memoriaJuego;
  res.redirect('/memoria');
});

module.exports = router;
