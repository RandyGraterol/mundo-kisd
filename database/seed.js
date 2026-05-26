// Script de Seed - Mundo Kids
// Población completa de la base de datos con datos demo
// Se ejecuta al iniciar el servidor por primera vez

const bcrypt = require('bcryptjs');
const { obtenerDB, buscarUsuarioPorNombre, crearPregunta, guardarConfiguracionTemporizador, guardarConfigSistema, crearUsuario } = require('./db');

/**
 * Ejecuta el seed de la base de datos
 * Inserta datos por defecto y demo si las tablas están vacías
 */
function ejecutarSeed() {
  const db = obtenerDB();
  
  // Verificar si ya se ejecutó el seed
  const seedEjecutado = db.prepare("SELECT valor FROM configuracion_sistema WHERE clave = 'seed_ejecutado'").get();
  if (seedEjecutado) {
    console.log('[SKIP] Seed ya ejecutado anteriormente, saltando...');
    return;
  }
  
  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log('  🌍 MUNDO KIDS - POBLACIÓN DE BASE DE DATOS');
  console.log('═══════════════════════════════════════════════');
  console.log('');
  
  // 1. Crear cuenta de administrador por defecto
  const adminId = crearAdminPorDefecto(db);
  
  // 2. Crear configuraciones de temporizador por defecto
  crearConfiguracionesTemporizador(db);
  
  // 3. Crear logros por defecto
  crearLogrosPorDefecto(db);
  
  // 4. Crear configuraciones del sistema
  crearConfiguracionesSistema(db);
  
  // 5. Crear alumnos demo
  const alumnosDemo = crearAlumnosDemo(db);
  
  // 6. Crear progreso en continentes para alumnos demo
  crearProgresoContinentes(db, alumnosDemo);
  
  // 7. Crear historial de actividad para alumnos demo
  crearHistorialActividad(db, alumnosDemo);
  
  // 8. Desbloquear logros para alumnos demo
  desbloquearLogrosDemo(db, alumnosDemo);
  
  // 9. Crear preguntas personalizadas de ejemplo
  crearPreguntasEjemplo(db);
  
  // 10. Marcar seed como ejecutado
  db.prepare("INSERT INTO configuracion_sistema (clave, valor, descripcion) VALUES ('seed_ejecutado', 'true', 'Indica si el seed inicial ya fue ejecutado')").run();
  
  // ── Mostrar resumen final ──
  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log('  ✅ POBLACIÓN COMPLETADA EXITOSAMENTE');
  console.log('═══════════════════════════════════════════════');
  console.log('');
  console.log('  📊 DATOS INSERTADOS:');
  console.log(`  • 1 cuenta de profesor`);
  console.log(`  • ${alumnosDemo.length} alumnos demo`);
  console.log(`  • Registros de progreso por continente`);
  console.log(`  • Historial de actividades`);
  console.log(`  • Logros desbloqueados`);
  console.log(`  • ${logrosPorDefecto().length} logros disponibles`);
  console.log(`  • Preguntas de ejemplo para el gestor`);
  console.log(`  • Configuraciones del sistema`);
  console.log('');
  console.log('  🔑 CREDENCIALES DE ACCESO:');
  console.log('  ┌──────────────────────────────────┐');
  console.log('  │  👨‍🏫 PROFESOR (ADMINISTRADOR)      │');
  console.log('  │  Usuario:  profesor               │');
  console.log('  │  Contraseña: admin123             │');
  console.log('  ├──────────────────────────────────┤');
  console.log('  │  🌐 Inicia sesión en:             │');
  console.log('  │  http://localhost:3000/auth/login │');
  console.log('  └──────────────────────────────────┘');
  console.log('');
  console.log('  👧👦 ALUMNOS DEMO (para probar):');
  for (const alumno of alumnosDemo) {
    console.log(`  • ${alumno.nombre} → usuario: ${alumno.usuario}, contraseña: ${alumno.contrasena}`);
  }
  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log('');
}

// ──────────────────────────────────────────────
// ADMINISTRADOR
// ──────────────────────────────────────────────

/**
 * Crea la cuenta de administrador por defecto
 */
function crearAdminPorDefecto(db) {
  const adminExistente = buscarUsuarioPorNombre('profesor');
  
  if (!adminExistente) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('admin123', salt);
    
    const stmt = db.prepare(`
      INSERT INTO usuarios (nombre_completo, nombre_usuario, contrasena_hash, genero, rol, nivel, puntos_total)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run('Profesor Mundo Kids', 'profesor', hash, 'masculino', 'profesor', 10, 0);
    
    console.log('  ✓ Cuenta de administrador creada');
    return db.prepare("SELECT id FROM usuarios WHERE nombre_usuario = 'profesor'").get().id;
  } else {
    console.log('  ✓ Cuenta de administrador ya existe');
    return adminExistente.id;
  }
}

// ──────────────────────────────────────────────
// ALUMNOS DEMO
// ──────────────────────────────────────────────

const ALUMNOS_DEMO = [
  { nombre: 'Carlitos Pérez',     usuario: 'carlos',   contrasena: 'carlos123',   genero: 'masculino',  nivel: 5,  puntos: 150 },
  { nombre: 'Mariana López',      usuario: 'mariana',  contrasena: 'mariana123',  genero: 'femenino',   nivel: 8,  puntos: 240 },
  { nombre: 'José Martínez',      usuario: 'jose',     contrasena: 'jose123',     genero: 'masculino',  nivel: 3,  puntos: 90 },
  { nombre: 'Sofía García',       usuario: 'sofia',    contrasena: 'sofia123',    genero: 'femenino',   nivel: 6,  puntos: 180 },
  { nombre: 'Alejandro Rodríguez', usuario: 'alejandro', contrasena: 'alejandro123', genero: 'masculino', nivel: 12, puntos: 370 },
  { nombre: 'Valentina Torres',   usuario: 'vale',     contrasena: 'vale123',     genero: 'femenino',   nivel: 2,  puntos: 55 },
  { nombre: 'Mateo Castillo',     usuario: 'mateo',    contrasena: 'mateo123',    genero: 'masculino',  nivel: 7,  puntos: 210 },
  { nombre: 'Isabella Rojas',     usuario: 'isabella', contrasena: 'isabella123', genero: 'femenino',   nivel: 4,  puntos: 120 },
];

/**
 * Crea alumnos demo para probar la aplicación
 */
function crearAlumnosDemo(db) {
  const count = db.prepare("SELECT COUNT(*) as count FROM usuarios WHERE rol = 'alumno'").get();
  if (count.count > 0) {
    console.log('  ✓ Alumnos demo ya existen, saltando...');
    // Devolver los alumnos existentes
    const alumnos = db.prepare("SELECT id, nombre_completo, nombre_usuario, genero, nivel, puntos_total FROM usuarios WHERE rol = 'alumno' ORDER BY id ASC").all();
    return alumnos.map(a => ({
      id: a.id,
      nombre: a.nombre_completo,
      usuario: a.nombre_usuario,
      genero: a.genero,
      nivel: a.nivel,
      puntos: a.puntos_total
    }));
  }

  const insertUsuario = db.prepare(`
    INSERT INTO usuarios (nombre_completo, nombre_usuario, contrasena_hash, genero, rol, nivel, puntos_total)
    VALUES (?, ?, ?, ?, 'alumno', ?, ?)
  `);

  const creados = [];
  
  for (const alumno of ALUMNOS_DEMO) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(alumno.contrasena, salt);
    const resultado = insertUsuario.run(alumno.nombre, alumno.usuario, hash, alumno.genero, alumno.nivel, alumno.puntos);
    
    creados.push({
      id: resultado.lastInsertRowid,
      nombre: alumno.nombre,
      usuario: alumno.usuario,
      contrasena: alumno.contrasena,
      genero: alumno.genero,
      nivel: alumno.nivel,
      puntos: alumno.puntos
    });
  }
  
  console.log(`  ✓ ${creados.length} alumnos demo creados`);
  return creados;
}

// ──────────────────────────────────────────────
// PROGRESO EN CONTINENTES
// ──────────────────────────────────────────────

const CONTINENTES = ['america', 'europa', 'asia', 'africa', 'oceania', 'antartida'];

/**
 * Crea registros de progreso por continente para cada alumno demo
 */
function crearProgresoContinentes(db, alumnos) {
  const insertProgreso = db.prepare(`
    INSERT OR IGNORE INTO progreso_alumno (usuario_id, continente_id, retos_completados, retos_totales, puntaje_continente)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const alumno of alumnos) {
    // Cada alumno tiene progreso en 3-5 continentes aleatorios
    const numContinentes = 3 + Math.floor(Math.random() * 3); // 3, 4, o 5
    const continentesMezclados = [...CONTINENTES].sort(() => Math.random() - 0.5);
    const continentesAsignados = continentesMezclados.slice(0, numContinentes);
    
    for (const continenteId of continentesAsignados) {
      const retosCompletados = 1 + Math.floor(Math.random() * 3); // 1-3 retos
      const puntaje = retosCompletados * (5 + Math.floor(Math.random() * 10)); // 5-15 pts por reto
      
      insertProgreso.run(alumno.id, continenteId, retosCompletados, 3, puntaje);
    }
  }
  
  console.log('  ✓ Progreso por continente creado para alumnos demo');
}

// ──────────────────────────────────────────────
// HISTORIAL DE ACTIVIDAD
// ──────────────────────────────────────────────

const TIPOS_ACTIVIDAD = ['Reto', 'Trivia', 'Sopa de Letras', 'Memoria', 'Rompecabezas'];

/**
 * Crea historial de actividad para cada alumno demo
 */
function crearHistorialActividad(db, alumnos) {
  const insertHistorial = db.prepare(`
    INSERT INTO historial_actividad (usuario_id, tipo_actividad, puntaje_obtenido, respuestas_correctas, respuestas_totales, tiempo_segundos, fecha)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const alumno of alumnos) {
    const numActividades = 5 + Math.floor(Math.random() * 10); // 5-14 actividades
    
    for (let i = 0; i < numActividades; i++) {
      const tipo = TIPOS_ACTIVIDAD[Math.floor(Math.random() * TIPOS_ACTIVIDAD.length)];
      const respuestasTotales = tipo === 'Reto' ? 5 : tipo === 'Trivia' ? 10 : 1;
      const respuestasCorrectas = Math.max(1, Math.floor(respuestasTotales * (0.5 + Math.random() * 0.5))); // 50%-100%
      const puntaje = respuestasCorrectas * (tipo === 'Reto' ? 10 : tipo === 'Trivia' ? 15 : 20);
      const tiempo = 30 + Math.floor(Math.random() * 120); // 30-150 segundos
      
      // Fechas distribuidas en los últimos 30 días
      const diasAtras = Math.floor(Math.random() * 30);
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - diasAtras);
      const fechaStr = fecha.toISOString().replace('T', ' ').substring(0, 19);
      
      insertHistorial.run(alumno.id, tipo, puntaje, respuestasCorrectas, respuestasTotales, tiempo, fechaStr);
    }
  }
  
  console.log('  ✓ Historial de actividad creado para alumnos demo');
}

// ──────────────────────────────────────────────
// LOGROS DESBLOQUEADOS
// ──────────────────────────────────────────────

/**
 * Desbloquea logros para alumnos demo según su nivel y progreso
 */
function desbloquearLogrosDemo(db, alumnos) {
  const logrosExistentes = db.prepare("SELECT COUNT(*) as count FROM logros").get();
  if (logrosExistentes.count === 0) {
    console.log('  ✗ No hay logros para desbloquear, saltando...');
    return;
  }
  
  const insertLogroUsuario = db.prepare(`
    INSERT OR IGNORE INTO logros_usuario (usuario_id, logro_id, fecha_desbloqueado)
    VALUES (?, ?, ?)
  `);
  
  // Obtener logros disponibles
  const logros = db.prepare("SELECT id, clave, condicion_tipo, condicion_valor FROM logros").all();
  
  for (const alumno of alumnos) {
    // Encontrar logros que el alumno califica según su nivel
    const logrosParaAlumno = logros.filter(logro => {
      switch (logro.condicion_tipo) {
        case 'nivel':
          return alumno.nivel >= logro.condicion_valor;
        case 'puntos_totales':
          return alumno.puntos >= logro.condicion_valor;
        case 'siempre':
          return true;
        case 'retos_completados':
          return alumno.nivel >= logro.condicion_valor; // Aproximación
        default:
          return false;
      }
    });
    
    // Desbloquear algunos logros (los que califica, con fecha aleatoria)
    for (const logro of logrosParaAlumno) {
      const diasAtras = Math.floor(Math.random() * 20);
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - diasAtras);
      const fechaStr = fecha.toISOString().replace('T', ' ').substring(0, 19);
      
      insertLogroUsuario.run(alumno.id, logro.id, fechaStr);
    }
  }
  
  console.log('  ✓ Logros desbloqueados para alumnos demo');
}

// ──────────────────────────────────────────────
// PREGUNTAS PERSONALIZADAS DE EJEMPLO
// ──────────────────────────────────────────────

/**
 * Crea preguntas de ejemplo para el gestor de contenido del profesor
 */
function crearPreguntasEjemplo(db) {
  const count = db.prepare("SELECT COUNT(*) as count FROM preguntas_personalizadas WHERE creado_por = 'seed'").get();
  if (count.count > 0) {
    console.log('  ✓ Preguntas de ejemplo ya existen, saltando...');
    return;
  }

  const preguntasEjemplo = [
    // Preguntas de trivia sobre Venezuela
    {
      tipo: 'trivia',
      continenteId: 'america',
      pregunta: '¿Cuál es la capital de Venezuela?',
      opciones: ['Maracaibo', 'Valencia', 'Caracas', 'Barquisimeto'],
      respuestaCorrecta: 2,
      puntos: 10,
      tiempoLimite: 30,
    },
    {
      tipo: 'trivia',
      continenteId: 'america',
      pregunta: '¿Cuántos estados tiene Venezuela?',
      opciones: ['20 estados', '23 estados', '25 estados', '18 estados'],
      respuestaCorrecta: 1,
      puntos: 15,
      tiempoLimite: 30,
    },
    {
      tipo: 'trivia',
      continenteId: 'america',
      pregunta: '¿Cuál es el lago más grande de Venezuela?',
      opciones: ['Lago de Valencia', 'Lago de Maracaibo', 'Lago de Guri', 'Lago de Titicaca'],
      respuestaCorrecta: 1,
      puntos: 10,
      tiempoLimite: 20,
    },
    {
      tipo: 'trivia',
      continenteId: 'america',
      pregunta: '¿Qué páramo venezolano es famoso por sus frailejones?',
      opciones: ['Páramo de La Culata', 'Páramo de Piedras Blancas', 'Páramo de Mucuchíes', 'Páramo de El Ávila'],
      respuestaCorrecta: 2,
      puntos: 15,
      tiempoLimite: 25,
    },
    {
      tipo: 'trivia',
      continenteId: 'america',
      pregunta: '¿Cuál es el plato típico más conocido de Venezuela?',
      opciones: ['La arepa', 'El taco', 'La paella', 'La empanada'],
      respuestaCorrecta: 0,
      puntos: 10,
      tiempoLimite: 20,
    },
    // Preguntas de cultura general
    {
      tipo: 'reto',
      continenteId: 'america',
      pregunta: '¿Cuál es el país más grande de América del Sur?',
      opciones: ['Argentina', 'Perú', 'Brasil', 'Colombia'],
      respuestaCorrecta: 2,
      puntos: 10,
      tiempoLimite: 30,
    },
    {
      tipo: 'reto',
      continenteId: 'europa',
      pregunta: '¿Cuál es el país más visitado del mundo?',
      opciones: ['España', 'Francia', 'Italia', 'Reino Unido'],
      respuestaCorrecta: 1,
      puntos: 15,
      tiempoLimite: 20,
    },
    {
      tipo: 'reto',
      continenteId: 'asia',
      pregunta: '¿En qué país asiático se inventó el papel?',
      opciones: ['Japón', 'Corea', 'India', 'China'],
      respuestaCorrecta: 3,
      puntos: 10,
      tiempoLimite: 25,
    },
    {
      tipo: 'reto',
      continenteId: 'africa',
      pregunta: '¿Cuál es el país más poblado de África?',
      opciones: ['Egipto', 'Etiopía', 'Nigeria', 'Sudáfrica'],
      respuestaCorrecta: 2,
      puntos: 10,
      tiempoLimite: 25,
    },
    {
      tipo: 'reto',
      continenteId: 'oceania',
      pregunta: '¿Cuál es la moneda oficial de Australia?',
      opciones: ['Dólar australiano', 'Euro', 'Libra esterlina', 'Peso'],
      respuestaCorrecta: 0,
      puntos: 10,
      tiempoLimite: 20,
    },
  ];

  for (const p of preguntasEjemplo) {
    crearPregunta({
      creadoPor: 'seed',
      tipo: p.tipo,
      continenteId: p.continenteId,
      pregunta: p.pregunta,
      opciones: p.opciones,
      respuestaCorrecta: p.respuestaCorrecta,
      puntos: p.puntos,
      tiempoLimite: p.tiempoLimite,
    });
  }

  console.log(`  ✓ ${preguntasEjemplo.length} preguntas de ejemplo creadas para el gestor de contenido`);
}

// ──────────────────────────────────────────────
// TEMPORIZADOR
// ──────────────────────────────────────────────

/**
 * Crea las configuraciones de temporizador por defecto
 */
function crearConfiguracionesTemporizador(db) {
  const configs = [
    { nivelDesde: 1, nivelHasta: 3, tiempoSegundos: 30 },
    { nivelDesde: 4, nivelHasta: 6, tiempoSegundos: 25 },
    { nivelDesde: 7, nivelHasta: 10, tiempoSegundos: 20 },
    { nivelDesde: 11, nivelHasta: 99, tiempoSegundos: 15 },
  ];
  
  const count = db.prepare('SELECT COUNT(*) as count FROM configuracion_temporizador').get();
  
  if (count.count === 0) {
    const insert = db.prepare(`
      INSERT INTO configuracion_temporizador (nivel_desde, nivel_hasta, tiempo_segundos, activo)
      VALUES (?, ?, ?, 1)
    `);
    
    for (const config of configs) {
      insert.run(config.nivelDesde, config.nivelHasta, config.tiempoSegundos);
    }
    
    console.log('  ✓ Configuraciones de temporizador creadas');
  } else {
    console.log('  ✓ Configuraciones de temporizador ya existen');
  }
}

// ──────────────────────────────────────────────
// LOGROS
// ──────────────────────────────────────────────

function logrosPorDefecto() {
  return [
    { clave: 'primer_reto', nombre: 'Primer Paso', descripcion: 'Completa tu primer reto de un continente', icono: 'trofeo', categoria: 'progreso', condicion_tipo: 'retos_completados', condicion_valor: 1, puntos_recompensa: 10 },
    { clave: 'explorador_continentes', nombre: 'Explorador', descripcion: 'Completa retos en 3 continentes diferentes', icono: 'globo', categoria: 'progreso', condicion_tipo: 'retos_completados', condicion_valor: 3, puntos_recompensa: 20 },
    { clave: 'cinco_retos', nombre: 'Aprendiz', descripcion: 'Completa 5 retos de continentes', icono: 'libro', categoria: 'progreso', condicion_tipo: 'retos_completados', condicion_valor: 5, puntos_recompensa: 30 },
    { clave: 'diez_retos', nombre: 'Estudioso', descripcion: 'Completa 10 retos de continentes', icono: 'medalla', categoria: 'progreso', condicion_tipo: 'retos_completados', condicion_valor: 10, puntos_recompensa: 50 },
    { clave: 'coleccionista', nombre: 'Coleccionista', descripcion: 'Visita los 6 continentes', icono: 'mapa', categoria: 'progreso', condicion_tipo: 'continentes_visitados', condicion_valor: 6, puntos_recompensa: 40 },
    { clave: 'nivel_5', nombre: 'Novato Experto', descripcion: 'Alcanza el nivel 5', icono: 'estrella', categoria: 'progreso', condicion_tipo: 'nivel', condicion_valor: 5, puntos_recompensa: 30 },
    { clave: 'nivel_10', nombre: 'Maestro', descripcion: 'Alcanza el nivel 10', icono: 'trofeo', categoria: 'progreso', condicion_tipo: 'nivel', condicion_valor: 10, puntos_recompensa: 60 },
    { clave: 'nivel_20', nombre: 'Leyenda', descripcion: 'Alcanza el nivel 20', icono: 'corona', categoria: 'progreso', condicion_tipo: 'nivel', condicion_valor: 20, puntos_recompensa: 100 },
    { clave: 'cien_puntos', nombre: 'Centenario', descripcion: 'Acumula 100 puntos totales', icono: 'diamante', categoria: 'progreso', condicion_tipo: 'puntos_totales', condicion_valor: 100, puntos_recompensa: 20 },
    { clave: 'quinientos_puntos', nombre: 'Leyenda de Puntos', descripcion: 'Acumula 500 puntos totales', icono: 'corona', categoria: 'progreso', condicion_tipo: 'puntos_totales', condicion_valor: 500, puntos_recompensa: 80 },
    { clave: 'trivia_inicial', nombre: 'Bandero', descripcion: 'Completa tu primera trivia de banderas', icono: 'bandera', categoria: 'actividades', condicion_tipo: 'actividades_totales', condicion_valor: 1, puntos_recompensa: 10 },
    { clave: 'sopero', nombre: 'Detective de Letras', descripcion: 'Juega 5 partidas de sopa de letras', icono: 'sopa_letras', categoria: 'actividades', condicion_tipo: 'actividades_totales', condicion_valor: 5, puntos_recompensa: 25 },
    { clave: 'memorion', nombre: 'Mente Brillante', descripcion: 'Juega 10 partidas de memoria', icono: 'memoria', categoria: 'actividades', condicion_tipo: 'actividades_totales', condicion_valor: 10, puntos_recompensa: 35 },
    { clave: 'rompecabezas', nombre: 'Arquitecto', descripcion: 'Completa 3 rompecabezas', icono: 'puzzle_pieza', categoria: 'actividades', condicion_tipo: 'actividades_totales', condicion_valor: 3, puntos_recompensa: 20 },
    { clave: 'cien_actividades', nombre: 'Veterano', descripcion: 'Realiza 100 actividades en total', icono: 'diana', categoria: 'actividades', condicion_tipo: 'actividades_totales', condicion_valor: 100, puntos_recompensa: 100 },
    { clave: 'diez_seguidas', nombre: 'Racha de Oro', descripcion: 'Juega 3 días consecutivos sin saltarte ninguno', icono: 'fuego', categoria: 'social', condicion_tipo: 'racha_diaria', condicion_valor: 3, puntos_recompensa: 30 },
    { clave: 'semana_completa', nombre: 'Dedicación', descripcion: 'Juega 7 días consecutivos', icono: 'calendario', categoria: 'social', condicion_tipo: 'racha_diaria', condicion_valor: 7, puntos_recompensa: 70 },
    { clave: 'perfecto_80', nombre: 'Precisión', descripcion: 'Mantén un 80% o más de respuestas correctas', icono: 'diana', categoria: 'habilidad', condicion_tipo: 'porcentaje_aciertos', condicion_valor: 80, puntos_recompensa: 50 },
    { clave: 'perfecto_95', nombre: 'Impecable', descripcion: 'Mantén un 95% o más de respuestas correctas', icono: 'diamante', categoria: 'habilidad', condicion_tipo: 'porcentaje_aciertos', condicion_valor: 95, puntos_recompensa: 100 },
    { clave: 'bienvenido', nombre: '¡Bienvenido a Mundo Kids!', descripcion: 'Gracias por unirte a nuestra aventura educativa', icono: 'fiesta', categoria: 'especial', condicion_tipo: 'siempre', condicion_valor: 1, puntos_recompensa: 5 },
  ];
}

/**
 * Crea los logros/insignias por defecto
 */
function crearLogrosPorDefecto(db) {
  const count = db.prepare('SELECT COUNT(*) as count FROM logros').get();
  
  if (count.count > 0) {
    console.log('  ✓ Logros ya existen, saltando...');
    return;
  }

  const logros = logrosPorDefecto();

  const insert = db.prepare(`
    INSERT INTO logros (clave, nombre, descripcion, icono, categoria, condicion_tipo, condicion_valor, puntos_recompensa)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const logro of logros) {
    insert.run(logro.clave, logro.nombre, logro.descripcion, logro.icono, logro.categoria, logro.condicion_tipo, logro.condicion_valor, logro.puntos_recompensa);
  }

  console.log(`  ✓ ${logros.length} logros disponibles creados`);
}

// ──────────────────────────────────────────────
// CONFIGURACIONES DEL SISTEMA
// ──────────────────────────────────────────────

/**
 * Crea las configuraciones del sistema por defecto
 */
function crearConfiguracionesSistema(db) {
  const configs = [
    { clave: 'nombre_escuela', valor: 'U.E.E. Jacinto Silva', descripcion: 'Nombre de la institución educativa' },
    { clave: 'puntos_por_nivel', valor: '30', descripcion: 'Puntos necesarios para subir de nivel' },
    { clave: 'max_preguntas_reto', valor: '5', descripcion: 'Número máximo de preguntas por reto' },
    { clave: 'max_preguntas_trivia', valor: '12', descripcion: 'Número máximo de preguntas en trivia de banderas' },
    { clave: 'version', valor: '2.0.0', descripcion: 'Versión del sistema' },
  ];
  
  const insert = db.prepare(`
    INSERT OR IGNORE INTO configuracion_sistema (clave, valor, descripcion)
    VALUES (?, ?, ?)
  `);
  
  for (const config of configs) {
    insert.run(config.clave, config.valor, config.descripcion);
  }
    
  console.log('  ✓ Configuraciones del sistema creadas');
}

module.exports = { ejecutarSeed };
