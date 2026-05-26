// Rutas del Panel Administrativo - Mundo Kids
// Solo accesible para usuarios con rol 'profesor'

const express = require('express');
const router = express.Router();
const { verificarAdmin } = require('../middleware/admin');
const {
  listarAlumnos,
  buscarUsuarioPorId,
  obtenerTodoProgreso,
  obtenerHistorialCompleto,
  obtenerTodasPreguntas,
  crearPregunta,
  actualizarPregunta,
  desactivarPregunta,
  obtenerConfiguracionesTemporizador,
  guardarConfiguracionTemporizador,
  obtenerConfigSistema,
  guardarConfigSistema
} = require('../database/db');
const { obtenerContinentes } = require('../data/continentes');

// Todas las rutas admin requieren verificación de rol profesor
router.use(verificarAdmin);

// ──────────────────────────────────────────────
// Dashboard Principal
// ──────────────────────────────────────────────

/**
 * GET /admin - Dashboard principal del profesor
 */
router.get('/', (req, res) => {
  const alumnos = listarAlumnos();
  const totalAlumnos = alumnos.length;
  const totalPreguntas = obtenerTodasPreguntas().length;
  const totalPreguntasActivas = obtenerTodasPreguntas().filter(p => p.activa === 1).length;
  const configs = obtenerConfiguracionesTemporizador();

  // Estadísticas generales
  const puntosPromedio = totalAlumnos > 0
    ? Math.round(alumnos.reduce((sum, a) => sum + a.puntos_total, 0) / totalAlumnos)
    : 0;
  const alumnosActivos = alumnos.filter(a => {
    const diff = (new Date() - new Date(a.ultimo_acceso)) / (1000 * 60 * 60 * 24);
    return diff < 7;
  }).length;

  res.render('admin/dashboard', {
    totalAlumnos,
    totalPreguntas,
    totalPreguntasActivas,
    puntosPromedio,
    alumnosActivos,
    alumnosRecientes: alumnos.slice(0, 5),
    configs
  });
});

// ──────────────────────────────────────────────
// Gestor de Contenido (Preguntas)
// ──────────────────────────────────────────────

/**
 * GET /admin/contenido - Lista de todas las preguntas
 */
router.get('/contenido', (req, res) => {
  const preguntas = obtenerTodasPreguntas();
  const continentes = obtenerContinentes();

  // Parsear opciones JSON para la vista
  const preguntasParseadas = preguntas.map(p => ({
    ...p,
    opciones: JSON.parse(p.opciones)
  }));

  res.render('admin/contenido', { preguntas: preguntasParseadas, continentes });
});

/**
 * GET /admin/contenido/nueva - Formulario para nueva pregunta
 */
router.get('/contenido/nueva', (req, res) => {
  const continentes = obtenerContinentes();
  const tipos = [
    { valor: 'continente', etiqueta: 'Pregunta de Continente' },
    { valor: 'banderas', etiqueta: 'Pregunta de Banderas' }
  ];
  res.render('admin/contenido-form', {
    pregunta: null,
    continentes,
    tipos,
    error: null
  });
});

/**
 * POST /admin/contenido/nueva - Guardar nueva pregunta
 */
router.post('/contenido/nueva', (req, res) => {
  const { tipo, continenteId, pregunta, opcion1, opcion2, opcion3, opcion4, respuestaCorrecta, puntos, tiempoLimite } = req.body;

  // Validar campos requeridos
  if (!pregunta || !pregunta.trim()) {
    const continentes = obtenerContinentes();
    const tipos = [
      { valor: 'continente', etiqueta: 'Pregunta de Continente' },
      { valor: 'banderas', etiqueta: 'Pregunta de Banderas' }
    ];
    return res.render('admin/contenido-form', {
      pregunta: null,
      continentes,
      tipos,
      error: 'La pregunta es obligatoria.'
    });
  }

  const opciones = [opcion1, opcion2, opcion3, opcion4];
  if (opciones.some(o => !o || !o.trim())) {
    const continentes = obtenerContinentes();
    const tipos = [
      { valor: 'continente', etiqueta: 'Pregunta de Continente' },
      { valor: 'banderas', etiqueta: 'Pregunta de Banderas' }
    ];
    return res.render('admin/contenido-form', {
      pregunta: null,
      continentes,
      tipos,
      error: 'Todas las opciones son obligatorias.'
    });
  }

  try {
    crearPregunta({
      creadoPor: req.usuario.nombre_completo,
      tipo,
      continenteId: continenteId || null,
      pregunta: pregunta.trim(),
      opciones,
      respuestaCorrecta: parseInt(respuestaCorrecta),
      puntos: parseInt(puntos) || 10,
      tiempoLimite: parseInt(tiempoLimite) || 30
    });

    req.session.flashMessage = { tipo: 'exito', texto: 'Pregunta creada exitosamente.' };
    res.redirect('/admin/contenido');
  } catch (error) {
    console.error('Error al crear pregunta:', error);
    const continentes = obtenerContinentes();
    const tipos = [
      { valor: 'continente', etiqueta: 'Pregunta de Continente' },
      { valor: 'banderas', etiqueta: 'Pregunta de Banderas' }
    ];
    res.render('admin/contenido-form', {
      pregunta: null,
      continentes,
      tipos,
      error: 'Ocurrió un error al guardar la pregunta.'
    });
  }
});

/**
 * GET /admin/contenido/editar/:id - Formulario para editar pregunta
 */
router.get('/contenido/editar/:id', (req, res) => {
  const preguntas = obtenerTodasPreguntas();
  const pregunta = preguntas.find(p => p.id === parseInt(req.params.id));

  if (!pregunta) {
    return res.redirect('/admin/contenido');
  }

  const continentes = obtenerContinentes();
  const tipos = [
    { valor: 'continente', etiqueta: 'Pregunta de Continente' },
    { valor: 'banderas', etiqueta: 'Pregunta de Banderas' }
  ];

  res.render('admin/contenido-form', {
    pregunta: {
      ...pregunta,
      opciones: JSON.parse(pregunta.opciones)
    },
    continentes,
    tipos,
    error: null
  });
});

/**
 * POST /admin/contenido/editar/:id - Actualizar pregunta existente
 */
router.post('/contenido/editar/:id', (req, res) => {
  const preguntaId = parseInt(req.params.id);
  const { tipo, continenteId, pregunta, opcion1, opcion2, opcion3, opcion4, respuestaCorrecta, puntos, tiempoLimite, activa } = req.body;

  if (!pregunta || !pregunta.trim()) {
    return res.redirect(`/admin/contenido/editar/${preguntaId}`);
  }

  const opciones = [opcion1, opcion2, opcion3, opcion4];

  try {
    actualizarPregunta(preguntaId, {
      pregunta: pregunta.trim(),
      opciones,
      respuestaCorrecta: parseInt(respuestaCorrecta),
      puntos: parseInt(puntos) || 10,
      tiempoLimite: parseInt(tiempoLimite) || 30,
      activa: activa === 'on'
    });

    res.redirect('/admin/contenido');
  } catch (error) {
    console.error('Error al actualizar pregunta:', error);
    res.redirect(`/admin/contenido/editar/${preguntaId}`);
  }
});

/**
 * POST /admin/contenido/eliminar/:id - Desactivar pregunta (borrado lógico)
 */
router.post('/contenido/eliminar/:id', (req, res) => {
  const preguntaId = parseInt(req.params.id);
  
  try {
    // Verificar que la pregunta existe antes de desactivar
    const preguntas = obtenerTodasPreguntas();
    const pregunta = preguntas.find(p => p.id === preguntaId);
    
    if (!pregunta) {
      req.session.flashMessage = { tipo: 'error', texto: 'La pregunta no existe.' };
      return res.redirect('/admin/contenido');
    }
    
    if (!pregunta.activa) {
      req.session.flashMessage = { tipo: 'info', texto: 'Esta pregunta ya estaba inactiva.' };
      return res.redirect('/admin/contenido');
    }
    
    desactivarPregunta(preguntaId);
    req.session.flashMessage = { tipo: 'exito', texto: 'Pregunta desactivada correctamente.' };
  } catch (error) {
    console.error('[ERROR] Error al desactivar pregunta:', error);
    req.session.flashMessage = { tipo: 'error', texto: 'Error al desactivar la pregunta. Intenta de nuevo.' };
  }
  
  res.redirect('/admin/contenido');
});

// ──────────────────────────────────────────────
// Configuración de Temporizador
// ──────────────────────────────────────────────

/**
 * GET /admin/temporizador - Configuración de tiempos por nivel
 */
router.get('/temporizador', (req, res) => {
  const configs = obtenerConfiguracionesTemporizador();
  res.render('admin/temporizador', { configs, error: null, exito: null });
});

/**
 * POST /admin/temporizador - Guardar configuraciones de temporizador
 */
router.post('/temporizador', (req, res) => {
  const { configs } = req.body;

  try {
    // Si hay configuraciones, actualizarlas
    if (configs && Array.isArray(configs)) {
      for (const config of configs) {
        guardarConfiguracionTemporizador({
          id: parseInt(config.id) || null,
          nivelDesde: parseInt(config.nivel_desde),
          nivelHasta: parseInt(config.nivel_hasta),
          tiempoSegundos: parseInt(config.tiempo_segundos),
          activo: config.activo === 'on'
        });
      }
    }

    // Si hay nueva configuración
    if (req.body.nueva_nivel_desde && req.body.nueva_tiempo_segundos) {
      guardarConfiguracionTemporizador({
        id: null,
        nivelDesde: parseInt(req.body.nueva_nivel_desde),
        nivelHasta: parseInt(req.body.nueva_nivel_hasta),
        tiempoSegundos: parseInt(req.body.nueva_tiempo_segundos),
        activo: true
      });
    }

    const configsActualizadas = obtenerConfiguracionesTemporizador();
    res.render('admin/temporizador', {
      configs: configsActualizadas,
      error: null,
      exito: 'Configuración guardada exitosamente.'
    });
  } catch (error) {
    console.error('Error al guardar configuración:', error);
    const configsActualizadas = obtenerConfiguracionesTemporizador();
    res.render('admin/temporizador', {
      configs: configsActualizadas,
      error: 'Error al guardar la configuración.',
      exito: null
    });
  }
});

// ──────────────────────────────────────────────
// Monitoreo de Alumnos
// ──────────────────────────────────────────────

/**
 * GET /admin/monitoreo - Lista de todos los alumnos
 */
router.get('/monitoreo', (req, res) => {
  const alumnos = listarAlumnos();
  const continentes = obtenerContinentes();

  // Añadir estadísticas por alumno
  const alumnosConStats = alumnos.map(alumno => {
    const progreso = obtenerTodoProgreso(alumno.id);
    const totalRetos = progreso.reduce((sum, p) => sum + p.retos_completados, 0);
    const puntajeTotal = progreso.reduce((sum, p) => sum + p.puntaje_continente, 0);
    const ultimoAcceso = new Date(alumno.ultimo_acceso);
    const diasInactivo = Math.floor((new Date() - ultimoAcceso) / (1000 * 60 * 60 * 24));
    const esActivo = diasInactivo < 7;

    return {
      ...alumno,
      totalRetos,
      puntajeTotal,
      progresoContinentes: progreso,
      esActivo,
      diasInactivo
    };
  });

  res.render('admin/monitoreo', { alumnos: alumnosConStats, continentes });
});

/**
 * GET /admin/monitoreo/:id - Detalle de un alumno específico
 */
router.get('/monitoreo/:id', (req, res) => {
  const alumnoId = parseInt(req.params.id);
  const alumno = buscarUsuarioPorId(alumnoId);

  if (!alumno || alumno.rol !== 'alumno') {
    return res.redirect('/admin/monitoreo');
  }

  const progreso = obtenerTodoProgreso(alumnoId);
  const historial = obtenerHistorialCompleto(alumnoId);
  const continentes = obtenerContinentes();

  // Estadísticas del alumno
  const totalActividades = historial.length;
  const totalPuntosHistorial = historial.reduce((sum, h) => sum + h.puntaje_obtenido, 0);
  const totalCorrectas = historial.reduce((sum, h) => sum + h.respuestas_correctas, 0);
  const totalRespuestas = historial.reduce((sum, h) => sum + h.respuestas_totales, 0);
  const porcentajeAciertos = totalRespuestas > 0
    ? Math.round((totalCorrectas / totalRespuestas) * 100)
    : 0;

  // Agrupar actividades por tipo
  const actividadesPorTipo = {};
  for (const h of historial) {
    if (!actividadesPorTipo[h.tipo_actividad]) {
      actividadesPorTipo[h.tipo_actividad] = 0;
    }
    actividadesPorTipo[h.tipo_actividad]++;
  }

  // Progreso por continente con nombres
  const progresoConNombres = progreso.map(p => {
    const continente = continentes.find(c => c.id === p.continente_id);
    return {
      ...p,
      nombreContinente: continente ? continente.nombre : p.continente_id,
      svgIconContinente: continente ? continente.svgIcon : 'mundo'
    };
  });

  res.render('admin/alumno-detalle', {
    alumno,
    progreso: progresoConNombres,
    historial,
    totalActividades,
    totalPuntosHistorial,
    totalCorrectas,
    totalRespuestas,
    porcentajeAciertos,
    actividadesPorTipo,
    continentes
  });
});

// ──────────────────────────────────────────────
// Exportar Reportes CSV
// ──────────────────────────────────────────────

/**
 * GET /admin/exportar/csv - Exporta datos de alumnos como CSV
 */
router.get('/exportar/csv', (req, res) => {
  const alumnos = listarAlumnos();
  const continentes = obtenerContinentes();

  // Encabezados CSV
  const encabezados = [
    'ID',
    'Nombre Completo',
    'Usuario',
    'Género',
    'Nivel',
    'Puntos Totales',
    'Fecha Registro',
    'Último Acceso',
    ...continentes.map(c => `${c.nombre} (pts)`),
    ...continentes.map(c => `${c.nombre} (retos)`),
    'Total Actividades',
    '% Aciertos'
  ];

  // Filas de datos
  const filas = alumnos.map(alumno => {
    const progreso = obtenerTodoProgreso(alumno.id);
    const historial = obtenerHistorialCompleto(alumno.id);

    const progresoPorContinente = {};
    for (const p of progreso) {
      progresoPorContinente[p.continente_id] = p;
    }

    const totalActividades = historial.length;
    const totalCorrectas = historial.reduce((sum, h) => sum + h.respuestas_correctas, 0);
    const totalRespuestas = historial.reduce((sum, h) => sum + h.respuestas_totales, 0);
    const porcentaje = totalRespuestas > 0
      ? Math.round((totalCorrectas / totalRespuestas) * 100)
      : 0;

    return [
      alumno.id,
      `"${alumno.nombre_completo}"`,
      `"${alumno.nombre_usuario}"`,
      alumno.genero,
      alumno.nivel,
      alumno.puntos_total,
      alumno.fecha_registro,
      alumno.ultimo_acceso,
      ...continentes.map(c => progresoPorContinente[c.id]?.puntaje_continente || 0),
      ...continentes.map(c => progresoPorContinente[c.id]?.retos_completados || 0),
      totalActividades,
      porcentaje
    ];
  });

  // Generar CSV
  const csvContent = [
    encabezados.join(','),
    ...filas.map(fila => fila.join(','))
  ].join('\n');

  // Agregar BOM para UTF-8 en Excel
  const bom = '\uFEFF';

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="mundo-kids-reporte-${new Date().toISOString().split('T')[0]}.csv"`);
  res.send(bom + csvContent);
});

module.exports = router;
