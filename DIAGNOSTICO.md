# Diagnóstico del Proyecto Mundo Kids

**Fecha:** 24/05/2026
**Versión:** 2.0.0
**Stack:** Node.js + Express + SQLite + EJS + Tailwind CSS + Globe.gl

---

## Resumen General

El proyecto se encuentra en un **80-85% de completitud**. La arquitectura base está sólida: servidor funcional, base de datos con 7 tablas, sistema de autenticación dual (BD + sesión anónima), panel administrativo completo, 3 minijuegos operativos, y un sistema de gamificación (logros, ranking, perfil). Sin embargo, se detectaron **7 issues críticos** que afectan la experiencia del usuario y la integridad de los datos.

---

## Issues Críticos (Requieren atención inmediata)

### 1. Trivia de Banderas — Opciones sin mezclar

**Archivo:** `routes/index.js:270-283`
**Problema:** La función `obtenerPreguntaAleatoria()` selecciona una pregunta al azar pero **no mezcla las opciones de respuesta**. La respuesta correcta siempre ocupa el mismo índice.
**Impacto:** Los estudiantes pueden memorizar la posición de la respuesta correcta, invalidando el propósito educativo.
**Solución:** Aplicar `mezclarOpciones()` del helper `aleatorizacion.js` a las opciones antes de devolver la pregunta.

### 2. Progreso de Sesión Anónima no Persiste

**Archivo:** `routes/index.js:62-86`
**Problema:** Los usuarios que ingresan por "Quick Play" (sesión anónima) tienen su progreso almacenado únicamente en `req.session.progreso` (memoria). Si cierran el navegador o se registran después, todo el progreso se pierde.
**Impacto:** Frustración del usuario al perder puntos, niveles y logros obtenidos.
**Solución:** Implementar migración de progreso de sesión anónima a cuenta registrada, o persistir en BD con un identificador de dispositivo/cookie.

### 3. Sopa de Letras — Tema Ignorado

**Archivo:** `routes/sopa-letras.js:47`
**Problema:** `generarSopaLetras(tamano)` se invoca **sin pasar el `temaId`**. El parámetro se recibe del cliente pero nunca se usa. Siempre genera palabras del vocabulario global.
**Impacto:** El selector de temas/continentes en la vista de sopa de letras no tiene efecto. Todas las partidas usan las mismas palabras.
**Solución:** Pasar `temaId` a `generarSopaLetras(tamano, temaId)` y actualizar el helper para filtrar vocabulario por continente.

### 4. Preguntas Personalizadas del Profesor — No se Usan

**Archivo:** `routes/index.js:14`
**Problema:** Se importa `obtenerPreguntasPersonalizadas` desde `database/db.js` pero **nunca se invoca**. Las preguntas que el profesor crea desde el panel admin existen en BD pero son invisibles para los alumnos.
**Impacto:** Funcionalidad de valor pedagógico nula. El CRUD del panel admin es inútil.
**Solución:** Integrar `obtenerPreguntasPersonalizadas()` en los flujos de retos y trivia, combinándolas con las preguntas por defecto.

### 5. Progreso por Continente — Nunca se Actualiza

**Archivo:** `routes/index.js:9`
**Problema:** Se importa `actualizarProgresoContinente` desde `database/db.js` pero **nunca se llama**. Cuando un alumno completa un reto, su progreso por continente en BD no se actualiza.
**Impacto:** El perfil del alumno siempre muestra 0 retos completados por continente. El ranking puede estar desactualizado.
**Solución:** Llamar a `actualizarProgresoContinente()` después de cada reto completado exitosamente.

### 6. Orden de Carga de Scripts — Posible Error en Resultados

**Archivos:**
- `views/resultado-reto.ejs:15-16`
- `views/resultado-trivia.ejs:15-16`
**Problema:** Se invocan `lanzarConfetti()` y `lanzarFuegosArtificiales()` en un bloque `<script>` inline dentro de `<% if (esCorrecta) %>`. Si el partial `confetti.ejs` no se ha cargado completamente, las funciones no están definidas.
**Impacto:** Error "undefined is not a function" en consola, sin animación de celebración.
**Solución:** Mover las invocaciones dentro de un `DOMContentLoaded` o asegurar el orden de carga verificando que las funciones existan antes de llamarlas.

### 7. Base de Datos en el Repositorio

**Archivos:** `database/mundo-kids.db`, `database/mundo-kids.db-wal`, `database/mundo-kids.db-shm`
**Problema:** Los archivos de la base de datos SQLite están en el working directory y **no están en `.gitignore`**.
**Impacto:** Riesgo de subir datos de prueba/desarrollo al repositorio público.
**Solución:** Agregar `database/*.db`, `database/*.db-wal`, `database/*.db-shm` al `.gitignore`.

---

## Issues Menores

### 8. Variable `usuario` Indefinida en Modo Anónimo

**Archivo:** `views/menu.ejs:43,141`
**Problema:** Se usa `typeof usuario !== 'undefined'` para mostrar enlaces de perfil/logros/admin, pero la variable `usuario` nunca se define explícitamente para sesiones anónimas en `res.locals`.
**Impacto:** Bajo — las condiciones fallan correctamente a `false`, pero es frágil y podría romperse con cambios futuros.

### 9. Función `obtenerPreguntaAleatoria` — Código Duplicado Potencial

**Archivo:** `routes/index.js`
**Problema:** La lógica de selección aleatoria de preguntas está inline en la ruta de trivia, mientras que los retos manejan la aleatorización de forma diferente.
**Sugerencia:** Extraer a un helper compartido para mantener consistencia.

### 10. Seed Ejecutado en Cada Inicio del Servidor

**Archivo:** `server.js:53`
**Problema:** `ejecutarSeed()` se llama en cada arranque. Aunque tiene control interno (`seed_ejecutado`), es una operación I/O innecesaria.
**Sugerencia:** Ejecutar seed solo si la tabla está vacía o la BD no existe, en lugar de verificar cada vez.

---

## Funcionalidades Completas (Verificadas)

| Funcionalidad | Estado |
|---|---|
| Servidor Express con rutas y middlewares | ✅ Completo |
| Base de datos SQLite (7 tablas) | ✅ Completo |
| Autenticación (registro/login/logout) + sesión anónima | ✅ Completo |
| Panel Administrativo (dashboard, CRUD, monitoreo, CSV) | ✅ Completo |
| Globo 3D interactivo con Globe.gl | ✅ Completo |
| Retos por continente (18 preguntas) | ✅ Completo |
| Trivia de Banderas (12 preguntas) | ✅ Completo* |
| Sopa de Letras (generación, verificación) | ✅ Completo* |
| Juego de Memoria (cartas, pares, temas) | ✅ Completo |
| Rompecabezas/Puzzle (3 dificultades, drag&drop) | ✅ Completo |
| Sistema de Logros (20 insignias) | ✅ Completo |
| Ranking / Clasificación | ✅ Completo |
| Perfil de Alumno (estadísticas, progreso) | ✅ Completo |
| Sonidos (Web Audio API, 7 efectos) | ✅ Completo |
| Modal de Atención, Cronómetro, Confetti | ✅ Completo |
| Diseño responsive con Tailwind CSS | ✅ Completo |

*\* Funcionalidad operativa pero con bugs (ver issues críticos)*

---

## Funcionalidades No Implementadas (Fuera del Alcance Actual)

| Funcionalidad | Prioridad Sugerida |
|---|---|
| Videos educativos por continente | Baja |
| Service Worker / PWA (modo offline total) | Media |
| Capitales e información detallada de países | Baja |
| Modo multijugador | Muy Baja |

---

## Estadísticas del Proyecto

| Métrica | Valor |
|---|---|
| Archivos de código fuente | ~45 |
| Líneas de código estimadas | ~6,500+ |
| Vistas EJS | 21 |
| Rutas implementadas | ~30 |
| Minijuegos operativos | 3 |
| Preguntas de retos | 18 |
| Preguntas de trivia | 12 |
| Logros | 20 |
| Tablas en BD | 7 |
| Helpers | 5 |
| Middlewares | 2 |
| Tests | No implementados |
| Dependencias npm | 6 producción + 2 desarrollo |

---

## Prioridades de Acción Recomendadas

1. 🔴 **Trivial:** Mezclar opciones en trivia de banderas (bajo esfuerzo, alto impacto)
2. 🔴 **Sopa de Letras:** Pasar temaId al helper (bajo esfuerzo, alto impacto)
3. 🔴 **Preguntas personalizadas:** Integrar en flujo de retos (esfuerzo medio)
4. 🔴 **Progreso continente:** Llamar a actualizarProgresoContinente (bajo esfuerzo)
5. 🟡 **Progreso anónimo:** Migrar sesión a BD (esfuerzo alto)
6. 🟡 **Orden scripts:** Asegurar DOMContentLoaded (bajo esfuerzo)
7. 🟡 **.gitignore:** Excluir archivos BD (bajo esfuerzo)
8. 🟢 **Issues menores:** Refactorizar según disponibilidad
