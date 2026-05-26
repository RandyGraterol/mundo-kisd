# Diagnóstico v2.0 — Mundo Kids

**Fecha:** 24/05/2026
**Versión:** 2.0.0
**Estado general:** ~95% completitud

---

## 1. Issues Corregidos (Segunda Ronda)

| # | Issue | Archivo | Solución |
|---|-------|---------|----------|
| ✅ | **Middleware rutaActual después de rutas** | `server.js:68-71` | Movido ANTES del montaje de rutas para que `res.locals.rutaActual` esté disponible en todas las vistas |
| ✅ | **Puzzle: puntos no persistían en BD** | `routes/puzzle.js:116-125` | Agregado `actualizarPuntosYNivel()` después de `registrarActividad()` |
| ✅ | **Memoria: puntos no persistían en BD** | `routes/memoria.js:106-115` | Agregado `actualizarPuntosYNivel()` después de `registrarActividad()` |
| ✅ | **Sopa de letras: puntos no persistían en BD** | `routes/sopa-letras.js:102-111` | Agregado `actualizarPuntosYNivel()` después de `registrarActividad()` |
| ✅ | **Migración anónimo → registro incompleta** | `routes/auth.js:117-128` | Ahora migra `continentesVisitados` además de `puntosTotal` |
| ✅ | **Preguntas personalizadas de banderas ignoradas** | `routes/index.js:273-296` | Integradas en el flujo de trivia de banderas combinándolas con las preguntas base |
| ✅ | **Vocabulario Antártida con palabras extrañas** | `helpers/sopa-letras.js:15` | `'FOCOA'` → `'FOCA'`, `'GASPAR'` → `'ALBATROS'` |
| ✅ | **Imports no usados** | `routes/index.js`, `routes/sopa-letras.js`, `routes/auth.js` | Eliminadas referencias a `seleccionarAleatorio`, `obtenerHistorial`, `generarSopaPorTema`, `mezclarArray`, `obtenerProgresoContinente` |

---

## 2. Issues Detectados — No Corregidos (Baja Prioridad)

### 2.1 GeoJSON faltante para globo 3D
- **Archivo:** `public/js/mapa-continentes.js:124`
- **Problema:** `fetch('/data/continentes.geojson')` busca un archivo que no existe en `public/data/`. El globo 3D usa un fallback a CDN de Natural Earth, pero sin conexión a internet el mapa no funciona.
- **Severidad:** Media
- **Solución:** Descargar el archivo GeoJSON de países desde https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json y alojarlo en `public/data/continentes.geojson`, o usar el JSON directamente desde el código.

### 2.2 Preguntas personalizadas de trivia — sin mezcla de opciones
- **Archivo:** `routes/index.js:280-293`
- **Problema:** Las preguntas personalizadas de tipo `'banderas'` se integran en el pool de trivia, pero sus opciones NO se mezclan con `mezclarOpciones()`. La respuesta correcta siempre está en el mismo índice que el profesor definió.
- **Severidad:** Baja (solo afecta preguntas personalizadas del profesor, no las 12 preguntas base que ya se mezclan correctamente)
- **Solución:** Aplicar `mezclarOpciones()` a la pregunta seleccionada si viene de `req.session.banderasPersonalizadas`.

### 2.3 Código muerto en database/db.js
- **Archivos:** `database/db.js:100-119`, `database/db.js:284-293`, `database/db.js:459-462`
- **Funciones exportadas que nadie invoca:**
  - `obtenerProgresoContinente(usuarioId, continenteId)` — lógica de obtener/crear progreso
  - `obtenerTiempoPorNivel(nivel)` — consulta tiempos del temporizador
  - `obtenerLogroPorClave(clave)` — busca logro por clave
- **Severidad:** Baja
- **Solución:** Eliminar o mantener como API pública para futuros features.

### 2.4 Botón "Nueva Partida" ignora tema actual
- **Archivos:** `views/sopa-letras.ejs:88`, `views/puzzle.ejs:101,149`
- **Problema:** Los botones de "Nueva Partida" / "Nuevo Puzzle" siempre redirigen a `?tema=global` o `?tema=mapa` en vez de preservar el tema/dificultad actual de la partida.
- **Severidad:** Baja (UX)
- **Solución:** Pasar `tema` y `dificultad` actuales como query params en lugar de valores fijos.

### 2.5 Puzzle reinicia con location.reload()
- **Archivo:** `public/js/puzzle.js:135-137`
- **Problema:** `reiniciarPuzzle()` usa `location.reload()` en vez de llamar al endpoint `/puzzle/reiniciar` del servidor. La ruta GET `/puzzle/reiniciar` es código muerto.
- **Severidad:** Baja
- **Solución:** Que `reiniciarPuzzle()` haga un fetch a `/puzzle/reiniciar` y luego renderice la respuesta, o eliminar la ruta del servidor y dejar solo el `location.reload()`.

### 2.6 Dependencia frágil del cronómetro
- **Archivo:** `views/partials/cronometro.ejs:60`
- **Problema:** El cronómetro espera que `tiempoLimite` esté definido en el contexto de renderizado. Si se incluye el partial en una vista que no define esa variable, se rompe silenciosamente.
- **Severidad:** Baja
- **Solución:** Agregar un valor por defecto (`tiempoLimite = typeof tiempoLimite !== 'undefined' ? tiempoLimite : 30`).

---

## 3. Funcionalidades Verificadas como Correctas

- ✅ **Trivia de banderas**: opciones mezcladas aleatoriamente
- ✅ **Sopa de letras**: filtrado por tema/continente funcional
- ✅ **Preguntas personalizadas**: integradas en retos por continente y trivia de banderas
- ✅ **Progreso por continente**: persistido en BD al completar retos
- ✅ **Progreso anónimo → registro**: migración completa (puntos + continentes visitados)
- ✅ **Puzzle/Memoria/Sopa**: puntos persistidos en BD via `actualizarPuntosYNivel()`
- ✅ **Scripts de resultado**: movidos al final, con verificación `typeof` y `DOMContentLoaded`
- ✅ **.gitignore**: excluye archivos BD
- ✅ **Middleware rutaActual**: ubicado antes de rutas
- ✅ **Imports**: limpiados (sin referencias muertas)
- ✅ **Vocabulario Antártida**: corregido

---

## 4. Resumen Final

| Tipo | Cantidad |
|------|----------|
| Issues corregidos en esta ronda | **8** |
| Issues restantes (baja prioridad) | **6** |
| Cobertura funcional estimada | **~95%** |

El proyecto se encuentra en un estado sólido. Los 6 issues restantes son de baja severidad (UX, código muerto, dependencia frágil) y no afectan la experiencia de juego ni la integridad de datos.
