// Rutas de Sopa de Letras - Mundo Kids
const express = require('express');
const router = express.Router();
const { generarSopaLetras, obtenerTemas, obtenerNiveles, obtenerNivelPorId, generarSopaPorNivel } = require('../helpers/sopa-letras');
const { obtenerContinentes } = require('../data/continentes');
const { registrarActividad, actualizarPuntosYNivel } = require('../database/db');
const { verificarYDesbloquearLogros } = require('../helpers/logros');
const { enriquecerConDesbloqueo, estaDesbloqueado, marcarCompletado, PROGRESION } = require('../helpers/desbloqueos');
const { calcularNivel, multiplicadorDificultad } = require('../helpers/niveles');
const { estrellasSopaLetras } = require('../helpers/estrellas');

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
  const niveles = obtenerNiveles();
  const continentes = obtenerContinentes().map(c => ({
    id: c.id,
    nombre: c.nombre,
    emoji: c.emoji,
    color: c.color
  }));
  const completados = req.session.progreso?.nivelesCompletados;
  const nivelesDesbloqueo = enriquecerConDesbloqueo('sopa', niveles, completados);

  res.render('sopa-letras', {
    temas,
    niveles: nivelesDesbloqueo,
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
  const nivelId = req.query.nivel || 'facil';
  const modo = req.query.modo || 'libre';

  // Verificar desbloqueo del nivel
  const completados = req.session.progreso?.nivelesCompletados;
  if (!estaDesbloqueado('sopa', nivelId, completados)) {
    return res.redirect('/sopa-letras');
  }

  const nivel = obtenerNivelPorId(nivelId);
  const juego = generarSopaPorNivel(temaId, nivelId);
  const temas = obtenerTemas();
  const temaSeleccionado = temas.find(t => t.id === temaId) || temas[0];

  const tiempoLimite = modo === 'contrarreloj' ? nivel.tiempoSegundos : null;

  // Guardar en sesión para verificar respuestas
  req.session.sopaLetras = {
    palabras: juego.palabras,
    posiciones: juego.posiciones,
    nivelId: nivelId,
    tema: temaId,
    modo: modo,
    totalXpAcumulado: 0
  };

  res.render('sopa-letras', {
    temas,
    juego: {
      grid: juego.grid,
      palabras: juego.palabras,
      tamano: nivel.tamano,
      nivel: nivel,
      tema: temaSeleccionado,
      modo,
      tiempoLimite
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
      
      // Sumar puntos en el progreso (multiplicados por dificultad)
      const mult = multiplicadorDificultad(juegoGuardado.nivelId);
      const puntosPalabra = Math.round(5 * mult);
      juegoGuardado.totalXpAcumulado += puntosPalabra;
      if (req.session.progreso) {
        req.session.progreso.puntosTotal += puntosPalabra;
        const nivelAnterior = req.session.progreso.nivel;
        const nuevoNivel = calcularNivel(req.session.progreso.puntosTotal);
        if (nuevoNivel > nivelAnterior) {
          req.session.progreso.nivel = nuevoNivel;
        }
      }
    }
  }

  const juegoCompletado = esCorrecta && (req.session.palabrasEncontradas?.length || 0) >= juegoGuardado.palabras.length;

  // Registrar nivel completado con estrellas y score
  var siguienteNivel = null;
  var estrellas = 0;
  if (juegoCompletado && juegoGuardado.nivelId) {
    // Batch: una sola llamada a BD al completar
    if (req.session.usuarioId && juegoGuardado.totalXpAcumulado > 0) {
      registrarActividad({
        usuarioId: req.session.usuarioId,
        tipoActividad: 'sopa_letras',
        puntajeObtenido: juegoGuardado.totalXpAcumulado,
        respuestasCorrectas: juegoGuardado.palabras.length,
        respuestasTotales: juegoGuardado.palabras.length,
        tiempoSegundos: null
      });
      actualizarPuntosYNivel(req.session.usuarioId, juegoGuardado.totalXpAcumulado);
      try { verificarYDesbloquearLogros(req.session.usuarioId); } catch (e) { console.error('Error verificando logros:', e.message); }
    }
    const mult = multiplicadorDificultad(juegoGuardado.nivelId);
    const xpPorPalabra = Math.round(5 * mult);
    const score = juegoGuardado.palabras.length * xpPorPalabra;
    estrellas = estrellasSopaLetras(
      juegoGuardado.palabras.length,
      req.session.palabrasEncontradas?.length || 0,
      null,
      juegoGuardado.modo === 'contrarreloj' ? (obtenerNivelPorId(juegoGuardado.nivelId)?.tiempoSegundos) : null
    );
    req.session.progreso.nivelesCompletados = marcarCompletado('sopa', juegoGuardado.nivelId, req.session.progreso.nivelesCompletados, score, estrellas);
    if (req.session.usuarioId) {
      const { guardarNivelesCompletados } = require('../database/db');
      guardarNivelesCompletados(req.session.usuarioId, req.session.progreso.nivelesCompletados);
    }
    // Calcular siguiente nivel
    var progresion = PROGRESION.sopa;
    var idx = progresion.indexOf(juegoGuardado.nivelId);
    if (idx >= 0 && idx < progresion.length - 1) {
      siguienteNivel = progresion[idx + 1];
    }
  }

  res.json({
    correcta: esCorrecta,
    puntosGanados: esCorrecta ? Math.round(5 * multiplicadorDificultad(juegoGuardado.nivelId)) : 0,
    totalPalabras: juegoGuardado.palabras.length,
    palabrasEncontradas: req.session.palabrasEncontradas?.length || 0,
    juegoCompletado,
    siguienteNivel,
    estrellas
  });
});

module.exports = router;
