// Schema de Base de Datos - Mundo Kids
// Define la estructura de todas las tablas del sistema

const schemaSQL = `
-- Tabla: usuarios (alumnos y profesores)
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre_completo TEXT NOT NULL,
  nombre_usuario TEXT UNIQUE NOT NULL,
  contrasena_hash TEXT NOT NULL,
  genero TEXT CHECK(genero IN ('masculino', 'femenino')) NOT NULL,
  rol TEXT DEFAULT 'alumno' CHECK(rol IN ('alumno', 'profesor')),
  nivel INTEGER DEFAULT 1,
  puntos_total INTEGER DEFAULT 0,
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  ultimo_acceso DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: progreso_alumno (progreso por continente)
CREATE TABLE IF NOT EXISTS progreso_alumno (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  continente_id TEXT NOT NULL,
  retos_completados INTEGER DEFAULT 0,
  retos_totales INTEGER DEFAULT 3,
  puntaje_continente INTEGER DEFAULT 0,
  fecha_ultimo_acceso DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  UNIQUE(usuario_id, continente_id)
);

-- Tabla: historial_actividad (registro detallado de actividad)
CREATE TABLE IF NOT EXISTS historial_actividad (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  tipo_actividad TEXT NOT NULL,
  puntaje_obtenido INTEGER DEFAULT 0,
  respuestas_correctas INTEGER DEFAULT 0,
  respuestas_totales INTEGER DEFAULT 0,
  tiempo_segundos INTEGER,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla: preguntas_personalizadas (profesor puede crear sus propias preguntas)
CREATE TABLE IF NOT EXISTS preguntas_personalizadas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creado_por TEXT NOT NULL DEFAULT 'sistema',
  tipo TEXT NOT NULL,
  continente_id TEXT,
  pregunta TEXT NOT NULL,
  opciones TEXT NOT NULL,
  respuesta_correcta INTEGER NOT NULL,
  puntos INTEGER DEFAULT 10,
  tiempo_limite INTEGER DEFAULT 30,
  activa INTEGER DEFAULT 1,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: configuracion_temporizador (tiempos por nivel)
CREATE TABLE IF NOT EXISTS configuracion_temporizador (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nivel_desde INTEGER NOT NULL,
  nivel_hasta INTEGER NOT NULL,
  tiempo_segundos INTEGER NOT NULL DEFAULT 30,
  activo INTEGER DEFAULT 1
);

-- Tabla: configuracion_sistema (pares clave-valor)
CREATE TABLE IF NOT EXISTS configuracion_sistema (
  clave TEXT PRIMARY KEY,
  valor TEXT NOT NULL,
  descripcion TEXT
);

-- Tabla: logros (catálogo de logros disponibles)
CREATE TABLE IF NOT EXISTS logros (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clave TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  icono TEXT NOT NULL DEFAULT '🏆',
  categoria TEXT NOT NULL DEFAULT 'general',
  condicion_tipo TEXT NOT NULL,
  condicion_valor INTEGER NOT NULL DEFAULT 1,
  puntos_recompensa INTEGER DEFAULT 0
);

-- Tabla: logros_usuario (logros desbloqueados por cada usuario)
CREATE TABLE IF NOT EXISTS logros_usuario (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  logro_id INTEGER NOT NULL,
  fecha_desbloqueado DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (logro_id) REFERENCES logros(id) ON DELETE CASCADE,
  UNIQUE(usuario_id, logro_id)
);
`;

module.exports = schemaSQL;
