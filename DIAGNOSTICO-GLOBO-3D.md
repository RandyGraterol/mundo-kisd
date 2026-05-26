# 🌍 Diagnóstico del Globo Terráqueo 3D — Mundo Kids

> **Fecha:** 25 de mayo de 2026
> **Propósito:** Documentar la arquitectura, tecnologías, problemas detectados y soluciones aplicadas al mapa interactivo 3D de continentes.

---

## 1. Resumen Ejecutivo

El globo terráqueo 3D de Mundo Kids presenta **problemas severos de visualización**: no se renderiza la esfera del planeta, solo se ven fragmentos de geometría azul recortados y un label flotante "Asia". Tras aplicar correcciones (eliminar instancia duplicada de Three.js, mejorar atmósfera, agregar campo estelar), el globo sigue **distorsionado y sin apreciarse correctamente**.

---

## 2. Arquitectura del Sistema

### 2.1 Stack Tecnológico

| Componente | Tecnología | Versión | Fuente |
|---|---|---|---|
| Motor 3D | **globe.gl** (incluye Three.js) | 2.32.2 | CDN jsdelivr |
| Motor Gráfico Subyacente | **Three.js** (embebido en globe.gl) | ~0.160.0 | Bundle interno |
| Datos Geográficos | **Natural Earth** (110m resolución) | v4.1.0 | `/public/data/continentes.geojson` |
| Textura Tierra | **NASA Blue Marble** | — | `unpkg.com/three-globe/` |
| Textura Relieve | **Earth Topology** | — | `unpkg.com/three-globe/` |
| Fondo Estelar | **Canvas 2D** (nativo) | — | Implementación propia |
| Servidor | **Express.js** | 4.18.2 | `server.js` |
| Plantillas | **EJS** | 3.1.9 | `views/continentes.ejs` |
| Estilos | **CSS3** + Tailwind (offline) | — | `public/css/mapa-estilos.css` |

### 2.2 Archivos Clave

| Archivo | Rol | Líneas |
|---|---|---|
| `public/js/mapa-continentes.js` | Lógica del globo, datos, eventos, campo estelar | ~580 |
| `views/continentes.ejs` | Vista principal con CDN de globe.gl y estilos | ~170 |
| `public/css/mapa-estilos.css` | Estilos del contenedor del globo | ~60 |
| `public/data/continentes.geojson` | ~240 países con límites geográficos | ~488,000 chars |
| `public/css/estilos-globales.css` | Estilos base + glassmorphism | ~140 |

### 2.3 Flujo de Carga

```
1. DOMContentLoaded
2. setTimeout(200ms) → iniciarGlobo()
3.   ├─ crearCampoEstelar()         ← canvas 2D con estrellas + Vía Láctea
4.   ├─ fetch(/data/continentes.geojson)
5.   │   └─ agruparPorContinente()  ← mapea Natural Earth → IDs app
6.   └─ crearGlobo(container)
7.       ├─ Globe()(container)      ← instancia globe.gl
8.       ├─ globeImageUrl()         ← textura NASA Blue Marble
9.       ├─ bumpImageUrl()          ← mapa de relieve
10.      ├─ polygonsData()          ← 240+ polígonos de países
11.      ├─ htmlElementsData()      ← 21 marcadores de países
12.      └─ controls.autoRotate     ← rotación suave automática
```

---

## 3. Problemas Detectados

### 🔴 PROBLEMA 1 (CRÍTICO): Instancia Duplicada de Three.js

**Estado:** ⚠️ Corregido parcialmente — se eliminó el script separado, pero **persiste incertidumbre sobre si globe.gl realmente incluye Three.js**.

**Evidencia:**
```
WARNING: Multiple instances of Three.js being imported.
```

**Causa raíz:** Se cargaban dos archivos:
```html
<!-- ❌ CARGA DUPLICADA: -->
<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/globe.gl@2.32.2/dist/globe.gl.min.js"></script>
```

Además, un hack problemático:
```html
<!-- ❌ INTERFIERE CON DETECCIÓN UMD: -->
<script>window.exports = {};</script>
```

**⚠️ NOTA IMPORTANTE sobre si globe.gl incluye Three.js:**

El archivo `globe.gl.min.js` pesa ~1 MB, lo cual **sugiere** que incluye Three.js, pero no es concluyente. globe.gl v2.x declara `three` como peer dependency en npm. El bundle UMD podría incluir:
- **Opción A:** Three.js completo (1 MB tendría sentido: ~670 KB three.js + ~350 KB globe.gl + three-globe)
- **Opción B:** Solo sus propias dependencias (three-globe + kapsule + d3-*) y espera `window.THREE` global

**📌 Verificación necesaria en navegador:**
```javascript
// Antes de la corrección (con three.js separado):
typeof THREE     // 'object'
typeof Globe     // 'function'

// Después de la corrección (sin three.js separado):
typeof THREE     // ???  Si es 'undefined' → globe.gl NO incluye Three.js → hay que volver a cargarlo
typeof Globe     // 'function'
```

**Impacto:** Dos instancias de Three.js causan:
- Materiales incompatibles entre instancias
- Shaders que fallan silenciosamente
- Renderizado roto (geometría existe pero no se muestra)
- Controles Orbit dañados

**Corrección aplicada:** Eliminar `<script src="three.min.js">` y `<script>window.exports={}</script>`. Mantener solo `globe.gl.min.js`.

---

### 🔴 PROBLEMA 2 (CRÍTICO): Distorsión y clipping del globo

**Estado:** ❌ Persiste — el usuario reporta que "el globo está distorsionado y no se aprecia correctamente".

**Causas probables (múltiples):**

| Síntoma | Posible causa | Prioridad |
|---|---|---|
| Geometría azul fragmentada en esquina | Clipping incorrecto o cámara mal posicionada | Alta |
| Globo no se ve como esfera | Escala incorrecta del mesh | Alta |
| "Asia" label visible pero continentes no | Overlay HTML funciona, render 3D falla | Alta |
| Solo fragmentos en esquina inferior derecha | Objeto fuera del frustum de cámara | Media |

**Código actual de cámara:**
```javascript
world.pointOfView({ lat: 15, lng: -20, altitude: 2.5 });
```

**Valores de cámara/control actuales:**
- `altitude: 2.5`
- `minDistance: 1.8`
- `maxDistance: 8`
- `autoRotateSpeed: 0.5`
- `dampingFactor: 0.08`

---

### 🟡 PROBLEMA 3: Contraste y visibilidad del fondo

**Estado:** ⚠️ Mejorado pero insuficiente

**Fondo del contenedor:**
```css
background: radial-gradient(ellipse at center, #132743 0%, #0a1628 40%, #050d1a 100%);
box-shadow: inset 0 0 100px rgba(59, 130, 246, 0.08);
```

**Análisis de colores:**
- `#132743` = RGB(19, 39, 67) → muy oscuro
- `#0a1628` = RGB(10, 22, 40) → extremadamente oscuro
- `#050d1a` = RGB(5, 13, 26) → casi negro

El fondo oscuro "se come" al globo, especialmente si los materiales tienen poca iluminación.

---

### 🟡 PROBLEMA 4: Iluminación de Three.js

**Estado:** ❓ No verificado — no se configura iluminación explícita.

globe.gl usa Three.js internamente. Si usa `MeshStandardMaterial` o `MeshPhysicalMaterial` para el globo, necesita:
- `AmbientLight` (iluminación base)
- `DirectionalLight` (luz direccional para sombras/detalles)
- `HemisphereLight` (luz de ambiente + cielo)

Si globe.gl no configura estas luces automáticamente, el globo aparece **completamente negro**.

**Evidencia de posible problema de iluminación:**
```
WARNING: property .useLegacyLights has been deprecated
```

Esto sugiere que:
1. El código o globe.gl usa iluminación legacy
2. Pero los materiales modernos (`MeshStandardMaterial`) no reciben luz adecuada
3. Resultado: geometría visible → negra

---

### 🟡 PROBLEMA 5: Fallback de texturas sin verificación

**Estado:** ⚠️ Implementado pero frágil

```javascript
const TEXTURAS_TIERRA = [
  'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
  'https://unpkg.com/three-globe/example/img/earth-day.jpg',
  'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg'
];
```

Solo se usa `TEXTURAS_TIERRA[0]`, sin verificar si la textura cargó. Si la CDN de unpkg falla (lento, bloqueado por región), el globo se renderiza sin textura (sólido oscuro).

---

### 🟢 PROBLEMA 6 (MENOR): Canvas de estrellas sobre el globo

**Estado:** ✅ Corregido

El canvas de estrellas (`z-index: 1`) y el canvas de Three.js (`z-index: 2`) están correctamente apilados. El loading overlay está en `z-index: 3`.

---

## 4. Tecnologías en Detalle

### 4.1 globe.gl
- **Propósito:** Renderizar globos terráqueos 3D interactivos con datos geográficos
- **API principal usada:**
  - `Globe()` — constructor
  - `.globeImageUrl()` — textura superficial
  - `.bumpImageUrl()` — mapa de relieve
  - `.polygonsData()` — datos de polígonos
  - `.polygonGeoJsonGeometry()` — geometría GeoJSON
  - `.polygonCapColor()` — color de relleno
  - `.htmlElementsData()` — marcadores HTML
  - `.pointOfView()` — posición de cámara
  - `.controls()` — controles Orbit

### 4.2 Three.js (embebido en globe.gl)
- **Renderiza:** Escena 3D, cámara, luces, materiales
- **No se usa directamente** — toda la interacción es vía API de globe.gl
- **Dependencia crítica:** Si la versión de Three.js en globe.gl no coincide con la configuración de luces/materiales esperada

### 4.3 Natural Earth GeoJSON
- **Formato:** GeoJSON FeatureCollection
- **Resolución:** 110m (escala 1:110 millones)
- **Países:** ~240 entidades (incluyendo dependencias)
- **Propiedad clave:** `properties.CONTINENT` → usado para mapear a IDs de la app
- **Archivo:** `public/data/continentes.geojson` → **488,003 caracteres**

### 4.4 Canvas 2D (campo estelar)
- **Tipo:** `<canvas>` 2D nativo
- **Propósito:** Fondo decorativo (estrellas + Vía Láctea)
- **Optimización:** Vía Láctea renderizada en offscreen canvas (una sola vez)
- **Animación:** `requestAnimationFrame` con parpadeo sinusoidal
- **Densidad galáctica:** Distribución gaussiana de estrellas centrada en la Vía Láctea

---

## 5. Correcciones Aplicadas

### ✅ Corrección 1: Eliminación de Three.js duplicado
**Archivo:** `views/continentes.ejs`
- Eliminado `<script src="three@0.160.0/three.min.js">`
- Eliminado `<script>window.exports = {}</script>`
- Agregado comentario: "Globe.gl incluye Three.js internamente"

### ✅ Corrección 2: Mejora de atmósfera
**Archivo:** `public/js/mapa-continentes.js`
- Color de atmósfera: `#3b82f6` → `#38bdf8` (más brillante)
- Altitud atmósfera: `0.15` → `0.25`
- Cámara: `altitude: 2.2` → `2.5`
- Controles: damping 0.05→0.08, rotateSpeed 0.5

### ✅ Corrección 3: Campo estelar + Vía Láctea
**Archivo:** `public/js/mapa-continentes.js`
- Nueva función `crearCampoEstelar()` con canvas 2D
- ~300-500 estrellas con parpadeo suave
- Densidad galáctica (más estrellas cerca de la Vía Láctea)
- Vía Láctea con gradientes radiales en offscreen canvas

### ✅ Corrección 4: Aclarado del fondo
**Archivo:** `views/continentes.ejs`
- Fondo: `#0c1929` → `#132743` (~12% más brillante)
- Ajuste de `z-index` entre capas

---

## 6. Problemas Persistentes

### 🚨 6.1 El globo sigue distorsionado

**Hipótesis más probable:** El problema **no** es la instancia duplicada de Three.js (ya corregida), sino que:

1. **La cámara está dentro de la esfera** o muy cerca
2. **La escala del mesh del globo es incorrecta** — puede estar en `0.001` o `1000`
3. **El material del globo no recibe luz** (negro sobre fondo oscuro = invisible)
4. **El campo estelar canvas podría estar cubriendo o interfiriendo** con el render 3D

### 🚨 6.2 Posible incompatibilidad de versiones

globe.gl v2.32.2 puede esperar una versión específica de Three.js. Si el bundle incluye una versión desactualizada, o si hay conflictos con `ES modules` vs `UMD`, el render puede fallar.

### 🚨 6.3 Problema de carga del GeoJSON

El archivo `continentes.geojson` tiene **488,003 caracteres** y ~240 países. El proceso de `fetch` + parseo + `agruparPorContinente` + creación de 240+ polígonos es pesado para un navegador. Podría haber un timeout o error silencioso.

### 🚨 6.4 El loading overlay puede no estar ocultándose

Si el fetch del GeoJSON falla, el loading overlay queda visible y nunca se muestra el globo.

### 🚨 6.5 El CDN de globe.gl podría no estar cargando

Si el CDN de jsdelivr está lento, bloqueado por región, o hay un error de red, `globe.gl.min.js` nunca se descarga. Como `Globe()` se llama dentro de `setTimeout` con 200ms de retraso, si el script no cargó en ese tiempo, todo falla silenciosamente y solo se ve el loading o el fondo oscuro.

**Verificación:** En la pestaña Network del navegador, buscar `globe.gl.min.js`. Debe mostrar status `200` y tamaño ~1 MB.

---

## 7. Plan de Debugging Paso a Paso

### ✅ Checklist para verificación inmediata (en navegador)

```
[ ] 1. Abrir Consola (F12 → Console)
[ ] 2. Abrir Pestaña Network (F12 → Network)
[ ] 3. Verificar que globe.gl.min.js cargó (status 200, ~1 MB)
[ ] 4. Ejecutar en consola: typeof Globe → debe ser 'function'
[ ] 5. Ejecutar en consola: typeof THREE → debe ser 'object' (si globe.gl incluye Three.js)
[ ] 6. Verificar que NO hay errores rojos en consola
[ ] 7. Verificar que el loading overlay desapareció
[ ] 8. Verificar cuántos canvas hay: document.querySelectorAll('#mapa-mundo canvas').length
```

### 7.1 Prueba de contraste del fondo

Si el globo sigue invisible, **probar con fondo mucho más claro** para descartar que sea un problema de contraste:

```css
/* Temporal: reemplazar el fondo oscuro */
#mapa-mundo {
  background: #1a2a4a !important; /* mucho más claro que #050d1a */
}
```

Si el globo se vuelve visible → el problema es **iluminación insuficiente** (no clipping ni escala).

### 7.2 Prueba de globo mínimo

Crear un globo sin polígonos, sin marcadores, solo textura para aislar el problema:

```javascript
function probarGloboMinimo() {
  const container = document.getElementById('mapa-mundo');
  const g = Globe()(container);
  g.backgroundColor('rgba(0,0,0,0)');
  g.globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');
  g.pointOfView({ lat: 0, lng: 0, altitude: 2 });
  g.showAtmosphere(true);
  g.atmosphereColor('#38bdf8');
  g.atmosphereAltitude(0.25);
}
```

Si este globo mínimo se ve bien → el problema está en los datos (polígonos, marcadores, o la función `agruparPorContinente`).

### 7.3 Verificar iluminación

globe.gl no expone API directa para luces. Para diagnosticar:

```javascript
// Intentar acceder a la escena Three.js internamente
if (world && world._globe) {
  const scene = world._globe.scene();
  console.log('Luces en escena:', scene.children.filter(c => c.isLight));
}
```

Opciones si el problema es iluminación:
1. Hacer fork o extender globe.gl
2. Usar `world._globe` para agregar luces programáticamente
3. Migrar a Three.js nativo con configuración explícita

### 7.4 Alternativa: Three.js nativo

Si globe.gl sigue sin funcionar después de todas las pruebas, migrar a Three.js nativo:

```javascript
// En views/continentes.ejs:
<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three-globe@2.24.13/dist/three-globe.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three/addons/controls/OrbitControls.js"></script>
```
Esto da control total sobre luces, materiales, cámara y renderizador.

---

## 8. Resumen de Archivos Modificados

| Archivo | Cambio | Estado |
|---|---|---|
| `views/continentes.ejs` | Eliminar Three.js duplicado + mejoras CSS | ✅ |
| `public/js/mapa-continentes.js` | Atmósfera, cámara, campo estelar, Vía Láctea | ✅ |
| `public/css/mapa-estilos.css` | Ajustes responsive, brillo | ✅ |
| `DIAGNOSTICO-GLOBO-3D.md` | Este documento | ✅ |

---

## 9. Conclusión

El globo 3D tiene una **combinación de problemas**:

1. **Causa raíz original:** Instancia duplicada de Three.js (corregida, pero requiere verificación en navegador)
2. **Problema actual más probable:** Iluminación insuficiente o nula para los materiales modernos de Three.js dentro de globe.gl
3. **Problema secundario:** Posible mala configuración de cámara/escala que causa clipping
4. **Factor agravante:** Fondo extremadamente oscuro que oculta un globo que ya es oscuro por falta de luz

### 🔜 Próximos pasos recomendados

1. ✅ **[HECHO]** Eliminar instancia duplicada de Three.js
2. ✅ **[HECHO]** Mejorar atmósfera y controles de cámara
3. ✅ **[HECHO]** Agregar campo estelar + Vía Láctea
4. ✅ **[HECHO]** Aclarar fondo del contenedor
5. ⬜ **[PENDIENTE]** Verificar en navegador siguiendo el checklist de la sección 7
6. ⬜ **[PENDIENTE]** Si `typeof THREE === 'undefined'`, restaurar carga de Three.js separado
7. ⬜ **[PENDIENTE]** Probar globo mínimo sin polígonos
8. ⬜ **[PENDIENTE]** Probar con fondo más claro (#1a2a4a)
9. ⬜ **[PENDIENTE]** Si persiste, considerar migrar a Three.js nativo

---

*Documento generado por asistente de diagnóstico — Mundo Kids Platform*
