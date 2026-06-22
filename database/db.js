// Capa de Acceso a Datos - Mundo Kids
// Configuración y funciones de base de datos SQLite

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { calcularNivel } = require('../helpers/niveles');

const DB_PATH = path.join(__dirname, 'mundo-kids.db');

let db;

/**
 * Obtiene la instancia de la base de datos
 * Si no existe, la crea y ejecuta el schema
 */
function obtenerDB() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

/**
 * Inicializa la base de datos ejecutando el schema
 */
function inicializarBaseDeDatos() {
  const database = obtenerDB();
  const schema = require('./schema');
  database.exec(schema);
  // Migración: agregar columna niveles_completados si no existe
  try {
    database.exec("ALTER TABLE usuarios ADD COLUMN niveles_completados TEXT DEFAULT '{}'");
  } catch (e) {
    // Columna ya existe, ignorar
  }
  console.log('✅ Base de datos inicializada correctamente');
  return database;
}

// ──────────────────────────────────────────────
// Funciones de Usuarios
// ──────────────────────────────────────────────

/**
 * Crea un nuevo usuario en la base de datos
 */
function crearUsuario({ nombreCompleto, nombreUsuario, contrasenaHash, genero, rol = 'alumno' }) {
  const database = obtenerDB();
  const stmt = database.prepare(`
    INSERT INTO usuarios (nombre_completo, nombre_usuario, contrasena_hash, genero, rol)
    VALUES (?, ?, ?, ?, ?)
  `);
  const resultado = stmt.run(nombreCompleto, nombreUsuario, contrasenaHash, genero, rol);
  return resultado.lastInsertRowid;
}

/**
 * Busca un usuario por nombre de usuario
 */
function buscarUsuarioPorNombre(nombreUsuario) {
  const database = obtenerDB();
  const stmt = database.prepare('SELECT * FROM usuarios WHERE nombre_usuario = ?');
  return stmt.get(nombreUsuario);
}

/**
 * Busca un usuario por ID
 */
function buscarUsuarioPorId(id) {
  const database = obtenerDB();
  const stmt = database.prepare('SELECT * FROM usuarios WHERE id = ?');
  return stmt.get(id);
}

/**
 * Actualiza el último acceso del usuario
 */
function actualizarUltimoAcceso(usuarioId) {
  const database = obtenerDB();
  const stmt = database.prepare('UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(usuarioId);
}

/**
 * Lista todos los alumnos (para el dashboard del profesor)
 */
function listarAlumnos() {
  const database = obtenerDB();
  const stmt = database.prepare(`
    SELECT id, nombre_completo, nombre_usuario, genero, nivel, puntos_total, 
           fecha_registro, ultimo_acceso
    FROM usuarios WHERE rol = 'alumno' ORDER BY puntos_total DESC
  `);
  return stmt.all();
}

// ──────────────────────────────────────────────
// Funciones de Progreso
// ──────────────────────────────────────────────

/**
 * Obtiene o crea el progreso de un alumno para un continente
 */
function obtenerProgresoContinente(usuarioId, continenteId) {
  const database = obtenerDB();
  const stmt = database.prepare(`
    SELECT * FROM progreso_alumno 
    WHERE usuario_id = ? AND continente_id = ?
  `);
  let progreso = stmt.get(usuarioId, continenteId);
  
  if (!progreso) {
    // Crear registro de progreso si no existe
    const insert = database.prepare(`
      INSERT INTO progreso_alumno (usuario_id, continente_id)
      VALUES (?, ?)
    `);
    insert.run(usuarioId, continenteId);
    progreso = stmt.get(usuarioId, continenteId);
  }
  
  return progreso;
}

/**
 * Obtiene todo el progreso de un alumno
 */
function obtenerTodoProgreso(usuarioId) {
  const database = obtenerDB();
  const stmt = database.prepare(`
    SELECT * FROM progreso_alumno WHERE usuario_id = ?
  `);
  return stmt.all(usuarioId);
}

/**
 * Actualiza puntaje y retos completados de un continente
 */
function actualizarProgresoContinente(usuarioId, continenteId, puntosGanados) {
  const database = obtenerDB();
  const stmt = database.prepare(`
    UPDATE progreso_alumno 
    SET puntaje_continente = puntaje_continente + ?,
        retos_completados = retos_completados + 1,
        fecha_ultimo_acceso = CURRENT_TIMESTAMP
    WHERE usuario_id = ? AND continente_id = ?
  `);
  stmt.run(puntosGanados, usuarioId, continenteId);
}

/**
 * Actualiza puntos totales y nivel del usuario
 */
function actualizarPuntosYNivel(usuarioId, puntosGanados) {
  const database = obtenerDB();
  
  // Actualizar puntos totales
  database.prepare(`
    UPDATE usuarios SET puntos_total = puntos_total + ? WHERE id = ?
  `).run(puntosGanados, usuarioId);
  
  // Recalcular nivel con curva de progresión
  const usuario = buscarUsuarioPorId(usuarioId);
  if (usuario) {
    const nuevoNivel = calcularNivel(usuario.puntos_total);
    if (nuevoNivel > usuario.nivel) {
      database.prepare('UPDATE usuarios SET nivel = ? WHERE id = ?')
        .run(nuevoNivel, usuarioId);
      return { subioNivel: true, nivelAnterior: usuario.nivel, nivelNuevo: nuevoNivel };
    }
  }
  
  return { subioNivel: false };
}

/**
 * @deprecated Usar actualizarPuntosYNivel() que recalcula el nivel con la curva unificada.
 * Se mantiene por compatibilidad pero no debe usarse en código nuevo.
 */
function incrementarNivel(usuarioId) {
  const database = obtenerDB();
  database.prepare('UPDATE usuarios SET nivel = nivel + 1 WHERE id = ?').run(usuarioId);
}

/**
 * Recalcula el nivel de todos los usuarios según la curva de niveles actual.
 * Útil tras cambiar la fórmula de cálculo de niveles. Se ejecuta una sola vez
 * mediante un flag en configuracion_sistema.
 */
function recalcularNivelesUsuarios() {
  const database = obtenerDB();
  const usuarios = database.prepare('SELECT id, puntos_total, nivel FROM usuarios').all();
  let actualizados = 0;
  for (const u of usuarios) {
    const nuevoNivel = calcularNivel(u.puntos_total);
    if (nuevoNivel !== u.nivel) {
      database.prepare('UPDATE usuarios SET nivel = ? WHERE id = ?').run(nuevoNivel, u.id);
      actualizados++;
    }
  }
  console.log(`✅ Niveles recalculados para ${actualizados} de ${usuarios.length} usuarios.`);
  return { total: usuarios.length, actualizados };
}

/**
 * Guarda los niveles completados de un usuario en la BD
 */
function guardarNivelesCompletados(usuarioId, nivelesCompletados) {
  const database = obtenerDB();
  database.prepare('UPDATE usuarios SET niveles_completados = ? WHERE id = ?')
    .run(JSON.stringify(nivelesCompletados || {}), usuarioId);
}

// ──────────────────────────────────────────────
// Funciones de Historial
// ──────────────────────────────────────────────

/**
 * Registra una actividad en el historial
 */
function registrarActividad({ usuarioId, tipoActividad, puntajeObtenido = 0, respuestasCorrectas = 0, respuestasTotales = 0, tiempoSegundos = null }) {
  const database = obtenerDB();
  const stmt = database.prepare(`
    INSERT INTO historial_actividad (usuario_id, tipo_actividad, puntaje_obtenido, respuestas_correctas, respuestas_totales, tiempo_segundos)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(usuarioId, tipoActividad, puntajeObtenido, respuestasCorrectas, respuestasTotales, tiempoSegundos);
}

/**
 * Obtiene el historial de un alumno
 */
function obtenerHistorial(usuarioId, limite = 20) {
  const database = obtenerDB();
  const stmt = database.prepare(`
    SELECT * FROM historial_actividad 
    WHERE usuario_id = ? 
    ORDER BY fecha DESC 
    LIMIT ?
  `);
  return stmt.all(usuarioId, limite);
}

/**
 * Obtiene el historial completo de un alumno (sin límite, para admin)
 */
function obtenerHistorialCompleto(usuarioId) {
  const database = obtenerDB();
  const stmt = database.prepare(`
    SELECT * FROM historial_actividad 
    WHERE usuario_id = ? 
    ORDER BY fecha DESC
  `);
  return stmt.all(usuarioId);
}

// ──────────────────────────────────────────────
// Funciones de Preguntas Personalizadas
// ──────────────────────────────────────────────

/**
 * Obtiene preguntas activas por tipo y opcionalmente por continente
 */
function obtenerPreguntasPersonalizadas(tipo, continenteId = null) {
  const database = obtenerDB();
  const tipos = Array.isArray(tipo) ? tipo : [tipo];
  const placeholders = tipos.map(() => '?').join(',');
  let sql = `SELECT * FROM preguntas_personalizadas WHERE activa = 1 AND tipo IN (${placeholders})`;
  const params = [...tipos];
  
  if (continenteId) {
    sql += ' AND continente_id = ?';
    params.push(continenteId);
  }
  
  const stmt = database.prepare(sql);
  return stmt.all(...params);
}

/**
 * Obtiene todas las preguntas (para el gestor de contenido del admin)
 */
function obtenerTodasPreguntas() {
  const database = obtenerDB();
  return database.prepare('SELECT * FROM preguntas_personalizadas ORDER BY fecha_creacion DESC').all();
}

/**
 * Crea una nueva pregunta personalizada
 */
function crearPregunta({ creadoPor, tipo, continenteId, pregunta, opciones, respuestaCorrecta, puntos = 10, tiempoLimite = 30 }) {
  const database = obtenerDB();
  const stmt = database.prepare(`
    INSERT INTO preguntas_personalizadas (creado_por, tipo, continente_id, pregunta, opciones, respuesta_correcta, puntos, tiempo_limite)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(creadoPor, tipo, continenteId || null, pregunta, JSON.stringify(opciones), respuestaCorrecta, puntos, tiempoLimite);
}

/**
 * Actualiza una pregunta existente
 */
function actualizarPregunta(id, { pregunta, opciones, respuestaCorrecta, puntos, tiempoLimite, activa }) {
  const database = obtenerDB();
  const stmt = database.prepare(`
    UPDATE preguntas_personalizadas 
    SET pregunta = ?, opciones = ?, respuesta_correcta = ?, puntos = ?, tiempo_limite = ?, activa = ?
    WHERE id = ?
  `);
  return stmt.run(pregunta, JSON.stringify(opciones), respuestaCorrecta, puntos, tiempoLimite, activa ? 1 : 0, id);
}

/**
 * Desactiva una pregunta (borrado lógico)
 */
function desactivarPregunta(id) {
  const database = obtenerDB();
  return database.prepare('UPDATE preguntas_personalizadas SET activa = 0 WHERE id = ?').run(id);
}

// ──────────────────────────────────────────────
// Funciones de Configuración
// ──────────────────────────────────────────────

/**
 * Obtiene el tiempo límite para un nivel específico
 */
function obtenerTiempoPorNivel(nivel) {
  const database = obtenerDB();
  const stmt = database.prepare(`
    SELECT tiempo_segundos FROM configuracion_temporizador 
    WHERE ? BETWEEN nivel_desde AND nivel_hasta AND activo = 1
    ORDER BY nivel_desde ASC LIMIT 1
  `);
  const resultado = stmt.get(nivel);
  return resultado ? resultado.tiempo_segundos : 30;
}

/**
 * Obtiene todas las configuraciones de temporizador
 */
function obtenerConfiguracionesTemporizador() {
  const database = obtenerDB();
  return database.prepare('SELECT * FROM configuracion_temporizador ORDER BY nivel_desde ASC').all();
}

/**
 * Guarda o actualiza una configuración de temporizador
 */
function guardarConfiguracionTemporizador({ id, nivelDesde, nivelHasta, tiempoSegundos, activo }) {
  const database = obtenerDB();
  if (id) {
    return database.prepare(`
      UPDATE configuracion_temporizador 
      SET nivel_desde = ?, nivel_hasta = ?, tiempo_segundos = ?, activo = ?
      WHERE id = ?
    `).run(nivelDesde, nivelHasta, tiempoSegundos, activo ? 1 : 0, id);
  } else {
    return database.prepare(`
      INSERT INTO configuracion_temporizador (nivel_desde, nivel_hasta, tiempo_segundos, activo)
      VALUES (?, ?, ?, ?)
    `).run(nivelDesde, nivelHasta, tiempoSegundos, activo ? 1 : 0);
  }
}

/**
 * Obtiene un valor de configuración del sistema
 */
function obtenerConfigSistema(clave) {
  const database = obtenerDB();
  const stmt = database.prepare('SELECT valor FROM configuracion_sistema WHERE clave = ?');
  const resultado = stmt.get(clave);
  return resultado ? resultado.valor : null;
}

/**
 * Guarda un valor de configuración del sistema
 */
function guardarConfigSistema(clave, valor, descripcion = '') {
  const database = obtenerDB();
  const stmt = database.prepare(`
    INSERT OR REPLACE INTO configuracion_sistema (clave, valor, descripcion)
    VALUES (?, ?, ?)
  `);
  return stmt.run(clave, valor, descripcion);
}

// ──────────────────────────────────────────────
// Funciones de Ranking / Clasificación
// ──────────────────────────────────────────────

/**
 * Obtiene el ranking de alumnos ordenados por puntos
 */
function obtenerRanking(limite = 50, pagina = 1) {
  const database = obtenerDB();
  const offset = (pagina - 1) * limite;
  const stmt = database.prepare(`
    SELECT id, nombre_completo, nombre_usuario, genero, nivel, puntos_total,
           fecha_registro, ultimo_acceso
    FROM usuarios WHERE rol = 'alumno'
    ORDER BY puntos_total DESC, nivel DESC
    LIMIT ? OFFSET ?
  `);
  return stmt.all(limite, offset);
}

/**
 * Obtiene la posición de un usuario en el ranking
 */
function obtenerPosicionUsuario(usuarioId) {
  const database = obtenerDB();
  const usuario = buscarUsuarioPorId(usuarioId);
  if (!usuario) return null;
  
  const stmt = database.prepare(`
    SELECT COUNT(*) as posicion FROM usuarios 
    WHERE rol = 'alumno' AND puntos_total > ?
  `);
  const resultado = stmt.get(usuario.puntos_total);
  return resultado.posicion + 1;
}

/**
 * Obtiene el total de alumnos en el ranking
 */
function obtenerTotalAlumnosRanking() {
  const database = obtenerDB();
  const stmt = database.prepare("SELECT COUNT(*) as total FROM usuarios WHERE rol = 'alumno'");
  return stmt.get().total;
}

// ──────────────────────────────────────────────
// Funciones de Logros
// ──────────────────────────────────────────────

/**
 * Obtiene todos los logros del catálogo
 */
function obtenerTodosLosLogros() {
  const database = obtenerDB();
  return database.prepare('SELECT * FROM logros ORDER BY categoria, id ASC').all();
}

/**
 * Obtiene los logros desbloqueados por un usuario
 */
function obtenerLogrosUsuario(usuarioId) {
  const database = obtenerDB();
  return database.prepare(`
    SELECT l.*, lu.fecha_desbloqueado
    FROM logros l
    INNER JOIN logros_usuario lu ON l.id = lu.logro_id
    WHERE lu.usuario_id = ?
    ORDER BY lu.fecha_desbloqueado DESC
  `).all(usuarioId);
}

/**
 * Verifica si un usuario ya tiene un logro
 */
function tieneLogro(usuarioId, logroId) {
  const database = obtenerDB();
  const stmt = database.prepare(
    'SELECT COUNT(*) as count FROM logros_usuario WHERE usuario_id = ? AND logro_id = ?'
  );
  return stmt.get(usuarioId, logroId).count > 0;
}

/**
 * Desbloquea un logro para un usuario
 */
function desbloquearLogro(usuarioId, logroId) {
  const database = obtenerDB();
  return database.prepare(`
    INSERT OR IGNORE INTO logros_usuario (usuario_id, logro_id)
    VALUES (?, ?)
  `).run(usuarioId, logroId);
}

/**
 * Obtiene el conteo de logros desbloqueados por un usuario
 */
function contarLogrosDesbloqueados(usuarioId) {
  const database = obtenerDB();
  const stmt = database.prepare(
    'SELECT COUNT(*) as count FROM logros_usuario WHERE usuario_id = ?'
  );
  return stmt.get(usuarioId).count;
}

/**
 * Obtiene el total de logros disponibles
 */
function contarLogrosTotales() {
  const database = obtenerDB();
  return database.prepare('SELECT COUNT(*) as count FROM logros').get().count;
}

/**
 * Obtiene un logro por su clave
 */
function obtenerLogroPorClave(clave) {
  const database = obtenerDB();
  return database.prepare('SELECT * FROM logros WHERE clave = ?').get(clave);
}

module.exports = {
  obtenerDB,
  inicializarBaseDeDatos,
  
  // Usuarios
  crearUsuario,
  buscarUsuarioPorNombre,
  buscarUsuarioPorId,
  actualizarUltimoAcceso,
  listarAlumnos,
  
  // Progreso
  obtenerProgresoContinente,
  obtenerTodoProgreso,
  actualizarProgresoContinente,
  actualizarPuntosYNivel,
  incrementarNivel,
  recalcularNivelesUsuarios,
  guardarNivelesCompletados,
  
  // Historial
  registrarActividad,
  obtenerHistorial,
  obtenerHistorialCompleto,
  
  // Preguntas
  obtenerPreguntasPersonalizadas,
  obtenerTodasPreguntas,
  crearPregunta,
  actualizarPregunta,
  desactivarPregunta,
  
  // Configuración
  obtenerTiempoPorNivel,
  obtenerConfiguracionesTemporizador,
  guardarConfiguracionTemporizador,
  obtenerConfigSistema,
  guardarConfigSistema,
  
  // Ranking
  obtenerRanking,
  obtenerPosicionUsuario,
  obtenerTotalAlumnosRanking,
  
  // Logros
  obtenerTodosLosLogros,
  obtenerLogrosUsuario,
  tieneLogro,
  desbloquearLogro,
  contarLogrosDesbloqueados,
  contarLogrosTotales,
  obtenerLogroPorClave,
};
