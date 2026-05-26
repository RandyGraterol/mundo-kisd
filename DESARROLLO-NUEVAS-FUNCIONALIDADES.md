# 🧭 Nuevas Funcionalidades — Mundo Kids (Mejoras sobre el sistema existente)

> **Versión:** 2.0 (Plan de mejoras)
> **Proyecto base:** Mundo Kids v1.0 — Sistema **completamente funcional** (Express + EJS + Tailwind CSS)
> **Estado actual:** ✅ 16/16 tareas completadas — Servidor corriendo, vistas implementadas, mapa interactivo, retos por continente, trivia de banderas, sesiones de usuario, diseño responsive.
> **Objetivo de este plan:** Añadir autenticación real con base de datos, panel docente, experiencia de usuario mejorada (modal, cronómetro, confetti), y 3 nuevos minijuegos (sopa de letras, memoria, puzzle).

---

## 📋 Lo que ya existe (NO construir de nuevo)

El sistema actual ya tiene las siguientes funcionalidades **completamente operativas**:

| Funcionalidad | Archivos | Estado |
|---------------|----------|--------|
| Servidor Express + EJS Layouts | `server.js`, `views/layout.ejs` | ✅ Operativo |
| Sesiones de usuario (nombre + género) | `routes/index.js` — `POST /menu`, `GET /salir` | ✅ Operativo |
| Pantalla de bienvenida con avatares | `views/bienvenida.ejs` | ✅ Operativo |
| Menú principal con progreso | `views/menu.ejs` | ✅ Operativo |
| Mapa mundial interactivo (Globe.gl) | `views/continentes.ejs`, `public/js/mapa-continentes.js` | ✅ Operativo |
| Vista detallada de cada continente | `views/continente.ejs` | ✅ Operativo |
| Retos por continente (preguntas) | `views/reto.ejs`, `routes/index.js` — `GET /reto/:id` | ✅ Operativo |
| Trivia de banderas (12 preguntas) | `views/trivia-banderas.ejs`, `routes/index.js` — `GET /trivia-banderas` | ✅ Operativo |
| Resultados de respuestas | `views/resultado-reto.ejs`, `views/resultado-trivia.ejs` | ✅ Operativo |
| Datos educativos (6 continentes, 40+ países) | `data/continentes.js`, `data/banderas.js` | ✅ Operativo |
| Diseño responsive + glassmorphism | `public/css/estilos-globales.css` | ✅ Operativo |
| Manejo de errores | `views/error.ejs` | ✅ Operativo |
| Sistema de niveles y puntos | En sesión (`req.session.progreso`) | ✅ Operativo |
| Middleware de verificación de sesión | `routes/index.js` — `verificarSesion()` | ✅ Operativo |

### Árbol de archivos actual (lo que ya existe)

```
mundo-kids/
├── server.js
├── package.json
├── PROYECTO-COMPLETO.md
├── README.md
├── TESTING.md
├── INICIO-RAPIDO.md
│
├── routes/
│   └── index.js                    ← Contiene TODAS las rutas + middleware de sesión
│
├── data/
│   ├── continentes.js              ← Datos de 6 continentes con preguntas
│   └── banderas.js                 ← 12 preguntas de banderas
│
├── views/
│   ├── layout.ejs                  ← Layout base con Tailwind + estilos
│   ├── bienvenida.ejs              ← Formulario nombre + avatar
│   ├── menu.ejs                    ← Menú principal con progreso
│   ├── continentes.ejs             ← Mapa Globe.gl interactivo
│   ├── continente.ejs              ← Info detallada + reto
│   ├── reto.ejs                    ← Preguntas de opción múltiple
│   ├── resultado-reto.ejs          ← Resultado de respuesta
│   ├── trivia-banderas.ejs         ← Trivia de banderas
│   ├── resultado-trivia.ejs        ← Resultado de trivia
│   ├── error.ejs
│   │
│   ├── partials/
│   │   ├── header.ejs
│   │   ├── footer.ejs
│   │   └── boton.ejs
│
└── public/
    ├── css/
    │   ├── estilos-globales.css    ← Animaciones, glassmorphism, sombras
    │   └── mapa-estilos.css        ← Estilos del mapa
    └── js/
        └── mapa-continentes.js     ← Lógica del globo 3D
```

---

## 📋 Tabla de Contenidos (Nuevas implementaciones)

1. [Fase 1: Base de Datos y Autenticación Real](#fase-1-base-de-datos-y-autenticación-real)
2. [Fase 2: Panel Administrativo (Modo Profesor)](#fase-2-panel-administrativo-modo-profesor)
3. [Fase 3: Interfaz y Experiencia de Usuario (UI/UX)](#fase-3-interfaz-y-experiencia-de-usuario-uiux)
4. [Fase 4: Dinámica de Juegos — Minijuegos](#fase-4-dinámica-de-juegos--minijuegos)
5. [Fase 5: Gamificación, Perfiles y Experiencia Social](#fase-5-gamificación-perfiles-y-experiencia-social)
6. [Plan de Implementación por Tareas](#plan-de-implementación-por-tareas)
7. [Árbol de Archivos Final](#árbol-de-archivos-final-después-de-las-mejoras)
8. [Consideraciones para el Entorno Escolar](#consideraciones-para-el-entorno-escolar)

---

## Fase 1: Base de Datos y Autenticación Real

> **Estado actual:** La autenticación es mínima — solo nombre y género en sesión (`req.session`), sin persistencia, sin contraseñas, sin base de datos.
> **Objetivo:** Reemplazar la sesión en memoria por una base de datos SQLite con registro, login y persistencia real.

### 1.1 Motor de Base de Datos

**Elección recomendada:** SQLite (base de datos local, sin servidor, archivo único).

**Justificación para el entorno escolar:**
- No requiere instalar ni configurar un motor de base de datos separado.
- Todo vive en un archivo (`mundo-kids.db`) dentro del proyecto.
- Es portátil: se copia la carpeta y la base de datos viaja con ella.
- Funciona en equipos Canaima o computadoras sin conexión a internet.
- Suficiente para las necesidades de una escuela (cientos de estudiantes, no miles).

**Dependencia a instalar:**
```bash
npm install better-sqlite3
```

> ⚠️ **Nota para entornos escolares (Canaima, Linux ARM, etc.):** `better-sqlite3` requiere compilación nativa (C++). En equipos donde no se pueda compilar, usar la alternativa `sql.js` (implementación pura en JavaScript de SQLite, sin necesidad de compilación).
> ```bash
> npm install sql.js
> ```

### 1.2 Estructura de la Base de Datos (Schema)

**Archivo a crear:** `database/schema.js`

#### Tabla: `usuarios` (alumnos y profesores)

```sql
CREATE TABLE usuarios (
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
```

#### Tabla: `progreso_alumno`

```sql
CREATE TABLE progreso_alumno (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  continente_id TEXT NOT NULL,
  retos_completados INTEGER DEFAULT 0,
  retos_totales INTEGER DEFAULT 3,
  puntaje_continente INTEGER DEFAULT 0,
  fecha_ultimo_acceso DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  UNIQUE(usuario_id, continente_id)
);
```

#### Tabla: `historial_actividad`

```sql
CREATE TABLE historial_actividad (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  tipo_actividad TEXT NOT NULL,  -- 'reto', 'trivia', 'sopa', 'memoria', 'puzzle'
  puntaje_obtenido INTEGER DEFAULT 0,
  respuestas_correctas INTEGER DEFAULT 0,
  respuestas_totales INTEGER DEFAULT 0,
  tiempo_segundos INTEGER,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

#### Tabla: `preguntas_personalizadas`

```sql
CREATE TABLE preguntas_personalizadas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creado_por TEXT NOT NULL,       -- 'sistema' o nombre del profesor
  tipo TEXT NOT NULL,             -- 'continente', 'banderas'
  continente_id TEXT,
  pregunta TEXT NOT NULL,
  opciones TEXT NOT NULL,         -- JSON array: ["op1","op2","op3","op4"]
  respuesta_correcta INTEGER NOT NULL,
  puntos INTEGER DEFAULT 10,
  tiempo_limite INTEGER DEFAULT 30,
  activa INTEGER DEFAULT 1,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla: `configuracion_temporizador`

```sql
CREATE TABLE configuracion_temporizador (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nivel_desde INTEGER NOT NULL,
  nivel_hasta INTEGER NOT NULL,
  tiempo_segundos INTEGER NOT NULL DEFAULT 30,
  activo INTEGER DEFAULT 1
);
```

#### Tabla: `configuracion_sistema`

```sql
CREATE TABLE configuracion_sistema (
  clave TEXT PRIMARY KEY,
  valor TEXT NOT NULL,
  descripcion TEXT
);
```

### 1.3 Capa de Acceso a Datos

**Archivo a crear:** `database/db.js`

```javascript
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'mundo-kids.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function inicializarBaseDeDatos() {
  const schema = require('./schema');
  db.exec(schema);
}

module.exports = { db, inicializarBaseDeDatos };
```

### 1.4 Sistema de Autenticación

**Dependencia a instalar:** `bcryptjs` (hashing de contraseñas, funciona sin compilación nativa).
```bash
npm install bcryptjs
```

**Archivo a crear:** `routes/auth.js`

| Ruta | Método | Descripción |
|------|--------|-------------|
| `/auth/login` | GET | Muestra formulario de inicio de sesión |
| `/auth/login` | POST | Procesa login y crea sesión |
| `/auth/registro` | GET | Muestra formulario de registro |
| `/auth/registro` | POST | Procesa registro de nuevo alumno |
| `/auth/logout` | GET | Cierra sesión |

**Vistas a crear:**
- `views/auth/login.ejs`
- `views/auth/registro.ejs`

**Archivos a modificar:**
- `views/bienvenida.ejs` — Agregar enlaces a login/registro (actualmente solo tiene formulario directo)
- `routes/index.js` — Migrar `verificarSesion()` para que valide contra la BD
- `routes/index.js` — Migrar `POST /menu` a `POST /auth/login`
- `routes/index.js` — Migrar progreso de `req.session.progreso` a la BD

### 1.5 Script de Seed

**Archivo a crear:** `database/seed.js`

Ejecutar al iniciar el servidor por primera vez para:
1. Crear cuenta admin por defecto: usuario `profesor`, contraseña `admin123`
2. Insertar configuraciones de temporizador por defecto (nivel 1-3: 30s, nivel 4-6: 25s, nivel 7+: 20s)
3. Migrar datos de `data/continentes.js` y `data/banderas.js` a `preguntas_personalizadas` como preguntas del sistema
4. Insertar configuraciones del sistema por defecto

---

## Fase 2: Panel Administrativo (Modo Profesor)

> **Estado actual:** No existe. No hay distinción de roles ni interfaz para el profesor.
> **Objetivo:** Crear un panel completo para que el docente gestione contenido, configure tiempos y monitoree alumnos.

### 2.1 Middleware de Admin

**Archivo a crear:** `middleware/admin.js`

### 2.2 Rutas del Panel Admin

**Archivo a crear:** `routes/admin.js`

| Ruta | Método | Descripción |
|------|--------|-------------|
| `/admin` | GET | Dashboard principal |
| `/admin/contenido` | GET | Gestor de preguntas |
| `/admin/contenido/nueva` | GET | Formulario nueva pregunta |
| `/admin/contenido/nueva` | POST | Guardar nueva pregunta |
| `/admin/contenido/editar/:id` | GET | Editar pregunta |
| `/admin/contenido/editar/:id` | POST | Actualizar pregunta |
| `/admin/contenido/eliminar/:id` | POST | Desactivar pregunta |
| `/admin/temporizador` | GET | Configuración de tiempos |
| `/admin/temporizador` | POST | Guardar configuración |
| `/admin/monitoreo` | GET | Lista de alumnos |
| `/admin/monitoreo/:id` | GET | Detalle de alumno |

### 2.3 Vistas del Panel Admin

**Carpeta y archivos a crear:** `views/admin/`
- `views/admin/dashboard.ejs`
- `views/admin/contenido.ejs`
- `views/admin/contenido-form.ejs`
- `views/admin/temporizador.ejs`
- `views/admin/monitoreo.ejs`
- `views/admin/alumno-detalle.ejs`

### 2.4 Integración con rutas existentes

**Archivos a modificar:**
- `routes/index.js` — Las rutas de reto y trivia deben cargar preguntas también desde `preguntas_personalizadas`
- `routes/index.js` — Registrar actividad en `historial_actividad` al completar retos/trivias

---

## Fase 3: Interfaz y Experiencia de Usuario (UI/UX)

> **Estado actual:** El diseño ya es moderno con glassmorphism, animaciones y responsive. El fondo usa degradado suave blanco-azul (`bg-main-gradient`).
> **Objetivo:** Agregar fondo blanco estricto, modal de atención pre-juego, cronómetro visual, y confetti en aciertos.

### 3.1 Fondo Blanco

**Archivos a modificar:**
- `views/layout.ejs` — Cambiar clase `bg-main-gradient` por `bg-white`
- `public/css/estilos-globales.css` — Actualizar o eliminar `bg-main-gradient`

### 3.2 Modal de Atención (Antes de Trivias)

**Archivo a crear:** `views/partials/modal-atencion.ejs`

**Archivos a modificar:**
- `views/reto.ejs` — Incluir el partial, ocultar contenido hasta que el usuario confirme
- `views/trivia-banderas.ejs` — Incluir el partial, ocultar contenido hasta que el usuario confirme

### 3.3 Cronómetro Visual

**Archivo a crear:** `views/partials/cronometro.ejs`

**Archivos a modificar:**
- `views/reto.ejs` — Integrar cronómetro + auto-enviar al agotarse el tiempo
- `views/trivia-banderas.ejs` — Integrar cronómetro + auto-enviar al agotarse el tiempo

### 3.4 Microinteracciones de Logro (Confetti)

**Archivo a crear:** `views/partials/confetti.ejs`

**Archivo a modificar:**
- `views/resultado-reto.ejs` — Ejecutar `lanzarConfetti()` cuando `esCorrecta === true`
- `views/resultado-trivia.ejs` — Ejecutar `lanzarConfetti()` cuando `esCorrecta === true`

---

## Fase 4: Dinámica de Juegos — Minijuegos

> **Estado actual:** Solo existen Retos (preguntas por continente) y Trivia de Banderas — ambos funcionales.
> **Objetivo:** Agregar 3 nuevos minijuegos (sopa de letras, memoria, puzzle) y mejorar los existentes.

### 4.0 Mejoras a los juegos existentes

**Archivos a modificar:**
- `routes/index.js` — Agregar aleatorización (Fisher-Yates shuffle) a preguntas de retos y trivia
- `routes/index.js` — Mezclar opciones de respuesta y persistir índice correcto en sesión
- `views/reto.ejs` — Mejorar transiciones entre preguntas, indicador de progreso más vistoso
- `views/resultado-reto.ejs` — Agregar feedback visual detallado (verde/rojo en cada opción)

### 4.1 Helper de Aleatorización

**Archivo a crear:** `helpers/aleatorizacion.js`

### 4.2 Minijuego: Sopa de Letras

**Archivos a crear:**
- `routes/sopa-letras.js`
- `helpers/sopa-letras.js`
- `views/sopa-letras.ejs`
- `public/js/sopa-letras.js`

**Archivo a modificar:**
- `views/menu.ejs` — Reemplazar placeholder "Próximamente..." con enlace funcional

### 4.3 Minijuego: Juego de Memoria

**Archivos a crear:**
- `routes/memoria.js`
- `helpers/memoria.js`
- `views/memoria.ejs`
- `public/js/memoria.js`

**Archivo a modificar:**
- `views/menu.ejs` — Agregar enlace al juego de memoria

### 4.4 Minijuego: Rompecabezas (Puzzle)

**Archivos a crear:**
- `routes/puzzle.js`
- `helpers/puzzle.js`
- `views/puzzle.ejs`
- `public/js/puzzle.js`

**Archivo a modificar:**
- `views/menu.ejs` — Agregar enlace al rompecabezas

---

## Fase 5: Gamificación, Perfiles y Experiencia Social

> **Estado actual:** El sistema ya tiene juegos funcionales, autenticación real, panel de profesor y UI pulida. Pero al estudiante le falta motivación social: no puede ver su progreso histórico, no hay ranking, no hay logros.
> **Objetivo:** Agregar capa de gamificación (tabla de clasificación, logros, perfil), sonidos interactivos y modo offline total para entornos escolares.

### 5.1 Tabla de Clasificación (Leaderboard)

**Nueva tabla en BD:** No necesaria — se consulta directamente de `usuarios` ordenando por `puntos_total`.

**Archivo a crear:**
- `views/clasificacion.ejs` — Ranking visual con medallas, avatar, nivel

**Archivos a modificar:**
- `database/db.js` — Agregar `obtenerRanking(limite, pagina, filtro)` y `obtenerPosicionUsuario(usuarioId)`
- `routes/index.js` — Agregar ruta `GET /clasificacion` con parámetros de filtro
- `views/menu.ejs` — Agregar enlace a la tabla de clasificación

### 5.2 Logros e Insignias

**Nueva tabla en BD:** `logros` (catálogo de logros) y `logros_usuario` (logros desbloqueados por cada usuario)

**Archivos a crear:**
- `helpers/logros.js` — Catálogo de logros + funciones de verificación y desbloqueo
- `views/logros.ejs` — Galería de insignias con estado (bloqueado/desbloqueado)

**Archivos a modificar:**
- `database/schema.js` — Agregar tablas `logros` y `logros_usuario`
- `database/db.js` — Agregar funciones CRUD para logros
- `database/seed.js` — Insertar logros por defecto
- `middleware/auth.js` — Verificar logros al iniciar sesión
- `routes/index.js` — Verificar logros al completar actividades

### 5.3 Perfil de Alumno

**Archivos a crear:**
- `views/perfil.ejs` — Perfil completo: estadísticas, progreso por continente, historial, logros

**Archivos a modificar:**
- `routes/index.js` — Agregar ruta `GET /perfil`
- `views/menu.ejs` — Agregar enlace al perfil

### 5.4 Sonidos Interactivos

**Archivos a crear:**
- `public/js/sonidos.js` — Sistema de sonidos con Web Audio API (sin archivos externos)
- `views/partials/sonidos.ejs` — Inicialización de sonidos en el layout

**Archivos a modificar:**
- `views/layout.ejs` — Incluir el partial de sonidos
- `views/reto.ejs` — Sonido al responder (correcto/incorrecto)
- `views/trivia-banderas.ejs` — Sonido al responder
- `views/resultado-reto.ejs` — Sonido de logro + nivel subido
- `views/resultado-trivia.ejs` — Sonido de logro + nivel subido

### 5.5 Exportar Reportes CSV (Profesor)

**Archivos a modificar:**
- `routes/admin.js` — Agregar ruta `GET /admin/exportar/csv` que genera y descarga CSV
- `views/admin/dashboard.ejs` — Agregar botón de exportación

### 5.6 Modo Offline Total

**Archivos a modificar:**
- `views/layout.ejs` — Reemplazar CDN de Tailwind por archivo local, quitar dependencia de Google Fonts CDN (usar fallback)
- Descargar Tailwind CSS a `public/css/tailwind.min.css`

---

## Plan de Implementación por Tareas

### Fase 0: Preparación
| # | Tarea | Tipo | Archivos |
|---|-------|------|----------|
| 0.1 | Instalar `better-sqlite3` y `bcryptjs` | Instalación | `package.json` |
| 0.2 | Crear carpeta `database/` | Estructura | — |
| 0.3 | Crear carpeta `helpers/` | Estructura | — |
| 0.4 | Crear carpeta `middleware/` | Estructura | — |

### Fase 1: Base de Datos y Autenticación
| # | Tarea | Tipo | Archivos | Depende de |
|---|-------|------|----------|------------|
| 1.1 | Crear schema de base de datos (5 tablas) | **NUEVO** | `database/schema.js` | 0.2 |
| 1.2 | Crear capa de acceso a datos | **NUEVO** | `database/db.js` | 1.1 |
| 1.3 | Crear script de seed (admin, configs, migración de datos) | **NUEVO** | `database/seed.js` | 1.1, 1.2 |
| 1.4 | Crear rutas de autenticación (registro, login, logout) | **NUEVO** | `routes/auth.js` | 1.2 |
| 1.5 | Crear middleware de sesión contra BD | **NUEVO** | `middleware/auth.js` | 1.4 |
| 1.6 | Crear vistas login.ejs y registro.ejs | **NUEVO** | `views/auth/login.ejs`, `views/auth/registro.ejs` | 1.4 |
| 1.7 | **Modificar** bienvenida.ejs para redirigir a login/registro | **MODIFICAR** | `views/bienvenida.ejs` | 1.6 |
| 1.8 | **Modificar** routes/index.js: migrar progreso a BD, usar nuevo middleware | **MODIFICAR** | `routes/index.js` | 1.5 |
| 1.9 | **Modificar** server.js: inicializar BD al arrancar, montar rutas auth | **MODIFICAR** | `server.js` | 1.3, 1.4 |

### Fase 2: Panel Administrativo
| # | Tarea | Tipo | Archivos | Depende de |
|---|-------|------|----------|------------|
| 2.1 | Crear middleware de admin (verificar rol profesor) | **NUEVO** | `middleware/admin.js` | 1.5 |
| 2.2 | Crear rutas del panel admin | **NUEVO** | `routes/admin.js` | 2.1 |
| 2.3 | Crear gestor de contenido (CRUD preguntas) | **NUEVO** | En `routes/admin.js` | 2.2 |
| 2.4 | Crear configuración de temporizador | **NUEVO** | En `routes/admin.js` | 2.2 |
| 2.5 | Crear dashboard de monitoreo | **NUEVO** | En `routes/admin.js` | 2.2 |
| 2.6 | Crear vistas del panel admin (6 archivos) | **NUEVO** | `views/admin/*.ejs` | 2.2 |
| 2.7 | **Modificar** routes/index.js: cargar preguntas personalizadas desde BD | **MODIFICAR** | `routes/index.js` | 2.3 |
| 2.8 | **Modificar** routes/index.js: registrar historial de actividad | **MODIFICAR** | `routes/index.js` | 1.2 |

### Fase 3: UI/UX
| # | Tarea | Tipo | Archivos | Depende de |
|---|-------|------|----------|------------|
| 3.1 | **Modificar** layout.ejs y estilos-globales.css: fondo blanco estricto | **MODIFICAR** | `views/layout.ejs`, `public/css/estilos-globales.css` | — |
| 3.2 | Crear modal de atención reutilizable | **NUEVO** | `views/partials/modal-atencion.ejs` | — |
| 3.3 | Crear cronómetro visual reutilizable | **NUEVO** | `views/partials/cronometro.ejs` | — |
| 3.4 | Crear sistema de confetti | **NUEVO** | `views/partials/confetti.ejs` | — |
| 3.5 | **Modificar** reto.ejs y trivia-banderas.ejs: integrar modal + cronómetro | **MODIFICAR** | `views/reto.ejs`, `views/trivia-banderas.ejs` | 3.2, 3.3 |
| 3.6 | **Modificar** resultado-reto.ejs y resultado-trivia.ejs: agregar confetti | **MODIFICAR** | `views/resultado-reto.ejs`, `views/resultado-trivia.ejs` | 3.4 |

### Fase 4: Minijuegos
| # | Tarea | Tipo | Archivos | Depende de |
|---|-------|------|----------|------------|
| 4.1 | Crear helper de aleatorización | **NUEVO** | `helpers/aleatorizacion.js` | — |
| 4.2 | **Modificar** routes/index.js: integrar aleatorización en retos y trivia | **MODIFICAR** | `routes/index.js` | 4.1 |
| 4.3 | Crear helper de sopa de letras | **NUEVO** | `helpers/sopa-letras.js` | 4.1 |
| 4.4 | Crear rutas de sopa de letras | **NUEVO** | `routes/sopa-letras.js` | 4.3 |
| 4.5 | Crear vista + JS de sopa de letras | **NUEVO** | `views/sopa-letras.ejs`, `public/js/sopa-letras.js` | 4.4 |
| 4.6 | Crear helper de memoria | **NUEVO** | `helpers/memoria.js` | 4.1 |
| 4.7 | Crear rutas de memoria | **NUEVO** | `routes/memoria.js` | 4.6 |
| 4.8 | Crear vista + JS de memoria | **NUEVO** | `views/memoria.ejs`, `public/js/memoria.js` | 4.7 |
| 4.9 | Crear helper de puzzle | **NUEVO** | `helpers/puzzle.js` | 4.1 |
| 4.10 | Crear rutas de puzzle | **NUEVO** | `routes/puzzle.js` | 4.9 |
| 4.11 | Crear vista + JS de puzzle | **NUEVO** | `views/puzzle.ejs`, `public/js/puzzle.js` | 4.10 |
| 4.12 | **Modificar** menu.ejs: enlaces a nuevos minijuegos | **MODIFICAR** | `views/menu.ejs` | 4.5, 4.8, 4.11 |

### Fase 5: Gamificación, Perfiles y Experiencia Social
| # | Tarea | Tipo | Archivos | Depende de |
|---|-------|------|----------|------------|
| 5.1 | Descargar Tailwind CSS local + actualizar layout | **MODIFICAR** | `public/css/tailwind.min.css`, `views/layout.ejs` | — |
| 5.2 | Agregar `obtenerRanking()` y `obtenerPosicionUsuario()` en db.js | **MODIFICAR** | `database/db.js` | 1.1 |
| 5.3 | Crear ruta `GET /clasificacion` en routes/index.js | **MODIFICAR** | `routes/index.js` | 5.2 |
| 5.4 | Crear vista `views/clasificacion.ejs` | **NUEVO** | `views/clasificacion.ejs` | 5.3 |
| 5.5 | Crear ruta `GET /perfil` en routes/index.js | **MODIFICAR** | `routes/index.js` | 1.2 |
| 5.6 | Crear vista `views/perfil.ejs` | **NUEVO** | `views/perfil.ejs` | 5.5 |
| 5.7 | Agregar tablas `logros` y `logros_usuario` a schema.js | **MODIFICAR** | `database/schema.js` | 1.1 |
| 5.8 | Agregar funciones de logros a db.js | **MODIFICAR** | `database/db.js` | 5.7 |
| 5.9 | Crear `helpers/logros.js` (catálogo y verificación) | **NUEVO** | `helpers/logros.js` | 5.8 |
| 5.10 | Insertar logros por defecto en seed.js | **MODIFICAR** | `database/seed.js` | 5.9 |
| 5.11 | Crear vista `views/logros.ejs` | **NUEVO** | `views/logros.ejs` | 5.9 |
| 5.12 | Crear `public/js/sonidos.js` + `views/partials/sonidos.ejs` | **NUEVO** | `public/js/sonidos.js`, `views/partials/sonidos.ejs` | — |
| 5.13 | Integrar sonidos en layout y vistas de juego | **MODIFICAR** | `views/layout.ejs`, `views/reto.ejs`, `views/trivia-banderas.ejs`, `views/resultado-reto.ejs`, `views/resultado-trivia.ejs` | 5.12 |
| 5.14 | Agregar ruta exportar CSV en admin.js | **MODIFICAR** | `routes/admin.js`, `views/admin/dashboard.ejs` | 2.2 |
| 5.15 | Agregar enlaces en menu.ejs (clasificación, perfil, logros) | **MODIFICAR** | `views/menu.ejs` | 5.4, 5.6, 5.11 |

---

## Árbol de Archivos Final (Después de las mejoras)

```
mundo-kids/
├── server.js                          ← MODIFICADO (inicializar BD)
├── package.json                       ← MODIFICADO (nuevas dependencias)
├── DESARROLLO-NUEVAS-FUNCIONALIDADES.md
│
├── database/                          ← NUEVA CARPETA
│   ├── db.js                          ← NUEVO
│   ├── schema.js                      ← MODIFICADO (tablas logros)
│   ├── seed.js                        ← MODIFICADO (logros por defecto)
│   └── mundo-kids.db                  ← NUEVO (se genera al iniciar)
│
├── helpers/                           ← NUEVA CARPETA
│   ├── aleatorizacion.js              ← NUEVO
│   ├── sopa-letras.js                 ← NUEVO
│   ├── memoria.js                     ← NUEVO
│   ├── puzzle.js                      ← NUEVO
│   └── logros.js                      ← NUEVO (catálogo de logros)
│
├── middleware/                        ← NUEVA CARPETA
│   ├── auth.js                        ← NUEVO
│   └── admin.js                       ← NUEVO
│
├── routes/
│   ├── index.js                       ← MODIFICADO (BD, historial, aleatorización, clasificación, perfil)
│   ├── auth.js                        ← NUEVO
│   ├── admin.js                       ← NUEVO
│   ├── sopa-letras.js                 ← NUEVO
│   ├── memoria.js                     ← NUEVO
│   └── puzzle.js                      ← NUEVO
│
├── views/
│   ├── layout.ejs                     ← MODIFICADO (fondo blanco, Tailwind local, sonidos)
│   ├── bienvenida.ejs                 ← MODIFICADO (links a login/registro)
│   ├── menu.ejs                       ← MODIFICADO (enlaces a minijuegos, clasificación, perfil, logros)
│   ├── continentes.ejs                ← SIN CAMBIOS
│   ├── continente.ejs                 ← SIN CAMBIOS
│   ├── reto.ejs                       ← MODIFICADO (modal + cronómetro + aleatoriedad + sonidos)
│   ├── resultado-reto.ejs             ← MODIFICADO (confetti + sonidos)
│   ├── trivia-banderas.ejs            ← MODIFICADO (modal + cronómetro + aleatoriedad + sonidos)
│   ├── resultado-trivia.ejs           ← MODIFICADO (confetti + sonidos)
│   ├── error.ejs                      ← SIN CAMBIOS
│   ├── clasificacion.ejs              ← NUEVO (tabla de clasificación)
│   ├── perfil.ejs                     ← NUEVO (estadísticas del alumno)
│   ├── logros.ejs                     ← NUEVO (galería de insignias)
│   │
│   ├── auth/                          ← NUEVA CARPETA
│   │   ├── login.ejs                  ← NUEVO
│   │   └── registro.ejs               ← NUEVO
│   │
│   ├── admin/                         ← NUEVA CARPETA
│   │   ├── dashboard.ejs              ← MODIFICADO (botón exportar CSV)
│   │   ├── contenido.ejs              ← NUEVO
│   │   ├── contenido-form.ejs         ← NUEVO
│   │   ├── temporizador.ejs           ← NUEVO
│   │   ├── monitoreo.ejs              ← NUEVO
│   │   └── alumno-detalle.ejs         ← NUEVO
│   │
│   ├── sopa-letras.ejs                ← NUEVO
│   ├── memoria.ejs                    ← NUEVO
│   └── puzzle.ejs                     ← NUEVO
│
│   ├── partials/
│   │   ├── header.ejs                 ← SIN CAMBIOS
│   │   ├── footer.ejs                 ← SIN CAMBIOS
│   │   ├── boton.ejs                  ← SIN CAMBIOS
│   │   ├── modal-atencion.ejs         ← NUEVO
│   │   ├── cronometro.ejs             ← NUEVO
│   │   ├── confetti.ejs               ← NUEVO
│   │   └── sonidos.ejs                ← NUEVO (inicialización Web Audio API)
│
├── data/
│   ├── continentes.js                 ← SIN CAMBIOS
│   └── banderas.js                    ← SIN CAMBIOS
│
└── public/
    ├── css/
    │   ├── estilos-globales.css       ← MODIFICADO (fondo blanco)
    │   ├── mapa-estilos.css           ← SIN CAMBIOS
    │   └── tailwind.min.css           ← NUEVO (Tailwind local para offline)
    ├── js/
    │   ├── mapa-continentes.js        ← SIN CAMBIOS
    │   ├── sopa-letras.js             ← NUEVO
    │   ├── memoria.js                 ← NUEVO
    │   ├── puzzle.js                  ← NUEVO
    │   └── sonidos.js                 ← NUEVO (Web Audio API)
    └── images/                        ← SIN CAMBIOS
```

### Resumen de cambios

| Tipo | Cantidad |
|------|----------|
| Archivos **existentes SIN modificar** | 11 |
| Archivos **existentes a MODIFICAR** | 13 |
| Archivos **NUEVOS** a crear | ~30 |
| **Total** después de las mejoras | ~54 archivos |

---

## Dependencias npm a Instalar

```bash
# Fase 1 - Base de datos y autenticación
npm install better-sqlite3 bcryptjs

# Alternativa si better-sqlite3 no compila:
# npm install sql.js bcryptjs
```

> Fase 5 no requiere nuevas dependencias npm. Tailwind se descarga como archivo estático. Web Audio API es nativo del navegador.

---

## Flujo de Navegación (después de las mejoras)

```
                ┌──────────────────────┐
                │   / (bienvenida.ejs)  │
                │  Login / Registrarse  │
                └──────┬───────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
   /auth/login    /auth/registro   (sesión existente)
          └────────────┬───────────┘
                       │
          ┌────────────▼──────────────────────┐
          │         /menu (menu.ejs)           │
          │  Progreso + Perfil + Clasificación │
          │  + Logros (enlaces destacados)     │
          └──┬──────┬──────┬──────┬──────┬────┘
             │      │      │      │      │
     ┌───────┘      │      │      │      └──────────┐
     ▼              ▼      ▼      ▼                 ▼
 /continentes   /trivia-  /sopa-   /admin        /clasificacion
 (mapa + grid)  banderas   letras                (ranking)
     │                                            │
     ▼                                            ├── /perfil
 /continente/:id                                   └── /logros
     │                                     
     ├── /reto/:id → /resultado-reto
     ├── /memoria
     └── /puzzle
```

---

## Consideraciones para el Entorno Escolar

### Rendimiento
- SQLite es liviano y funciona bien en equipos Canaima (Venezuela) con recursos limitados.
- Si hay muchos estudiantes simultáneos (>30), considerar migrar a PostgreSQL a futuro.

### Despliegue en Red Local
- El profesor puede compartir la IP local del servidor para que todos los alumnos accedan.
- Ejemplo: `http://192.168.1.100:3000`

### Seguridad
- Contraseñas hasheadas con bcrypt (no en texto plano).
- Sesiones expiran después de 24 horas (ya configurado en `server.js`).
- Panel admin solo accesible para usuarios con rol `profesor`.

### Offline First
- ✅ **NUEVO en Fase 5:** Tailwind CSS local (sin CDN).
- ✅ **NUEVO en Fase 5:** Sonidos con Web Audio API (sin archivos MP3).
- La aplicación ya funciona sin internet (datos embebidos en el código).
- Las dependencias (`better-sqlite3`, `bcryptjs`) son locales, no requieren internet.

### Gamificación
- **Tabla de clasificación** motiva la competencia saludable.
- **Logros e insignias** reconocen el esfuerzo constante.
- **Perfil de alumno** permite al estudiante ver su propio crecimiento.

---

## Resumen de Esfuerzo Estimado

| Fase | Descripción | Archivos NUEVOS | Archivos a MODIFICAR | Tareas | Esfuerzo |
|------|-------------|----------------:|---------------------:|-------:|---------:|
| 0 | Preparación | 3 carpetas | 1 | 4 | 30 min |
| 1 | Base de Datos y Auth | 6 archivos | 3 | 9 | 4-6 h |
| 2 | Panel Admin | 8 archivos | 1 | 8 | 6-8 h |
| 3 | UI/UX | 3 archivos | 4 | 6 | 3-4 h |
| 4 | Minijuegos | 12 archivos | 2 | 12 | 12-16 h |
| 5 | Gamificación y Perfiles | ~6 archivos | ~8 archivos | 15 | 8-12 h |
| **Total** | — | **~30 archivos** | **~13 archivos** | **~54 tareas** | **34-46 h** |

---

> **Nota importante:** Este plan asume que el sistema base **ya está completo y funcional**. Cada tarea indica claramente si es un archivo NUEVO o si se MODIFICA uno existente. Se recomienda implementar las fases en orden (1 → 2 → 3 → 4 → 5) ya que cada fase depende de la anterior.
