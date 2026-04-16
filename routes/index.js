// Rutas principales de Mundo Kids
const express = require('express');
const router = express.Router();
const { obtenerContinentes, obtenerContinentePorId } = require('../data/continentes');
const { obtenerPreguntaAleatoria, obtenerPreguntaPorId } = require('../data/banderas');

/**
 * Middleware para verificar que el usuario tiene sesión activa
 * Redirige a la pantalla de bienvenida si no hay sesión
 */
function verificarSesion(req, res, next) {
  if (!req.session.nombreUsuario) {
    return res.redirect('/');
  }
  // Hacer el nombre, género y progreso disponibles en todas las vistas
  res.locals.nombreUsuario = req.session.nombreUsuario;
  res.locals.genero = req.session.genero || 'masculino';
  res.locals.progreso = req.session.progreso || { nivel: 1, puntosTotal: 0 };
  next();
}

/**
 * GET / - Pantalla de Bienvenida
 * Muestra el formulario para ingresar el nombre del estudiante
 */
router.get('/', (req, res) => {
  res.render('bienvenida');
});

/**
 * POST /menu - Crear sesión con nombre de usuario y género
 * Valida el nombre y género, crea la sesión, luego redirige al menú principal
 */
router.post('/menu', (req, res) => {
  const { nombre, genero } = req.body;
  
  // Validar que el nombre no esté vacío
  if (!nombre || !nombre.trim()) {
    return res.redirect('/');
  }
  
  // Validar que el género esté seleccionado
  if (!genero || (genero !== 'masculino' && genero !== 'femenino')) {
    return res.redirect('/');
  }
  
  // Crear sesión con el nombre y género del usuario
  req.session.nombreUsuario = nombre.trim();
  req.session.genero = genero;
  
  // Inicializar progreso del estudiante
  req.session.progreso = {
    nivel: 1,
    puntosTotal: 0,
    continentesVisitados: [],
    retosCompletados: [],
    fechaRegistro: new Date().toISOString()
  };
  
  res.redirect('/menu');
});

/**
 * GET /menu - Menú Principal
 * Muestra las opciones de juego disponibles (requiere sesión)
 */
router.get('/menu', verificarSesion, (req, res) => {
  res.render('menu');
});

/**
 * GET /continentes - Selector de Continentes
 * Muestra el grid con los 6 continentes (requiere sesión)
 */
router.get('/continentes', verificarSesion, (req, res) => {
  const continentes = obtenerContinentes();
  res.render('continentes', { continentes });
});

/**
 * GET /continente/:id - Vista de Continente Individual
 * Muestra información detallada de un continente específico (requiere sesión)
 */
router.get('/continente/:id', verificarSesion, (req, res) => {
  const continente = obtenerContinentePorId(req.params.id);
  
  // Si el continente no existe, redirigir al selector
  if (!continente) {
    return res.redirect('/continentes');
  }
  
  // Registrar visita al continente si no ha sido visitado
  if (!req.session.progreso.continentesVisitados.includes(req.params.id)) {
    req.session.progreso.continentesVisitados.push(req.params.id);
  }
  
  res.render('continente', { continente });
});

/**
 * GET /reto/:id - Vista de Reto/Preguntas de un Continente
 * Muestra preguntas de opción múltiple sobre el continente (requiere sesión)
 */
router.get('/reto/:id', verificarSesion, (req, res) => {
  const continente = obtenerContinentePorId(req.params.id);
  
  // Si el continente no existe, redirigir al selector
  if (!continente) {
    return res.redirect('/continentes');
  }
  
  // Si no tiene preguntas, redirigir al continente
  if (!continente.preguntas || continente.preguntas.length === 0) {
    return res.redirect(`/continente/${req.params.id}`);
  }
  
  // Obtener índice de pregunta actual (por defecto 0)
  const preguntaActual = parseInt(req.query.pregunta) || 0;
  
  // Si el índice está fuera de rango, redirigir a la primera pregunta
  if (preguntaActual < 0 || preguntaActual >= continente.preguntas.length) {
    return res.redirect(`/reto/${req.params.id}?pregunta=0`);
  }
  
  const pregunta = continente.preguntas[preguntaActual];
  
  res.render('reto', {
    continente,
    pregunta,
    preguntaActual,
    totalPreguntas: continente.preguntas.length
  });
});

/**
 * POST /reto/:id/responder - Procesar respuesta de pregunta
 * Valida la respuesta, actualiza puntos y muestra resultado (requiere sesión)
 */
router.post('/reto/:id/responder', verificarSesion, (req, res) => {
  const continente = obtenerContinentePorId(req.params.id);
  
  // Si el continente no existe, redirigir al selector
  if (!continente) {
    return res.redirect('/continentes');
  }
  
  const preguntaIndex = parseInt(req.body.preguntaIndex);
  const respuestaUsuario = parseInt(req.body.respuesta);
  const preguntaId = req.body.preguntaId;
  
  // Validar que la pregunta existe
  if (preguntaIndex < 0 || preguntaIndex >= continente.preguntas.length) {
    return res.redirect(`/reto/${req.params.id}`);
  }
  
  const pregunta = continente.preguntas[preguntaIndex];
  
  // Verificar si la respuesta es correcta
  const esCorrecta = respuestaUsuario === pregunta.respuestaCorrecta;
  let puntosGanados = 0;
  let subisteNivel = false;
  
  // Si es correcta y no ha sido respondida antes, dar puntos
  if (esCorrecta && !req.session.progreso.retosCompletados.includes(preguntaId)) {
    puntosGanados = pregunta.puntos;
    req.session.progreso.puntosTotal += puntosGanados;
    req.session.progreso.retosCompletados.push(preguntaId);
    
    // Sistema de niveles: cada 30 puntos = 1 nivel
    const nivelAnterior = req.session.progreso.nivel;
    const nuevoNivel = Math.floor(req.session.progreso.puntosTotal / 30) + 1;
    
    if (nuevoNivel > nivelAnterior) {
      req.session.progreso.nivel = nuevoNivel;
      subisteNivel = true;
    }
  }
  
  // Determinar si hay más preguntas
  const hayMasPreguntas = preguntaIndex + 1 < continente.preguntas.length;
  const siguientePregunta = preguntaIndex + 1;
  
  res.render('resultado-reto', {
    continente,
    esCorrecta,
    puntosGanados,
    respuestaCorrecta: pregunta.opciones[pregunta.respuestaCorrecta],
    hayMasPreguntas,
    siguientePregunta,
    subisteNivel
  });
});

/**
 * GET /trivia-banderas - Trivia de Banderas
 * Muestra preguntas aleatorias sobre banderas de países (requiere sesión)
 */
router.get('/trivia-banderas', verificarSesion, (req, res) => {
  // Inicializar array de preguntas respondidas si no existe
  if (!req.session.banderasRespondidas) {
    req.session.banderasRespondidas = [];
  }
  
  // Obtener pregunta aleatoria que no haya sido respondida
  const pregunta = obtenerPreguntaAleatoria(req.session.banderasRespondidas);
  
  res.render('trivia-banderas', {
    pregunta,
    preguntasRespondidas: req.session.banderasRespondidas.length
  });
});

/**
 * POST /trivia-banderas/responder - Procesar respuesta de trivia de banderas
 * Valida la respuesta, actualiza puntos y muestra resultado (requiere sesión)
 */
router.post('/trivia-banderas/responder', verificarSesion, (req, res) => {
  const preguntaId = req.body.preguntaId;
  const respuestaUsuario = parseInt(req.body.respuesta);
  
  // Obtener la pregunta
  const pregunta = obtenerPreguntaPorId(preguntaId);
  
  if (!pregunta) {
    return res.redirect('/trivia-banderas');
  }
  
  // Verificar si la respuesta es correcta
  const esCorrecta = respuestaUsuario === pregunta.respuestaCorrecta;
  let puntosGanados = 0;
  let subisteNivel = false;
  
  // Inicializar array si no existe
  if (!req.session.banderasRespondidas) {
    req.session.banderasRespondidas = [];
  }
  
  // Si es correcta y no ha sido respondida antes, dar puntos
  if (esCorrecta && !req.session.banderasRespondidas.includes(preguntaId)) {
    puntosGanados = pregunta.puntos;
    req.session.progreso.puntosTotal += puntosGanados;
    
    // Sistema de niveles: cada 30 puntos = 1 nivel
    const nivelAnterior = req.session.progreso.nivel;
    const nuevoNivel = Math.floor(req.session.progreso.puntosTotal / 30) + 1;
    
    if (nuevoNivel > nivelAnterior) {
      req.session.progreso.nivel = nuevoNivel;
      subisteNivel = true;
    }
  }
  
  // Marcar pregunta como respondida
  if (!req.session.banderasRespondidas.includes(preguntaId)) {
    req.session.banderasRespondidas.push(preguntaId);
  }
  
  // Determinar si hay más preguntas
  const hayMasPreguntas = req.session.banderasRespondidas.length < 12;
  
  res.render('resultado-trivia', {
    esCorrecta,
    puntosGanados,
    paisCorrecto: pregunta.pais,
    hayMasPreguntas,
    subisteNivel
  });
});

/**
 * GET /salir - Cerrar Sesión
 * Destruye la sesión del usuario y redirige a la pantalla de bienvenida
 */
router.get('/salir', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
    }
    res.redirect('/');
  });
});

module.exports = router;
