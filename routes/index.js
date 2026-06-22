// Rutas principales de Mundo Kids
const express = require('express');
const router = express.Router();
const { obtenerContinentes, obtenerContinentePorId } = require('../data/continentes');
const { obtenerPreguntasBanderas, obtenerPreguntaAleatoria, obtenerPreguntaPorId } = require('../data/banderas');
const { mezclarArray, mezclarOpciones } = require('../helpers/aleatorizacion');
const { calcularNivel } = require('../helpers/niveles');
const { 
  actualizarProgresoContinente, 
  actualizarPuntosYNivel,
  obtenerTodoProgreso,
  registrarActividad,
  obtenerPreguntasPersonalizadas,
  obtenerRanking,
  obtenerPosicionUsuario,
  obtenerTotalAlumnosRanking,
  buscarUsuarioPorId,
  contarLogrosDesbloqueados,
  contarLogrosTotales
} = require('../database/db');
const { verificarSesion: verificarSesionBD } = require('../middleware/auth');
const { verificarYDesbloquearLogros } = require('../helpers/logros');



/**
 * Middleware para verificar sesión
 * Soporta tanto sesiones de BD (autenticación real) como sesiones anónimas (quick play)
 */
function verificarSesion(req, res, next) {
  // Si tiene sesión de BD, usar ese middleware
  if (req.session.usuarioId) {
    return verificarSesionBD(req, res, next);
  }
  
  // Fallback: sesión anónima (quick play sin registro)
  if (!req.session.nombreUsuario) {
    return res.redirect('/');
  }
  
  res.locals.nombreUsuario = req.session.nombreUsuario;
  res.locals.genero = req.session.genero || 'masculino';
  res.locals.progreso = req.session.progreso || { nivel: 1, puntosTotal: 0 };
  res.locals.sesionAnonima = true;
  next();
}

/**
 * GET / - Pantalla de Bienvenida
 * Si ya hay sesión activa, redirige al menú
 */
router.get('/', (req, res) => {
  if (req.session.usuarioId) {
    return res.redirect('/menu');
  }
  res.redirect('/auth/login');
});

/**
 * POST /menu - Crear sesión anónima (quick play)
 * Valida el nombre y género, crea la sesión en memoria, redirige al menú
 */
router.post('/menu', (req, res) => {
  const { nombre, genero } = req.body;
  
  if (!nombre || !nombre.trim()) {
    return res.redirect('/');
  }
  
  if (!genero || (genero !== 'masculino' && genero !== 'femenino')) {
    return res.redirect('/');
  }
  
  req.session.nombreUsuario = nombre.trim();
  req.session.genero = genero;
  req.session.esAnonimo = true;
  
  req.session.progreso = {
    nivel: 1,
    puntosTotal: 0,
    continentesVisitados: [],
    retosCompletados: [],
    nivelesCompletados: {},
    fechaRegistro: new Date().toISOString()
  };
  
  res.redirect('/menu');
});

/**
 * GET /menu - Menú Principal
 * Muestra las opciones de juego disponibles (requiere sesión)
 */
router.get('/menu', verificarSesion, (req, res) => {
  // Si el usuario está autenticado en BD, cargar progreso real
  if (req.session.usuarioId) {
    const progresoContinentes = obtenerTodoProgreso(req.session.usuarioId);
    res.locals.progresoContinentes = progresoContinentes;
  }
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
 * GET /continente/:id - Vista de detalle de un continente
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
  
  // Contar preguntas personalizadas del profesor para este continente
  let totalPreguntasReto = continente.preguntas ? continente.preguntas.length : 0;
  if (req.session.usuarioId) {
    try {
      const dbPreguntas = obtenerPreguntasPersonalizadas(['reto', 'continente'], req.params.id);
      if (dbPreguntas && dbPreguntas.length > 0) {
        totalPreguntasReto += dbPreguntas.length;
      }
    } catch (e) {
      console.error('Error contando preguntas personalizadas:', e.message);
    }
  }
  
  // Seleccionar un dato curioso aleatorio
  const datosCuriososArray = continente.datosCuriosos;
  const datoCurioso = Array.isArray(datosCuriososArray)
    ? datosCuriososArray[Math.floor(Math.random() * datosCuriososArray.length)]
    : datosCuriososArray;
  
  res.render('continente', { continente, datoCurioso, totalPreguntasReto });
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
  
  // Mezclar preguntas si es la primera visita al reto
  if (!req.session.preguntasMezcladas) {
    req.session.preguntasMezcladas = {};
  }
  
  const claveReto = `reto-${req.params.id}`;
  
  // Detectar inicio fresco: cuando se accede SIN ?pregunta= (desde "Acepta el Reto")
  // En ese caso, re-barajar para variar el orden cada intento.
  // Cuando se navega con ?pregunta=N (desde resultado-reto), usar el orden ya cacheado.
  const esInicioFresco = req.query.pregunta === undefined;
  
  if (esInicioFresco || !req.session.preguntasMezcladas[claveReto]) {
    // Combinar preguntas del continente con preguntas personalizadas del profesor
    let todasLasPreguntas = [...continente.preguntas];
    
    // Agregar preguntas personalizadas del profesor (si existen en BD)
    if (req.session.usuarioId) {
      try {
        const preguntasPersonalizadas = obtenerPreguntasPersonalizadas(['reto', 'continente'], req.params.id);
        if (preguntasPersonalizadas && preguntasPersonalizadas.length > 0) {
          const preguntasMapeadas = preguntasPersonalizadas.map(p => ({
            id: `personalizada-${p.id}`,
            pregunta: p.pregunta,
            opciones: typeof p.opciones === 'string' ? JSON.parse(p.opciones) : p.opciones,
            respuestaCorrecta: p.respuesta_correcta,
            puntos: p.puntos || 10
          }));
          todasLasPreguntas = [...todasLasPreguntas, ...preguntasMapeadas];
        }
      } catch (e) {
        console.error('Error cargando preguntas personalizadas:', e.message);
      }
    }
    
    // Mezclar todas las preguntas (sin límite — se muestran todas)
    const preguntasMezcladas = mezclarArray(todasLasPreguntas);
    const subconjunto = preguntasMezcladas;
    
    // Mezclar opciones de cada pregunta y guardar nuevo índice correcto
    const preguntasConOpcionesMezcladas = subconjunto.map(p => {
      const { opciones, nuevoIndiceCorrecto } = mezclarOpciones(p.opciones, p.respuestaCorrecta);
      return {
        ...p,
        opciones,
        respuestaCorrecta: nuevoIndiceCorrecto
      };
    });
    req.session.preguntasMezcladas[claveReto] = preguntasConOpcionesMezcladas;
  }
  
  const preguntasActuales = req.session.preguntasMezcladas[claveReto];
  
  // Obtener índice de pregunta actual (por defecto 0)
  const preguntaActual = parseInt(req.query.pregunta) || 0;
  
  // Si el índice está fuera de rango, redirigir a la primera pregunta
  if (preguntaActual < 0 || preguntaActual >= preguntasActuales.length) {
    return res.redirect(`/reto/${req.params.id}?pregunta=0`);
  }
  
  const pregunta = preguntasActuales[preguntaActual];
  
  res.render('reto', {
    continente,
    pregunta,
    preguntaActual,
    totalPreguntas: preguntasActuales.length
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
  
  // Obtener preguntas mezcladas de la sesión
  const preguntasActuales = req.session.preguntasMezcladas?.[`reto-${req.params.id}`] || continente.preguntas;
  
  // Validar que la pregunta existe (usar preguntasActuales que incluye personalizadas)
  if (preguntaIndex < 0 || preguntaIndex >= preguntasActuales.length) {
    return res.redirect(`/reto/${req.params.id}`);
  }
  const pregunta = preguntasActuales[preguntaIndex];
  
  // Verificar si la respuesta es correcta
  const esCorrecta = respuestaUsuario === pregunta.respuestaCorrecta;
  let puntosGanados = 0;
  let subisteNivel = false;
  
  // Si es correcta y no ha sido respondida antes, dar puntos
  if (esCorrecta && !req.session.progreso.retosCompletados.includes(preguntaId)) {
    puntosGanados = pregunta.puntos;
    req.session.progreso.puntosTotal += puntosGanados;
    req.session.progreso.retosCompletados.push(preguntaId);
    
    // Sistema de niveles
    const nivelAnterior = req.session.progreso.nivel;
    const nuevoNivel = calcularNivel(req.session.progreso.puntosTotal);
    
    if (nuevoNivel > nivelAnterior) {
      req.session.progreso.nivel = nuevoNivel;
      subisteNivel = true;
    }
  }
  
  // Registrar actividad en BD si el usuario está autenticado
  if (req.session.usuarioId) {
    registrarActividad({
      usuarioId: req.session.usuarioId,
      tipoActividad: 'reto',
      puntajeObtenido: puntosGanados,
      respuestasCorrectas: esCorrecta ? 1 : 0,
      respuestasTotales: 1,
      tiempoSegundos: parseInt(req.body.tiempo) || null
    });
    
    // Persistir puntos y nivel en BD
    if (puntosGanados > 0) {
      actualizarPuntosYNivel(req.session.usuarioId, puntosGanados);
      actualizarProgresoContinente(req.session.usuarioId, req.params.id, puntosGanados);
    }
    
    // Verificar logros después de la actividad
    try {
      verificarYDesbloquearLogros(req.session.usuarioId);
    } catch (e) {
      console.error('Error verificando logros:', e.message);
    }
  }
  
  const hayMasPreguntas = preguntaIndex + 1 < preguntasActuales.length;
  
  // Si se completaron todas las preguntas del reto, limpiar el cache para que
  // la próxima vez que se acepte el reto se genere un nuevo subconjunto aleatorio.
  if (!hayMasPreguntas && req.session.preguntasMezcladas) {
    delete req.session.preguntasMezcladas[`reto-${req.params.id}`];
  }
  
  res.render('resultado-reto', {
    continente,
    esCorrecta,
    puntosGanados,
    respuestaCorrecta: pregunta.opciones[pregunta.respuestaCorrecta],
    hayMasPreguntas,
    siguientePregunta: preguntaIndex + 1,
    subisteNivel
  });
});

/**
 * GET /trivia-banderas - Trivia de Banderas
 * Muestra preguntas aleatorias sobre banderas de países (requiere sesión)
 */
router.get('/trivia-banderas', verificarSesion, (req, res) => {
  const modo = req.query.modo || null;

  const totalBanderas = obtenerPreguntasBanderas().length;

  if (!modo) {
    return res.render('trivia-banderas', {
      pregunta: null,
      preguntasRespondidas: 0,
      totalPreguntas: totalBanderas,
      modo: null,
      modoJuego: null,
      tiempoLimite: null
    });
  }

  // Inicializar array de preguntas respondidas si no existe
  if (!req.session.banderasRespondidas) {
    req.session.banderasRespondidas = [];
  }
  
  // Si viene de timeout (?pendiente=ID), forzar esa pregunta
  let pregunta = null;
  if (req.query.pendiente) {
    pregunta = obtenerPreguntaPorId(req.query.pendiente);
    if (!pregunta && req.session.banderasPersonalizadas) {
      pregunta = req.session.banderasPersonalizadas.find(p => p.id === req.query.pendiente);
    }
  }
  
  // Si hay una pregunta pendiente en sesión (respondida incorrectamente), forzarla
  if (!pregunta && req.session.triviaPreguntaPendiente) {
    pregunta = obtenerPreguntaPorId(req.session.triviaPreguntaPendiente);
    if (!pregunta && req.session.banderasPersonalizadas) {
      pregunta = req.session.banderasPersonalizadas.find(p => p.id === req.session.triviaPreguntaPendiente);
    }
    delete req.session.triviaPreguntaPendiente;
  }
  
  // Si no hay pendiente, obtener pregunta aleatoria
  if (!pregunta) {
    pregunta = obtenerPreguntaAleatoria(req.session.banderasRespondidas);
  }
  
  // Agregar preguntas personalizadas de banderas (del profesor) si existen
  if (!req.session.banderasPersonalizadas && req.session.usuarioId) {
    try {
      const banderasPersonalizadas = obtenerPreguntasPersonalizadas('banderas');
      if (banderasPersonalizadas && banderasPersonalizadas.length > 0) {
        const mapeadas = banderasPersonalizadas.map(p => ({
          id: `personalizada-bandera-${p.id}`,
          descripcion: p.pregunta,
          pais: (typeof p.opciones === 'string' ? JSON.parse(p.opciones) : p.opciones)[p.respuesta_correcta],
          opciones: typeof p.opciones === 'string' ? JSON.parse(p.opciones) : p.opciones,
          respuestaCorrecta: p.respuesta_correcta,
          puntos: p.puntos || 15,
          continente: p.continente_id || 'global'
        }));
        req.session.banderasPersonalizadas = mapeadas;
      }
    } catch (e) {
      console.error('Error cargando banderas personalizadas:', e.message);
    }
  }
  
  // Si hay preguntas personalizadas y no hay pendiente, combinarlas para selección aleatoria
  if (!pregunta && req.session.banderasPersonalizadas && req.session.banderasPersonalizadas.length > 0) {
    const todasBanderas = [...require('../data/banderas').obtenerPreguntasBanderas(), ...req.session.banderasPersonalizadas];
    const disponibles = todasBanderas.filter(p => !req.session.banderasRespondidas.includes(p.id));
    if (disponibles.length > 0) {
      pregunta = disponibles[Math.floor(Math.random() * disponibles.length)];
    }
  }
  
  if (pregunta) {
    // Mezclar opciones para que la respuesta no esté siempre en el mismo índice
    const { opciones, nuevoIndiceCorrecto } = mezclarOpciones(pregunta.opciones, pregunta.respuestaCorrecta);
    // Guardar el índice correcto mezclado en sesión para validación POST
    if (!req.session.triviaRespuestas) req.session.triviaRespuestas = {};
    req.session.triviaRespuestas[pregunta.id] = nuevoIndiceCorrecto;
    pregunta = {
      ...pregunta,
      opciones,
      respuestaCorrecta: nuevoIndiceCorrecto
    };
  }
  
  res.render('trivia-banderas', {
    pregunta,
    totalPreguntas: totalBanderas,
    preguntasRespondidas: req.session.banderasRespondidas.length,
    modo: 'juego',
    modoJuego: modo,
    tiempoLimite: modo === 'contrarreloj' ? 30 : null
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
  
  // Buscar la pregunta (puede ser de las originales o personalizadas)
  let preguntaReal = pregunta;
  if (!preguntaReal && preguntaId && preguntaId.startsWith('personalizada-bandera-')) {
    // Buscar en las preguntas personalizadas de la sesión
    const personalizadas = req.session.banderasPersonalizadas || [];
    preguntaReal = personalizadas.find(p => p.id === preguntaId);
  }
  
  if (!preguntaReal) {
    return res.redirect('/trivia-banderas');
  }
  
  // Verificar si la respuesta es correcta usando el índice mezclado guardado en sesión
  const indiceCorrectoMezclado = (req.session.triviaRespuestas || {})[preguntaId];
  const esCorrecta = typeof indiceCorrectoMezclado !== 'undefined' && respuestaUsuario === indiceCorrectoMezclado;
  // Limpiar la mezcla después de validar
  if (req.session.triviaRespuestas) {
    delete req.session.triviaRespuestas[preguntaId];
  }
  let puntosGanados = 0;
  let subisteNivel = false;
  
  // Inicializar array si no existe
  if (!req.session.banderasRespondidas) {
    req.session.banderasRespondidas = [];
  }
  
  if (esCorrecta) {
    // Correcta: marcar como respondida y dar puntos + recalcular nivel
    if (!req.session.banderasRespondidas.includes(preguntaId)) {
      req.session.banderasRespondidas.push(preguntaId);
      puntosGanados = preguntaReal.puntos;
      req.session.progreso.puntosTotal += puntosGanados;
      // Recalcular nivel con la curva unificada (lenta)
      const nivelAnterior = req.session.progreso.nivel;
      const nuevoNivel = calcularNivel(req.session.progreso.puntosTotal);
      if (nuevoNivel > nivelAnterior) {
        req.session.progreso.nivel = nuevoNivel;
        subisteNivel = true;
      }
    }
    delete req.session.triviaPreguntaPendiente;
  } else {
    // Incorrecta: guardar como pendiente para reintentar
    req.session.triviaPreguntaPendiente = preguntaId;
  }
  
  // Registrar actividad en BD si el usuario está autenticado
  if (req.session.usuarioId) {
    registrarActividad({
      usuarioId: req.session.usuarioId,
      tipoActividad: 'trivia',
      puntajeObtenido: puntosGanados,
      respuestasCorrectas: esCorrecta ? 1 : 0,
      respuestasTotales: 1,
      tiempoSegundos: parseInt(req.body.tiempo) || null
    });
    
    // Persistir puntos y nivel en BD (recalcula nivel con curva unificada)
    if (puntosGanados > 0) {
      actualizarPuntosYNivel(req.session.usuarioId, puntosGanados);
    }
    
    // Verificar logros después de la actividad
    try {
      verificarYDesbloquearLogros(req.session.usuarioId);
    } catch (e) {
      console.error('Error verificando logros:', e.message);
    }
  }
  
  // Determinar si hay más preguntas
  const totalBanderas = obtenerPreguntasBanderas().length;
  const hayMasPreguntas = req.session.banderasRespondidas.length < totalBanderas;
  const modoJuego = req.body.modoJuego || 'libre';

  res.render('resultado-trivia', {
    esCorrecta,
    puntosGanados,
    paisCorrecto: preguntaReal.pais,
    hayMasPreguntas,
    totalPreguntas: totalBanderas,
    subisteNivel,
    modoJuego
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

/**
 * GET /reto/:id/reiniciar - Reiniciar orden de preguntas de un reto
 */
router.get('/reto/:id/reiniciar', verificarSesion, (req, res) => {
  if (req.session.preguntasMezcladas) {
    delete req.session.preguntasMezcladas[`reto-${req.params.id}`];
  }
  res.redirect(`/reto/${req.params.id}?pregunta=0`);
});

/**
 * GET /clasificacion - Tabla de clasificación
 */
router.get('/clasificacion', verificarSesion, (req, res) => {
  // Solo usuarios autenticados en BD pueden ver el ranking
  if (!req.session.usuarioId) {
    return res.redirect('/menu');
  }

  const pagina = parseInt(req.query.pagina) || 1;
  const ranking = obtenerRanking(50, pagina);
  const posicionUsuario = obtenerPosicionUsuario(req.session.usuarioId);
  const totalAlumnos = obtenerTotalAlumnosRanking();

  res.render('clasificacion', {
    ranking,
    posicionUsuario,
    totalAlumnos
  });
});

/**
 * GET /perfil - Perfil del alumno
 */
router.get('/perfil', verificarSesion, (req, res) => {
  // Solo usuarios autenticados en BD pueden ver el perfil
  if (!req.session.usuarioId) {
    return res.redirect('/menu');
  }

  const alumno = buscarUsuarioPorId(req.session.usuarioId);
  if (!alumno) {
    return res.redirect('/menu');
  }

  const historial = require('../database/db').obtenerHistorialCompleto(req.session.usuarioId);
  const progreso = require('../database/db').obtenerTodoProgreso(req.session.usuarioId);
  const logrosRecientes = require('../database/db').obtenerLogrosUsuario(req.session.usuarioId);
  const logrosDesbloqueados = contarLogrosDesbloqueados(req.session.usuarioId);
  const logrosTotales = contarLogrosTotales();

  // Obtener continentes para mostrar nombres
  const { obtenerContinentes } = require('../data/continentes');
  const continentes = obtenerContinentes();

  // Progreso con nombres de continentes
  const progresoConNombres = progreso.map(p => {
    const continente = continentes.find(c => c.id === p.continente_id);
    return {
      ...p,
      nombreContinente: continente ? continente.nombre : p.continente_id,
      svgIconContinente: continente ? continente.svgIcon : 'mundo'
    };
  });

  // Estadísticas
  const totalActividades = historial.length;
  const totalCorrectas = historial.reduce((sum, h) => sum + h.respuestas_correctas, 0);
  const totalRespuestas = historial.reduce((sum, h) => sum + h.respuestas_totales, 0);
  const porcentajeAciertos = totalRespuestas > 0
    ? Math.round((totalCorrectas / totalRespuestas) * 100)
    : 0;

  // Actividades por tipo
  const actividadesPorTipo = {};
  for (const h of historial) {
    if (!actividadesPorTipo[h.tipo_actividad]) {
      actividadesPorTipo[h.tipo_actividad] = 0;
    }
    actividadesPorTipo[h.tipo_actividad]++;
  }

  res.render('perfil', {
    alumno,
    historial,
    progreso: progresoConNombres,
    logrosRecientes,
    logrosDesbloqueados,
    logrosTotales,
    totalActividades,
    totalCorrectas,
    totalRespuestas,
    porcentajeAciertos,
    actividadesPorTipo
  });
});

/**
 * GET /globo-test - Página de prueba para el globo 3D mínimo
 * Útil para aislar problemas de renderizado del globo terráqueo
 */
router.get('/globo-test', (req, res) => {
  res.render('globo-test');
});

/**
 * GET /logros - Galería de logros/insignias
 */
router.get('/logros', verificarSesion, (req, res) => {
  // Solo usuarios autenticados en BD pueden ver logros
  if (!req.session.usuarioId) {
    return res.redirect('/menu');
  }

  const { obtenerLogrosConEstado, obtenerCategoriasLogros } = require('../helpers/logros');
  const logros = obtenerLogrosConEstado(req.session.usuarioId);
  const logrosDesbloqueados = contarLogrosDesbloqueados(req.session.usuarioId);
  const logrosTotales = contarLogrosTotales();

  res.render('logros', {
    logros,
    logrosDesbloqueados,
    logrosTotales
  });
});

module.exports = router;
