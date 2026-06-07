// Rutas de Sopa de Letras - Mundo Kids
const express = require('express');
const router = express.Router();
const { generarSopaLetras, obtenerTemas, obtenerNiveles, obtenerNivelPorId, generarSopaPorNivel } = require('../helpers/sopa-letras');
const { obtenerContinentes } = require('../data/continentes');
const { registrarActividad, actualizarPuntosYNivel } = require('../database/db');
const { verificarYDesbloquearLogros } = require('../helpers/logros');
const { enriquecerConDesbloqueo, estaDesbloqueado, marcarCompletado, PROGRESION } = require('../helpers/desbloqueos');

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
    modo: modo
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
          respuestasTotales: 1,
          tiempoSegundos: null
        });
        actualizarPuntosYNivel(req.session.usuarioId, 5);
        try { verificarYDesbloquearLogros(req.session.usuarioId); } catch (e) { console.error('Error verificando logros:', e.message); }
      }
    }
  }

  const juegoCompletado = esCorrecta && (req.session.palabrasEncontradas?.length || 0) >= juegoGuardado.palabras.length;

  // Registrar nivel completado
  var siguienteNivel = null;
  if (juegoCompletado && juegoGuardado.nivelId) {
    req.session.progreso.nivelesCompletados = marcarCompletado('sopa', juegoGuardado.nivelId, req.session.progreso.nivelesCompletados);
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
    puntosGanados: esCorrecta ? 5 : 0,
    totalPalabras: juegoGuardado.palabras.length,
    palabrasEncontradas: req.session.palabrasEncontradas?.length || 0,
    juegoCompletado,
    siguienteNivel
  });
});

module.exports = router;
