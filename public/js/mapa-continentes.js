/**
 * 🌍 Mapa Interactivo 3D - Mundo Kids
 * 
 * Usa datos GeoJSON precisos de Natural Earth (110m resolución)
 * para dibujar los contornos exactos de los continentes sobre
 * un globo terráqueo 3D con textura real de la NASA.
 */

// Mapeo de continentes de Natural Earth a los IDs de la app
const MAPEO_CONTINENTES = {
  'North America': { id: 'america', nombre: 'América del Norte' },
  'South America': { id: 'america', nombre: 'América del Sur' },
  'Europe': { id: 'europa', nombre: 'Europa' },
  'Asia': { id: 'asia', nombre: 'Asia' },
  'Africa': { id: 'africa', nombre: 'África' },
  'Oceania': { id: 'oceania', nombre: 'Oceanía' },
  'Antarctica': { id: 'antartida', nombre: 'Antártida' }
};

// Nombres en español para tooltips
const NOMBRES_ES = {
  america: 'América',
  europa: 'Europa',
  asia: 'Asia',
  africa: 'África',
  oceania: 'Oceanía',
  antartida: 'Antártida'
};

// Colores por continente con opacidad visible sobre la textura
const COLORES_CONTINENTE = {
  america: { hover: 'rgba(236, 72, 153, 0.4)', base: 'rgba(236, 72, 153, 0.18)' },
  europa:  { hover: 'rgba(59, 130, 246, 0.4)',  base: 'rgba(59, 130, 246, 0.18)' },
  asia:    { hover: 'rgba(251, 191, 36, 0.4)',  base: 'rgba(251, 191, 36, 0.18)' },
  africa:  { hover: 'rgba(16, 185, 129, 0.4)',  base: 'rgba(16, 185, 129, 0.18)' },
  oceania: { hover: 'rgba(139, 92, 246, 0.4)',  base: 'rgba(139, 92, 246, 0.18)' },
  antartida: { hover: 'rgba(148, 163, 184, 0.4)', base: 'rgba(148, 163, 184, 0.18)' }
};

// URLs de texturas (múltiples fallbacks por si alguna CDN falla)
const TEXTURAS_TIERRA = [
  'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
  'https://unpkg.com/three-globe/example/img/earth-day.jpg',
  'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg'
];
const TEXTURAS_RELIEVE = [
  'https://unpkg.com/three-globe/example/img/earth-topology.png',
  'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png'
];

// Países importantes para mostrar marcadores educativos en el globo
const PAISES_DESTACADOS = [
  // ── AMÉRICA ──
  { id: 'canada',       nombre: 'Canadá',       lat: 56.1,  lng: -106.3, emoji: '🇨🇦', continente: 'america', color: '#f472b6' },
  { id: 'eeuu',         nombre: 'EE.UU.',        lat: 39.8,  lng: -98.6,  emoji: '🇺🇸', continente: 'america', color: '#f472b6' },
  { id: 'mexico',       nombre: 'México',        lat: 23.6,  lng: -102.6, emoji: '🇲🇽', continente: 'america', color: '#f472b6' },
  { id: 'brasil',       nombre: 'Brasil',        lat: -14.2, lng: -51.9,  emoji: '🇧🇷', continente: 'america', color: '#f472b6' },
  { id: 'argentina',    nombre: 'Argentina',     lat: -38.4, lng: -63.6,  emoji: '🇦🇷', continente: 'america', color: '#f472b6' },
  { id: 'colombia',     nombre: 'Colombia',      lat: 4.6,   lng: -74.1,  emoji: '🇨🇴', continente: 'america', color: '#f472b6' },
  // ── EUROPA ──
  { id: 'reino-unido',  nombre: 'Reino Unido',   lat: 55.4,  lng: -3.4,   emoji: '🇬🇧', continente: 'europa',  color: '#60a5fa' },
  { id: 'francia',      nombre: 'Francia',       lat: 46.6,  lng: 2.2,    emoji: '🇫🇷', continente: 'europa',  color: '#60a5fa' },
  { id: 'espana',       nombre: 'España',        lat: 40.5,  lng: -3.7,   emoji: '🇪🇸', continente: 'europa',  color: '#60a5fa' },
  { id: 'alemania',     nombre: 'Alemania',      lat: 51.1,  lng: 10.4,   emoji: '🇩🇪', continente: 'europa',  color: '#60a5fa' },
  { id: 'italia',       nombre: 'Italia',        lat: 41.9,  lng: 12.6,   emoji: '🇮🇹', continente: 'europa',  color: '#60a5fa' },
  // ── ASIA ──
  { id: 'rusia',        nombre: 'Rusia',         lat: 61.5,  lng: 89.9,   emoji: '🇷🇺', continente: 'asia',    color: '#fbbf24' },
  { id: 'china',        nombre: 'China',         lat: 35.9,  lng: 104.2,  emoji: '🇨🇳', continente: 'asia',    color: '#fbbf24' },
  { id: 'india',        nombre: 'India',         lat: 20.6,  lng: 78.9,   emoji: '🇮🇳', continente: 'asia',    color: '#fbbf24' },
  { id: 'japon',        nombre: 'Japón',         lat: 36.2,  lng: 138.3,  emoji: '🇯🇵', continente: 'asia',    color: '#fbbf24' },
  // ── ÁFRICA ──
  { id: 'egipto',       nombre: 'Egipto',        lat: 26.8,  lng: 30.8,   emoji: '🇪🇬', continente: 'africa',  color: '#34d399' },
  { id: 'nigeria',      nombre: 'Nigeria',       lat: 9.1,   lng: 8.7,    emoji: '🇳🇬', continente: 'africa',  color: '#34d399' },
  { id: 'kenia',        nombre: 'Kenia',         lat: -0.0,  lng: 37.9,   emoji: '🇰🇪', continente: 'africa',  color: '#34d399' },
  { id: 'sudafrica',    nombre: 'Sudáfrica',     lat: -30.6, lng: 22.9,   emoji: '🇿🇦', continente: 'africa',  color: '#34d399' },
  // ── OCEANÍA ──
  { id: 'australia',    nombre: 'Australia',     lat: -25.3, lng: 133.8,  emoji: '🇦🇺', continente: 'oceania', color: '#a78bfa' },
  { id: 'nz',           nombre: 'Nva. Zelanda',  lat: -41.5, lng: 172.8,  emoji: '🇳🇿', continente: 'oceania', color: '#a78bfa' }
];

// Variables globales del globo
let world = null;
let paisesPorContinente = {};
let campoEstelar = null; // Para limpiar animación si es necesario

/**
 * 🌟 Campo estelar animado con canvas 2D
 * Crea un fondo de estrellas con parpadeo suave detrás del globo 3D
 */
function crearCampoEstelar(container) {
  // Si ya existe, limpiar completamente (animación + observer + canvas)
  if (campoEstelar) {
    cancelAnimationFrame(campoEstelar.frameId);
    if (campoEstelar.observer) campoEstelar.observer.disconnect();
    const oldCanvas = container.querySelector('.campo-estelar-canvas');
    if (oldCanvas) oldCanvas.remove();
  }

  const canvas = document.createElement('canvas');
  canvas.className = 'campo-estelar-canvas';
  canvas.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
    border-radius: inherit;
  `;
  container.insertBefore(canvas, container.firstChild);

  const ctx = canvas.getContext('2d');
  let animacionId = null;

  function redimensionar() {
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    canvas._w = rect.width;
    canvas._h = rect.height;
    return { w: rect.width, h: rect.height };
  }

  const dims = redimensionar();

  // ── Vía Láctea: offscreen canvas renderizado una sola vez ──
  let viaLacteaCanvas = null;

  function renderizarViaLactea(w, h) {
    // Crear offscreen canvas
    viaLacteaCanvas = document.createElement('canvas');
    viaLacteaCanvas.width = w * (window.devicePixelRatio || 1);
    viaLacteaCanvas.height = h * (window.devicePixelRatio || 1);
    const vCtx = viaLacteaCanvas.getContext('2d');
    vCtx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

    const PALETA_VIA_LACTEA = [
      [180, 160, 220, 0.04], // violeta pálido
      [200, 180, 240, 0.03], // lavanda
      [160, 180, 220, 0.03], // azul pálido
      [220, 200, 200, 0.025], // rosáceo (polvo estelar)
      [190, 180, 210, 0.035], // lila
      [150, 170, 210, 0.025], // celeste tenue
    ];

    const CANTIDAD_NUBES = Math.floor(Math.min(w, h) / 80);
    const angulo = -Math.PI / 6;
    const cosAng = Math.cos(angulo);
    const sinAng = Math.sin(angulo);
    const centroX = w / 2;
    const centroY = h / 2;
    const longitud = Math.sqrt(w * w + h * h) * 1.2;
    const spread = Math.min(w, h) * 0.12;

    for (let i = 0; i < CANTIDAD_NUBES; i++) {
      const t = (i / (CANTIDAD_NUBES - 1)) * 2 - 1;
      const dist = t * longitud * 0.45;
      const baseX = centroX + dist * cosAng;
      const baseY = centroY + dist * sinAng;
      const perpX = -sinAng * (Math.random() - 0.5) * spread;
      const perpY = cosAng * (Math.random() - 0.5) * spread;
      const color = PALETA_VIA_LACTEA[Math.floor(Math.random() * PALETA_VIA_LACTEA.length)];
      const radio = (40 + Math.random() * 100) * (1 + Math.random() * 0.5) * (0.6 + Math.random() * 0.8);
      const x = baseX + perpX;
      const y = baseY + perpY;

      const grad = vCtx.createRadialGradient(x, y, 0, x, y, radio);
      grad.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`);
      grad.addColorStop(0.4, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3] * 0.4})`);
      grad.addColorStop(1, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0)`);
      vCtx.fillStyle = grad;
      vCtx.fillRect(0, 0, w, h);
    }
  }
  renderizarViaLactea(dims.w, dims.h);

  // ── Generar estrellas con densidad galáctica ──
  // Se concentran más estrellas cerca del centro de la Vía Láctea (banda diagonal)
  const CANTIDAD_BASE = Math.floor((dims.w * dims.h) / 2200);
  const estrellas = [];

  const COLORES_ESTRELLA = [
    [255, 255, 255], // blanca pura
    [255, 245, 235], // cálida
    [235, 245, 255], // azulada
    [255, 250, 240], // ligeramente amarilla
    [240, 248, 255], // celeste
    [255, 255, 250], // marfil
  ];

  // Parámetros de la banda de la Vía Láctea (mismos que en renderizarViaLactea)
  const anguloVL = -Math.PI / 6;
  const cosVL = Math.cos(anguloVL);
  const sinVL = Math.sin(anguloVL);
  const centroVL_X = dims.w / 2;
  const centroVL_Y = dims.h / 2;
  const anchoBanda = Math.min(dims.w, dims.h) * 0.25; // ancho total de la banda
  const CANTIDAD_TOTAL = Math.floor(CANTIDAD_BASE * 1.6); // 60% más de intentos

  for (let i = 0; i < CANTIDAD_TOTAL; i++) {
    // Posición aleatoria
    const x = Math.random() * dims.w;
    const y = Math.random() * dims.h;

    // Distancia perpendicular al eje central de la Vía Láctea
    const dx = x - centroVL_X;
    const dy = y - centroVL_Y;
    const distPerp = Math.abs(dx * sinVL - dy * cosVL);

    // Probabilidad de aceptación: gaussiana a lo ancho de la banda
    // ~95% en el centro, ~20% lejos de la banda
    const prob = 0.2 + 0.75 * Math.max(0, 1 - (distPerp / anchoBanda));

    if (Math.random() > prob) continue; // Rechazar según densidad

    // Las estrellas más cercanas al centro son ligeramente más grandes y brillantes
    const cercania = Math.max(0, 1 - distPerp / anchoBanda);
    const size = 0.4 + Math.random() * (2.0 + cercania * 1.5); // 0.4px – 3.5px (más grandes cerca del centro)
    const brilloBase = 0.3 + Math.random() * (0.5 + cercania * 0.5);

    const color = COLORES_ESTRELLA[Math.floor(Math.random() * COLORES_ESTRELLA.length)];

    estrellas.push({
      x, y,
      r: color[0], g: color[1], b: color[2],
      size,
      brilloBase,
      parpadeoVel: 0.008 + Math.random() * 0.035,
      parpadeoFase: Math.random() * Math.PI * 2,
      parpadeoAmp: 0.15 + Math.random() * 0.5,
    });
  }

  // ── Animación ──
  let tiempo = 0;

  function dibujar() {
    tiempo += 1;
    const w = canvas._w;
    const h = canvas._h;

    // Limpiar con total transparencia (el fondo lo pone el CSS del contenedor)
    ctx.clearRect(0, 0, w, h);

    // ── Dibujar Vía Láctea desde offscreen canvas pre-renderizado ──
    if (viaLacteaCanvas) {
      ctx.drawImage(viaLacteaCanvas, 0, 0, w, h);
    }

    // Dibujar cada estrella
    for (let i = 0; i < estrellas.length; i++) {
      const e = estrellas[i];
      const parpadeo = Math.sin(tiempo * e.parpadeoVel + e.parpadeoFase);
      const brillo = Math.max(0.05, e.brilloBase + parpadeo * e.parpadeoAmp);

      ctx.beginPath();
      ctx.arc(e.x, e.y, e.size * brillo, 0, Math.PI * 2);

      // Brillo = opacidad, tamaño escala con brillo también
      const alpha = Math.min(1, brillo * 1.1);
      ctx.fillStyle = `rgba(${e.r}, ${e.g}, ${e.b}, ${alpha})`;
      ctx.fill();

      // Para estrellas más grandes (>1.8px), agregar un glow sutil
      if (e.size > 1.8 && brillo > 0.5) {
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size * brillo * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${e.r}, ${e.g}, ${e.b}, ${alpha * 0.12})`;
        ctx.fill();
      }
    }

    animacionId = requestAnimationFrame(dibujar);
    if (campoEstelar) campoEstelar.frameId = animacionId;
  }

  campoEstelar = { canvas, frameId: animacionId };

  // Iniciar animación
  dibujar();

  // ── Resize ──
  const observer = new ResizeObserver(() => {
    const nuevasDims = redimensionar();

    // Reposicionar estrellas proporcionalmente
    const wRatio = nuevasDims.w / dims.w;
    const hRatio = nuevasDims.h / dims.h;
    for (let i = 0; i < estrellas.length; i++) {
      estrellas[i].x *= wRatio;
      estrellas[i].y *= hRatio;
    }
    dims.w = nuevasDims.w;
    dims.h = nuevasDims.h;

    // Re-renderizar Vía Láctea al nuevo tamaño
    renderizarViaLactea(nuevasDims.w, nuevasDims.h);

    // Re-generar estrellas con densidad galáctica al nuevo tamaño
    const nuevaCantidadBase = Math.floor((nuevasDims.w * nuevasDims.h) / 2200);
    const nuevaCantidadTotal = Math.floor(nuevaCantidadBase * 1.6);
    const nuevoCentroX = nuevasDims.w / 2;
    const nuevoCentroY = nuevasDims.h / 2;
    const nuevoAnchoBanda = Math.min(nuevasDims.w, nuevasDims.h) * 0.25;

    estrellas.length = 0;
    for (let i = 0; i < nuevaCantidadTotal; i++) {
      const x = Math.random() * nuevasDims.w;
      const y = Math.random() * nuevasDims.h;
      const dx = x - nuevoCentroX;
      const dy = y - nuevoCentroY;
      const distPerp = Math.abs(dx * sinVL - dy * cosVL);
      const prob = 0.2 + 0.75 * Math.max(0, 1 - (distPerp / nuevoAnchoBanda));
      if (Math.random() > prob) continue;
      const cercania = Math.max(0, 1 - distPerp / nuevoAnchoBanda);
      const size = 0.4 + Math.random() * (2.0 + cercania * 1.5);
      const color = COLORES_ESTRELLA[Math.floor(Math.random() * COLORES_ESTRELLA.length)];
      estrellas.push({
        x, y,
        r: color[0], g: color[1], b: color[2],
        size,
        brilloBase: 0.3 + Math.random() * (0.5 + cercania * 0.5),
        parpadeoVel: 0.008 + Math.random() * 0.035,
        parpadeoFase: Math.random() * Math.PI * 2,
        parpadeoAmp: 0.15 + Math.random() * 0.5,
      });
    }
  });
  observer.observe(container);
  campoEstelar.observer = observer;
}

/**
 * Agrupa los países del GeoJSON por continente (según mapeo de la app)
 */
function agruparPorContinente(features) {
  const grupos = {};
  
  features.forEach(f => {
    const nombreContinente = f.properties.CONTINENT;
    const mapeo = MAPEO_CONTINENTES[nombreContinente];
    
    if (!mapeo) return; // Ignorar "Seven seas (open ocean)" etc.
    
    if (!grupos[mapeo.id]) {
      grupos[mapeo.id] = [];
    }
    
    // Agregar el feature con su ID de continente
    grupos[mapeo.id].push({
      ...f,
      properties: {
        ...f.properties,
        continenteId: mapeo.id,
        continenteNombre: mapeo.nombre
      }
    });
  });
  
  return grupos;
}

/**
 * Inicializa el globo terráqueo 3D
 */
function iniciarGlobo() {
  const container = document.getElementById('mapa-mundo');
  if (!container) return;

  // Crear campo estelar de fondo (inserta canvas como primer hijo)
  crearCampoEstelar(container);

  // Mostrar loading overlay (encima del canvas de estrellas)
  const loadingHTML = `
    <div class="flex flex-col items-center justify-center h-full campo-estelar-loading" style="background: transparent; position: absolute; inset: 0; z-index: 3;">
      <div class="loader" style="border-color: rgba(255,255,255,0.1); border-top-color: #0ea5e9;"></div>
      <p class="text-slate-400 text-sm mt-4 font-medium">Cargando mapa mundial...</p>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', loadingHTML);

  // Cargar datos GeoJSON
  fetch('/data/continentes.geojson')
    .then(res => {
      if (!res.ok) throw new Error('Error al cargar datos del mapa');
      return res.json();
    })
    .then(data => {
      paisesPorContinente = agruparPorContinente(data.features);
      
      // Quitar loading
    const loadingEl = container.querySelector('.campo-estelar-loading');
    if (loadingEl) loadingEl.remove();

    // Verificar que Globe esté disponible
      if (typeof Globe === 'undefined') {
        container.innerHTML = '<div class="flex items-center justify-center h-full text-slate-400">Error: Librería 3D no disponible</div>';
        return;
      }
      
      crearGlobo(container);
    })
    .catch(err => {
      console.error('❌ Error cargando datos geográficos:', err);
      // Fallback: intentar cargar desde CDN
      cargarDesdeCDN(container);
    });
}

/**
 * Crea el globo 3D con todos los países agrupados por continente
 */
function crearGlobo(container) {
  try {
    world = Globe()(container);
    
    // Asegurar que el canvas de Three.js esté sobre las estrellas
    const threeCanvases = container.querySelectorAll('canvas');
    for (const c of threeCanvases) {
      if (!c.classList.contains('campo-estelar-canvas')) {
        c.style.position = 'relative';
        c.style.zIndex = '2';
        break;
      }
    }
    
    // ── CONFIGURACIÓN VISUAL ──
    world.width(container.clientWidth);
    world.height(container.clientHeight);
    world.backgroundColor('rgba(0,0,0,0)');
    
    // ── TEXTURAS CON FALLBACK ──
    world.globeImageUrl(TEXTURAS_TIERRA[0]);
    world.bumpImageUrl(TEXTURAS_RELIEVE[0]);
    
    // ── 🔴 FIX CRÍTICO: Color base del material del globo ──
    // El material (MeshPhongMaterial) por defecto tiene color=#000000,
    // lo que multiplica la textura por negro y la hace invisible.
    // Forzamos color blanco (#ffffff) para que la textura se vea correctamente.
    // 📝 Nota: globe.gl crea un Mesh con MeshBasicMaterial visible=false como helper
    // en scene.children[0]; el mesh real del globo está dentro de un Group (child[3])
    // con MeshPhongMaterial. globeMaterial() accede al material correcto.
    try {
      if (world.globeMaterial && world.globeMaterial()) {
        world.globeMaterial().color.setHex(0xffffff);
        console.log('✅ globeMaterial().color fijado a #ffffff');
      }
    } catch(e) {
      console.warn('⚠ No se pudo fijar globeMaterial().color:', e.message);
    }
    
    // ── Red de seguridad: forzar visibilidad del mesh del globo ──
    // globe.gl oculta el mesh hasta que la textura se carga. Si la carga
    // falla o tarda mucho, el mesh puede quedar invisible.
    setTimeout(() => {
      try {
        const scene = world.scene && world.scene();
        if (scene && scene.children) {
          const asegurarVisibilidad = (obj) => {
            if (obj.type === 'Mesh' && !obj.visible) {
              obj.visible = true;
              console.log('🔧 Mesh forzado a visible=true (seguridad)');
            }
            if (obj.children) obj.children.forEach(asegurarVisibilidad);
          };
          scene.children.forEach(asegurarVisibilidad);
        }
      } catch(e) { /* Silencioso */ }
    }, 3000);
    
    // ── ATMÓSFERA ──
    world.showAtmosphere(true);
    world.atmosphereColor('#38bdf8');
    world.atmosphereAltitude(0.25);

    // ── MARCADORES DE PAÍSES DESTACADOS ──
    // HTML elements que siempre miran a la cámara, con nombre + bandera
    world.htmlElementsData(PAISES_DESTACADOS);
    world.htmlLat(d => d.lat);
    world.htmlLng(d => d.lng);
    world.htmlAltitude(0.01);
    world.htmlElement(d => {
      const el = document.createElement('div');
      el.className = 'pais-marcador';
      el.innerHTML = `
        <span class="pais-dot" style="background: ${d.color};"></span>
        <span class="pais-bandera">${d.emoji}</span>
        <span class="pais-nombre">${d.nombre}</span>
      `;
      el.style.setProperty('--marcador-color', d.color);
      el.title = d.nombre;
      return el;
    });
    // ── POLÍGONOS DE PAÍSES (coloreados por continente) ──
    const todosLosPaises = Object.entries(paisesPorContinente).flatMap(([continenteId, paises]) =>
      paises.map(p => ({
        ...p,
        properties: {
          ...p.properties,
          continenteId: continenteId,
          continenteNombre: p.properties.continenteNombre
        }
      }))
    );

    world.polygonsData(todosLosPaises);
    world.polygonGeoJsonGeometry(d => d.geometry);
    
    // Color base semi-transparente por continente (deja ver la textura debajo)
    world.polygonCapColor(d => {
      const c = COLORES_CONTINENTE[d.properties.continenteId];
      return c ? c.base : 'rgba(255, 255, 255, 0.05)';
    });
    world.polygonSideColor(() => 'rgba(0, 0, 0, 0)');
    world.polygonStrokeColor(d => {
      const c = COLORES_CONTINENTE[d.properties.continenteId];
      return c ? c.base.replace('0.18', '0.4') : 'rgba(255, 255, 255, 0.1)';
    });
    world.polygonAltitude(0.005);
    world.polygonsTransitionDuration(300);
    
    // ── TOOLTIPS ──
    world.polygonLabel(d => {
      const cId = d.properties.continenteId;
      const nombre = NOMBRES_ES[cId] || d.properties.continenteNombre || 'Desconocido';
      const emojis = {
        america: '🌎', europa: '🏰', asia: '🏯', africa: '🦁', oceania: '🦘', antartida: '🐧'
      };
      return `
        <div class="globe-tooltip">
          <span style="font-size: 1.2rem;">${emojis[cId] || '🌍'}</span>
          <span>${nombre}</span>
        </div>
      `;
    });
    
    // ── EVENTOS ──
    world.onPolygonClick(d => {
      const cId = d.properties.continenteId;
      if (cId) {
        window.location.href = '/continente/' + cId;
      }
    });
    
    world.onPolygonHover(hoverD => {
      world.polygonCapColor(d => {
        if (d === hoverD) {
          const c = COLORES_CONTINENTE[d.properties.continenteId];
          return c ? c.hover : 'rgba(255, 255, 255, 0.25)';
        }
        const c = COLORES_CONTINENTE[d.properties.continenteId];
        return c ? c.base : 'rgba(255, 255, 255, 0.05)';
      });
      world.polygonAltitude(d => d === hoverD ? 0.02 : 0.005);
      world.polygonStrokeColor(d => d === hoverD ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)');
    });
    
    // ── POSICIÓN INICIAL ──
    world.pointOfView({ lat: 15, lng: -20, altitude: 2.5 });
    
    // ── ROTACIÓN AUTOMÁTICA ──
    const controls = world.controls();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      // 🔴 FIX: El globo tiene radio ~100 unidades Three.js.
      // minDistance debe ser > 100 para que la cámara no atraviese el globo.
      controls.minDistance = 120;  // 1.2x radio — evita entrada al globo
      controls.maxDistance = 400;  // 4x radio — zoom máximo cómodo
      controls.rotateSpeed = 0.5;
      controls.zoomSpeed = 1.0;
    }

    // ── RESIZE ──
    window.addEventListener('resize', () => {
      if (world) {
        world.width(container.clientWidth);
        world.height(container.clientHeight);
      }
    });

    console.log('✅ Globo Terráqueo con datos Natural Earth iniciado.');
    
  } catch (err) {
    console.error('❌ Error al crear el globo:', err);
    container.innerHTML = '<div class="flex items-center justify-center h-full text-slate-400">Error al iniciar el globo 3D</div>';
  }
}

/**
 * Fallback: intenta cargar datos desde CDN
 */
function cargarDesdeCDN(container) {
  fetch('https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
    .then(res => res.json())
    .then(data => {
      paisesPorContinente = agruparPorContinente(data.features);
      if (typeof Globe !== 'undefined') {
        crearGlobo(container);
      } else {
        container.innerHTML = '<div class="flex items-center justify-center h-full text-slate-400">Error: Librería 3D no disponible</div>';
      }
    })
    .catch(() => {
      container.innerHTML = '<div class="flex items-center justify-center h-full text-slate-400">No se pudo cargar el mapa</div>';
    });
}

// ── INICIALIZAR ──
document.addEventListener('DOMContentLoaded', function() {
  // Pequeña pausa para asegurar que Globe esté disponible
  setTimeout(iniciarGlobo, 200);
});
