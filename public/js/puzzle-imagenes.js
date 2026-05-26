/**
 * 🎨 Puzzle Image Generator Pro - Mundo Kids
 * 
 * Genera imágenes de mapas realistas usando datos GeoJSON de Natural Earth (110m resolución).
 * Renderiza continentes con sus formas costeras reales, colores de terreno naturales,
 * texturas procedurales, y efectos de sombreado para un aspecto profesional y educativo.
 * 
 * Cada tema está diseñado para verse bien al dividirse en fragmentos de puzzle.
 */

// ── Cache de datos GeoJSON ──
let datosGeoJSON = null;

// ── Mapeo de continentes de Natural Earth a IDs de la app ──
const MAPEO_CONTINENTES_GEO = {
  'North America': 'america',
  'South America': 'america',
  'Europe': 'europa',
  'Asia': 'asia',
  'Africa': 'africa',
  'Oceania': 'oceania',
  'Antarctica': 'antartida'
};

// ── Colores de terreno realistas por continente ──
const TERRENO_COLORS = {
  america: {
    tierra: '#5b8c5a',
    costa: '#4a7c4a',
    monte: '#3d6b3d',
    sombra: '#2d5a2d',
    resalte: '#7aad7a',
    borde: '#2d5a2d'
  },
  europa: {
    tierra: '#7aaa6a',
    costa: '#6a9a5a',
    monte: '#5a8a4a',
    sombra: '#4a7a3a',
    resalte: '#9aba8a',
    borde: '#3a6a2a'
  },
  asia: {
    tierra: '#c4a86a',
    costa: '#b4985a',
    monte: '#a4884a',
    sombra: '#94783a',
    resalte: '#d4b87a',
    borde: '#84682a'
  },
  africa: {
    tierra: '#c4b06a',
    costa: '#b4a05a',
    monte: '#a4904a',
    sombra: '#94803a',
    resalte: '#d4c07a',
    borde: '#84702a'
  },
  oceania: {
    tierra: '#b8884a',
    costa: '#a8783a',
    monte: '#98682a',
    sombra: '#88581a',
    resalte: '#c8985a',
    borde: '#784810'
  },
  antartida: {
    tierra: '#e8ecf0',
    costa: '#d8dce0',
    monte: '#c8ccd0',
    sombra: '#a8acb0',
    resalte: '#f0f4f8',
    borde: '#b8bcc0'
  }
};

// ── Paleta oceánica vibrante ──
const OCEANO = {
  profundo: '#2980b9',
  medio: '#3498db',
  somero: '#5dade2',
  superficie: '#aed6f1'
};

// ── Países que se excluyen (océanos, dependencias lejanas) ──
const EXCLUIR_CONTINENTES = ['Seven seas (open ocean)'];


// =====================================================================
//  PROYECCIÓN CARTOGRÁFICA
// =====================================================================

/**
 * Proyección equirectangular simple (lon/lat → canvas x/y)
 * Escoge esta proyección porque preserva las proporciones de forma
 * uniforme, ideal para un puzzle donde cada pieza debe ser coherente.
 */
function proyectar(lon, lat, w, h, margen = 0) {
  const x = ((lon + 180) / 360) * (w - margen * 2) + margen;
  const y = ((90 - lat) / 180) * (h - margen * 2) + margen;
  return [x, y];
}

/**
 * Proyección con zoom a un bounding box específico
 * Útil para renderizar un solo continente enfocado
 */
function proyectarZoom(lon, lat, w, h, bbox, padding = 0.12) {
  const lonRange = bbox.maxX - bbox.minX;
  const latRange = bbox.maxY - bbox.minY;
  
  // Aplicar padding proporcional alrededor del bbox
  const padLon = lonRange * padding;
  const padLat = latRange * padding;
  
  const minLon = bbox.minX - padLon;
  const maxLon = bbox.maxX + padLon;
  const minLat = bbox.minY - padLat;
  const maxLat = bbox.maxY + padLat;
  
  const x = ((lon - minLon) / (maxLon - minLon)) * w;
  const y = ((maxLat - lat) / (maxLat - minLat)) * h;
  
  return [x, y];
}

/**
 * Calcula el bounding box combinado de múltiples geometrías
 */
function combinarBBox(geometries) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  geometries.forEach(geom => {
    const bbox = obtenerBBox(geom);
    if (bbox.minX < minX) minX = bbox.minX;
    if (bbox.minY < minY) minY = bbox.minY;
    if (bbox.maxX > maxX) maxX = bbox.maxX;
    if (bbox.maxY > maxY) maxY = bbox.maxY;
  });
  
  // Asegurar valores finitos
  if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
    return null;
  }
  
  return { minX, minY, maxX, maxY };
}


// =====================================================================
//  GEOMETRÍAS (Polígonos del GeoJSON)
// =====================================================================

/**
 * Dibuja un anillo de coordenadas en el canvas
 */
function dibujarAnillo(ctx, ring, w, h) {
  if (!ring || ring.length < 3) return;
  const [sx, sy] = proyectar(ring[0][0], ring[0][1], w, h);
  ctx.moveTo(sx, sy);
  for (let i = 1; i < ring.length; i++) {
    const [x, y] = proyectar(ring[i][0], ring[i][1], w, h);
    ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/**
 * Dibuja un polígono con sus agujeros (islas, lagos interiores)
 */
function dibujarPoligono(ctx, coords, w, h) {
  if (!coords || coords.length === 0) return;
  
  // Anillo exterior
  const exterior = coords[0];
  if (!exterior || exterior.length < 3) return;
  
  ctx.beginPath();
  dibujarAnillo(ctx, exterior, w, h);
  
  // Anillos interiores (agujeros / huecos)
  for (let i = 1; i < coords.length; i++) {
    dibujarAnillo(ctx, coords[i], w, h);
  }
}

/**
 * Dibuja una geometría completa (Polygon o MultiPolygon)
 */
function dibujarGeometria(ctx, geometry, w, h) {
  if (geometry.type === 'Polygon') {
    dibujarPoligono(ctx, geometry.coordinates, w, h);
  } else if (geometry.type === 'MultiPolygon') {
    for (const polyCoords of geometry.coordinates) {
      dibujarPoligono(ctx, polyCoords, w, h);
    }
  }
}

/**
 * Obtiene el bounding box de una geometría para calcular centroides
 */
function obtenerBBox(geometry) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  const procesarCoords = (coords) => {
    if (!coords || coords.length === 0) return;
    if (Array.isArray(coords[0]) && typeof coords[0][0] === 'number') {
      // Es un par [lon, lat]
      const [lon, lat] = coords;
      if (lon < minX) minX = lon;
      if (lon > maxX) maxX = lon;
      if (lat < minY) minY = lat;
      if (lat > maxY) maxY = lat;
    } else {
      coords.forEach(c => procesarCoords(c));
    }
  };
  
  procesarCoords(geometry.coordinates);
  return { minX, maxX, minY, maxY };
}


// =====================================================================
//  TEXTURA PROCEDURAL DE TERRENO
// =====================================================================

/**
 * Convierte un color hex (#rrggbb) a array RGB [r,g,b]
 */
function hexToRgb(hex) {
  if (Array.isArray(hex)) return hex;
  const val = parseInt(hex.replace('#', ''), 16);
  return [(val >> 16) & 255, (val >> 8) & 255, val & 255];
}

/**
 * Genera textura de ruido pseudoaleatorio determinista en un área del canvas
 * Usa valores fijos (sin Math.random) para que la textura sea siempre igual.
 * 
 * NOTA: Usa fillRect con rgba() en vez de putImageData para EVITAR que los
 * píxeles transparentes (0,0,0,0) del ImageData se conviertan en negro al
 * exportar a JPEG. Con fillRect el color se mezcla (blend) con el contenido
 * existente del canvas en vez de reemplazarlo.
 */
function generarTexturaTerreno(ctx, x, y, w, h, color, opacidad = 0.06, semilla = 42) {
  const paso = 4;
  const rgb = hexToRgb(color);
  
  for (let py = 0; py < h; py += paso) {
    for (let px = 0; px < w; px += paso) {
      // Ruido pseudoaleatorio determinista usando la posición
      const hash = ((px * 73856093 + py * 19349663 + semilla * 83492791) % 100000) / 100000;
      if (hash < opacidad) {
        const alpha = Math.round((15 + hash * 20)) / 255;
        ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha.toFixed(4)})`;
        ctx.fillRect(x + px, y + py, paso, paso);
      }
    }
  }
}


// =====================================================================
//  DIBUJO DEL MAPA MUNDI REALISTA (tema: 'mapa')
// =====================================================================

/**
 * Dibuja el fondo oceánico con gradiente de profundidad
 */
function dibujarOceano(ctx, w, h) {
  // Gradiente radial que simula profundidad oceánica
  const grad = ctx.createRadialGradient(
    w * 0.5, h * 0.4, w * 0.1,
    w * 0.45, h * 0.4, w * 0.65
  );
  grad.addColorStop(0, OCEANO.superficie);
  grad.addColorStop(0.25, OCEANO.somero);
  grad.addColorStop(0.55, OCEANO.medio);
  grad.addColorStop(1, OCEANO.profundo);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  
  // ── Agregar textura oceánica sutil ──
  generarTexturaTerreno(ctx, 0, 0, w, h, '#1a5276', 0.04, 1);
  
  // ── Líneas batimétricas (curvas de profundidad) muy sutiles ──
  ctx.strokeStyle = 'rgba(100, 180, 220, 0.06)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 5; i++) {
    const cy = h * (0.3 + i * 0.1);
    const amp = 20 + i * 10;
    ctx.beginPath();
    for (let px = 0; px <= w; px += 3) {
      const yOffset = Math.sin(px * 0.008 + i * 1.5) * amp + Math.sin(px * 0.015 + i * 3) * amp * 0.3;
      const y = cy + yOffset;
      if (px === 0) ctx.moveTo(px, y);
      else ctx.lineTo(px, y);
    }
    ctx.stroke();
  }
}

/**
 * Dibuja los continentes con formas reales del GeoJSON y colores de terreno
 */
function dibujarContinentesRealistas(ctx, features, w, h) {
  // Agrupar países por continente de la app
  const porContinente = {};
  
  features.forEach(f => {
    const contNombre = f.properties.CONTINENT;
    if (EXCLUIR_CONTINENTES.includes(contNombre)) return;
    
    const contId = MAPEO_CONTINENTES_GEO[contNombre];
    if (!contId) return;
    
    if (!porContinente[contId]) porContinente[contId] = [];
    porContinente[contId].push(f);
  });
  
  // ── 1er PASO: Dibujar sombra de los continentes (efecto de elevación) ──
  const SOMBRA_OFFSET = 1.5;
  ctx.save();
  
  Object.entries(porContinente).forEach(([contId, paises]) => {
    const colores = TERRENO_COLORS[contId] || TERRENO_COLORS.america;
    
    paises.forEach(f => {
      ctx.save();
      ctx.translate(SOMBRA_OFFSET, SOMBRA_OFFSET);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      dibujarGeometria(ctx, f.geometry, w, h);
      ctx.fill();
      ctx.restore();
    });
  });
  
  // ── 2do PASO: Dibujar masa terrestre ──
  Object.entries(porContinente).forEach(([contId, paises]) => {
    const colores = TERRENO_COLORS[contId] || TERRENO_COLORS.america;
    
    paises.forEach(f => {
      ctx.fillStyle = colores.tierra;
      dibujarGeometria(ctx, f.geometry, w, h);
      ctx.fill();
    });
  });
  
  // ── 3er PASO: Gradiente de sombra interior (efecto 3D) ──
  Object.entries(porContinente).forEach(([contId, paises]) => {
    const colores = TERRENO_COLORS[contId] || TERRENO_COLORS.america;
    
    paises.forEach(f => {
      // Sombras en bordes inferiores para efecto de elevación
      ctx.strokeStyle = colores.sombra;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.3;
      dibujarGeometria(ctx, f.geometry, w, h);
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    });
  });
  
  // ── 4to PASO: Resaltes y costa ──
  Object.entries(porContinente).forEach(([contId, paises]) => {
    const colores = TERRENO_COLORS[contId] || TERRENO_COLORS.america;
    
    paises.forEach(f => {
      // Borde costero sutil (más claro)
      ctx.strokeStyle = colores.resalte;
      ctx.lineWidth = 0.8;
      ctx.globalAlpha = 0.25;
      dibujarGeometria(ctx, f.geometry, w, h);
      ctx.stroke();
      ctx.globalAlpha = 1.0;
      
      // Contorno exterior definido
      ctx.strokeStyle = colores.borde;
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = 0.5;
      dibujarGeometria(ctx, f.geometry, w, h);
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    });
  });
  
  ctx.restore();
  
  // ── 5to PASO: Textura de terreno sobre cada continente ──
  // Usamos clip paths para aplicar textura solo dentro de cada país,
  // evitando el bug de composición con offscreen canvas
  const texturaSemillas = { america: 10, europa: 20, asia: 30, africa: 40, oceania: 50, antartida: 60 };
  Object.entries(porContinente).forEach(([contId, paises]) => {
    const colores = TERRENO_COLORS[contId] || TERRENO_COLORS.america;
    const semilla = texturaSemillas[contId] || 99;
    
    paises.forEach(f => {
      ctx.save();
      // Recortar (clip) al contorno del país
      dibujarGeometria(ctx, f.geometry, w, h);
      ctx.clip();
      
      // Textura sobre toda el área del clip
      const bbox = obtenerBBox(f.geometry);
      if (isFinite(bbox.minX)) {
        const [x1, y1] = proyectar(bbox.minX, bbox.maxY, w, h);
        const [x2, y2] = proyectar(bbox.maxX, bbox.minY, w, h);
        const bw = Math.max(20, x2 - x1);
        const bh = Math.max(20, y2 - y1);
        
        generarTexturaTerreno(ctx, x1, y1, bw, bh, colores.sombra, 0.08, semilla);
      }
      ctx.restore();
    });
  });
  
  // ── 6to PASO: Etiquetas sutiles de continentes con tipografía limpia ──
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const etiquetas = {
    america: { x: 0.30, y: 0.42, nombre: 'AMÉRICA' },
    europa: { x: 0.48, y: 0.17, nombre: 'EUROPA' },
    asia: { x: 0.76, y: 0.25, nombre: 'ASIA' },
    africa: { x: 0.48, y: 0.42, nombre: 'ÁFRICA' },
    oceania: { x: 0.86, y: 0.52, nombre: 'OCEANÍA' },
    antartida: { x: 0.50, y: 0.88, nombre: 'ANTÁRTIDA' }
  };
  
  Object.values(etiquetas).forEach(et => {
    const ex = et.x * w;
    const ey = et.y * h;
    const fontSize = Math.round(w * 0.028);
    
    // Sombra tras el texto
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 4;
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = `600 ${fontSize}px 'Quicksand', 'Segoe UI', sans-serif`;
    ctx.fillText(et.nombre, ex, ey);
    ctx.shadowBlur = 0;
  });
}

/**
 * Dibuja el mapa mundial completo con datos reales del GeoJSON
 * (tema: 'mapa')
 */
async function dibujarMapaMundo(ctx, w, h) {
  try {
    // Cargar datos GeoJSON
    const data = await cargarDatosGeoJSON();
    
    // 1. Océano con gradiente de profundidad
    dibujarOceano(ctx, w, h);
    
    // 2. Continentes con formas reales
    dibujarContinentesRealistas(ctx, data.features, w, h);
    
  } catch (err) {
    console.error('Error al cargar datos del mapa:', err);
    // Fallback: dibujar un patrón colorido con emojis
    dibujarFallbackColorido(ctx, w, h);
  }
}


// =====================================================================
//  TEMA: CONTINENTES (collage tipo infografía profesional)
// =====================================================================

function dibujarContinentes(ctx, w, h) {
  // Fondo degradado azul cielo vibrante
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#e0f2fe');
  grad.addColorStop(0.3, '#bae6fd');
  grad.addColorStop(0.6, '#7dd3fc');
  grad.addColorStop(1, '#38bdf8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  
  // Textura de fondo sutil
  generarTexturaTerreno(ctx, 0, 0, w, h, [56, 189, 248], 0.03, 7);
  
  // ── Círculos con información de continentes (estilo infografía) ──
  const cards = [
    { label: 'AMÉRICA', color: '#f472b6', 
      desc: 'Norte y Sur', cx: 0.2, cy: 0.2 },
    { label: 'EUROPA', color: '#60a5fa', 
      desc: 'Viejo Continente', cx: 0.5, cy: 0.15 },
    { label: 'ASIA', color: '#fbbf24', 
      desc: 'El más grande', cx: 0.8, cy: 0.2 },
    { label: 'ÁFRICA', color: '#34d399', 
      desc: 'Cuna de la Humanidad', cx: 0.3, cy: 0.55 },
    { label: 'OCEANÍA', color: '#a78bfa', 
      desc: 'Islas del Pacífico', cx: 0.7, cy: 0.55 },
    { label: 'ANTÁRTIDA', color: '#94a3b8', 
      desc: 'Continente Helado', cx: 0.5, cy: 0.85 },
  ];
  
  cards.forEach(c => {
    const cx = c.cx * w;
    const cy = c.cy * h;
    const r = Math.min(w, h) * 0.13;
    
    // Sombra exterior
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 25;
    
    // Círculo principal con gradiente esférico
    const grad2 = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.25, 0, cx, cy, r);
    grad2.addColorStop(0, c.color);
    grad2.addColorStop(0.6, c.color);
    grad2.addColorStop(1, 'rgba(0,0,0,0.3)');
    ctx.fillStyle = grad2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Borde brillante
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Reflejo superior
    const grad3 = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx - r * 0.3, cy - r * 0.3, r * 0.5);
    grad3.addColorStop(0, 'rgba(255,255,255,0.2)');
    grad3.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad3;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    
    // Nombre del continente
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${Math.round(w * 0.03)}px 'Quicksand', 'Segoe UI', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 5;
    ctx.fillText(c.label, cx, cy - r * 0.15);
    ctx.shadowBlur = 0;
    
    // Descripción
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.font = `${Math.round(w * 0.016)}px 'Quicksand', 'Segoe UI', sans-serif`;
    ctx.fillText(c.desc, cx, cy + r * 0.35);
  });
  
  // ── Líneas decorativas orbitales ──
  ctx.strokeStyle = 'rgba(0,0,0,0.03)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.5, Math.min(w, h) * (0.15 + i * 0.12), 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // ── Título inferior ──
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.font = `600 ${Math.round(w * 0.032)}px 'Quicksand', 'Segoe UI', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('LOS CONTINENTES', w * 0.5, h * 0.04);
}


// =====================================================================
//  TEMA: BANDERAS (collage de banderas realista)
// =====================================================================

function dibujarBanderas(ctx, w, h) {
  // Fondo degradado azul claro vibrante
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#dbeafe');
  grad.addColorStop(0.3, '#bfdbfe');
  grad.addColorStop(0.6, '#93c5fd');
  grad.addColorStop(1, '#60a5fa');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  
  // Estrellas de fondo (más visibles sobre fondo claro)
  for (let i = 0; i < 25; i++) {
    const sx = ((i * 137 + 47) % 100) / 100 * w;
    const sy = ((i * 89 + 23) % 100) / 100 * h;
    const sr = 0.8 + (i % 4) * 0.6;
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Banderas en cuadrícula
  const banderas = [
    { x: 0, y: 0, w: w * 0.5, h: h * 0.5, 
      colores: ['#CE1126', '#003893', '#ffffff', '#003893', '#CE1126'], tipo: 'franjas-h' },
    { x: w * 0.5, y: 0, w: w * 0.5, h: h * 0.5, 
      colores: ['#012169', '#ffffff', '#C8102E'], tipo: 'franjas-v' },
    { x: 0, y: h * 0.5, w: w * 0.5, h: h * 0.5, 
      colores: ['#009E49', '#ffffff', '#CE1126'], tipo: 'franjas-h' },
    { x: w * 0.5, y: h * 0.5, w: w * 0.5, h: h * 0.5, 
      colores: ['#000000', '#DD0000', '#FFD700'], tipo: 'franjas-h' },
  ];
  
  banderas.forEach(b => {
    const { x, y, w: bw, h: bh, colores, tipo } = b;
    const numBandas = colores.length;
    
    if (tipo === 'franjas-h') {
      colores.forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.fillRect(x, y + (bh / numBandas) * i, bw, bh / numBandas + 0.5);
      });
    } else {
      colores.forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.fillRect(x + (bw / numBandas) * i, y, bw / numBandas + 0.5, bh);
      });
    }
    
    // Marco decorativo de la bandera
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, bw, bh);
    
    // Sombra interna sutil
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 1, y + 1, bw - 2, bh - 2);
  });
  
  // ── Elementos decorativos ──
  // Estrella dorada
  const estrellaX = w * 0.25;
  const estrellaY = h * 0.75;
  dibujarEstrella(ctx, estrellaX, estrellaY, Math.min(w, h) * 0.05, 5);
  ctx.fillStyle = '#f59e0b';
  ctx.shadowColor = 'rgba(245, 158, 11, 0.3)';
  ctx.shadowBlur = 8;
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Sol
  const solX = w * 0.75, solY = h * 0.25;
  const solR = Math.min(w, h) * 0.06;
  ctx.fillStyle = '#fbbf24';
  ctx.shadowColor = 'rgba(251, 191, 36, 0.3)';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(solX, solY, solR, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Anillos olímpicos
  const aniX = w * 0.25, aniY = h * 0.25, aniR = Math.min(w, h) * 0.025;
  const coloresAnillos = ['#0085C7', '#F4C300', '#000000', '#009F3D', '#DF0024'];
  coloresAnillos.forEach((color, i) => {
    const offsetX = (i - 2) * aniR * 1.5;
    const offsetY = i < 3 ? 0 : aniR * 0.6;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(aniX + offsetX, aniY + offsetY, aniR, 0, Math.PI * 2);
    ctx.stroke();
  });
  
  // ── Texto ──
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.font = `600 ${Math.round(w * 0.032)}px 'Quicksand', 'Segoe UI', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';  
  ctx.fillText('BANDERAS DEL MUNDO', w * 0.5, h * 0.91);
}


// =====================================================================
//  TEMA: ANIMALES (infografía estilo documental)
// =====================================================================

function dibujarAnimales(ctx, w, h) {
  // ── Fondo degradado sabana vibrante y claro ──
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#fef3c7');
  grad.addColorStop(0.2, '#fde68a');
  grad.addColorStop(0.4, '#fcd34d');
  grad.addColorStop(0.6, '#86efac');
  grad.addColorStop(0.8, '#4ade80');
  grad.addColorStop(1, '#22c55e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  
  // ── Silueta de árboles en el horizonte ──
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  const arboles = [
    [0.05, 0.6, 30], [0.12, 0.58, 45], [0.22, 0.55, 35], 
    [0.35, 0.57, 40], [0.48, 0.54, 50], [0.6, 0.56, 35],
    [0.72, 0.53, 45], [0.82, 0.55, 30], [0.92, 0.57, 35]
  ];
  arboles.forEach(([ax, ay, aSize]) => {
    ctx.beginPath();
    ctx.arc(ax * w, ay * h, aSize * 0.5, Math.PI, 0);
    ctx.fill();
    // Tronco
    ctx.fillRect(ax * w - 2, ay * h, 4, aSize * 0.4);
  });
  
  // ── Sol brillante ──
  ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.28, Math.min(w, h) * 0.12, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = 'rgba(251, 191, 36, 0.7)';
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.28, Math.min(w, h) * 0.06, 0, Math.PI * 2);
  ctx.fill();
  
  // ── Animales como iconos naturales ──
  const animales = [
    { emoji: '🦁', x: 0.3, y: 0.52, size: 60, shadow: true },   // León - África
    { emoji: '🦅', x: 0.42, y: 0.22, size: 45, shadow: false }, // Águila
    { emoji: '🦘', x: 0.82, y: 0.58, size: 50, shadow: true },  // Canguro
    { emoji: '🐼', x: 0.68, y: 0.28, size: 48, shadow: false }, // Panda
    { emoji: '🐧', x: 0.55, y: 0.78, size: 45, shadow: false }, // Pingüino
    { emoji: '🐘', x: 0.38, y: 0.62, size: 55, shadow: true },  // Elefante
    { emoji: '🐅', x: 0.58, y: 0.35, size: 52, shadow: false }, // Tigre
    { emoji: '🐬', x: 0.72, y: 0.68, size: 40, shadow: false }, // Delfín
    { emoji: '🦋', x: 0.22, y: 0.42, size: 32, shadow: false }, // Mariposa
    { emoji: '🦜', x: 0.15, y: 0.48, size: 35, shadow: false }, // Loro
  ];
  
  animales.forEach(a => {
    const ax = a.x * w;
    const ay = a.y * h;
    
    if (a.shadow) {
      // Sombra en el suelo
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.beginPath();
      ctx.ellipse(ax, ay + a.size * 0.45, a.size * 0.3, a.size * 0.06, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = 10;
    ctx.font = `${a.size}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(a.emoji, ax, ay);
    ctx.shadowBlur = 0;
  });
  
  // ── Etiqueta inferior ──
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.font = `600 ${Math.round(w * 0.032)}px 'Quicksand', 'Segoe UI', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('FAUNA MUNDIAL', w * 0.5, h * 0.04);
}


// =====================================================================
//  TEMA: MONUMENTOS (collage tipo póster de viajes)
// =====================================================================

function dibujarMonumentos(ctx, w, h) {
  // ── Fondo degradado vintage/mapa de viaje ──
  const grad = ctx.createRadialGradient(
    w * 0.3, h * 0.3, w * 0.1,
    w * 0.5, h * 0.5, w * 0.75
  );
  grad.addColorStop(0, '#fef3c7');
  grad.addColorStop(0.3, '#fde68a');
  grad.addColorStop(0.5, '#fcd34d');
  grad.addColorStop(0.75, '#fbbf24');
  grad.addColorStop(1, '#f59e0b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  
  // ── Líneas de mapa (meridianos y paralelos decorativos) ──
  ctx.strokeStyle = 'rgba(180, 120, 60, 0.08)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    const y = h * (0.1 + i * 0.16);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  for (let i = 0; i < 6; i++) {
    const x = w * (0.1 + i * 0.16);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  
  // ── Textura de papel añejo ──
  generarTexturaTerreno(ctx, 0, 0, w, h, [180, 120, 60], 0.03, 17);
  
  // ── Monumentos emblemáticos en cuadrícula de tarjetas ──
  const monumentos = [
    { emoji: '🗽', nombre: 'Estatua de la Libertad', lugar: 'Nueva York, EE.UU.' },
    { emoji: '🗼', nombre: 'Torre Eiffel', lugar: 'París, Francia' },
    { emoji: '🏛️', nombre: 'Coliseo Romano', lugar: 'Roma, Italia' },
    { emoji: '🗻', nombre: 'Monte Fuji', lugar: 'Honshu, Japón' },
    { emoji: '⛪', nombre: 'Cristo Redentor', lugar: 'Río de Janeiro, Brasil' },
    { emoji: '🔺', nombre: 'Pirámides de Guiza', lugar: 'El Cairo, Egipto' },
    { emoji: '🏯', nombre: 'Gran Muralla China', lugar: 'China' },
    { emoji: '🎭', nombre: 'Ópera de Sídney', lugar: 'Sídney, Australia' },
    { emoji: '🕌', nombre: 'Taj Mahal', lugar: 'Agra, India' },
    { emoji: '🏔️', nombre: 'Machu Picchu', lugar: 'Cusco, Perú' },
    { emoji: '🕰️', nombre: 'Big Ben', lugar: 'Londres, Reino Unido' },
    { emoji: '🏰', nombre: 'Neuschwanstein', lugar: 'Baviera, Alemania' },
    { emoji: '🌉', nombre: 'Puente de Brooklyn', lugar: 'Nueva York, EE.UU.' },
    { emoji: '🗿', nombre: 'Moái de Rapa Nui', lugar: 'Isla de Pascua, Chile' },
    { emoji: '🌋', nombre: 'Volcán Yasur', lugar: 'Vanuatu' },
    { emoji: '🏜️', nombre: 'Gran Cañón', lugar: 'Arizona, EE.UU.' },
  ];
  
  // Disposición: 4 columnas x 4 filas
  const cols = 4;
  const filas = 4;
  const margenX = w * 0.04;
  const margenY = h * 0.08;
  const cardW = (w - margenX * 2) / cols;
  const cardH = (h - margenY * 2) / filas;
  const emojiSize = Math.round(Math.min(w, h) * 0.055);
  const fontSize = Math.round(Math.min(w, h) * 0.018);
  const lugarSize = Math.round(Math.min(w, h) * 0.014);
  
  monumentos.forEach((m, i) => {
    const col = i % cols;
    const fila = Math.floor(i / cols);
    const cx = margenX + col * cardW + cardW * 0.5;
    const cy = margenY + fila * cardH + cardH * 0.5;
    const r = Math.min(cardW, cardH) * 0.33;
    
    // ── Círculo decorativo detrás del emoji ──
    const hue = (i * 37 + 25) % 360;
    ctx.save();
    
    // Sombra del círculo
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 10;
    
    ctx.fillStyle = `hsla(${hue}, 55%, 75%, 0.45)`;
    ctx.beginPath();
    ctx.arc(cx, cy - cardH * 0.06, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Borde sutil del círculo
    ctx.strokeStyle = `hsla(${hue}, 50%, 60%, 0.2)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy - cardH * 0.06, r, 0, Math.PI * 2);
    ctx.stroke();
    
    // ── Emoji del monumento ──
    ctx.font = `${emojiSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(m.emoji, cx, cy - cardH * 0.06);
    
    // ── Nombre del monumento ──
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.font = `700 ${fontSize}px 'Quicksand', 'Segoe UI', sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.fillText(m.nombre, cx, cy + cardH * 0.28);
    
    // ── Lugar ──
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.font = `${lugarSize}px 'Quicksand', 'Segoe UI', sans-serif`;
    ctx.fillText(m.lugar, cx, cy + cardH * 0.40);
    
    ctx.restore();
  });
  
  // ── Brújula decorativa (esquina inferior derecha) ──
  const bruX = w - 45;
  const bruY = h - 45;
  const bruR = 16;
  
  ctx.fillStyle = 'rgba(180, 120, 60, 0.15)';
  ctx.beginPath();
  ctx.arc(bruX, bruY, bruR + 4, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.strokeStyle = 'rgba(180, 120, 60, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(bruX, bruY, bruR, 0, Math.PI * 2);
  ctx.stroke();
  
  // Flecha norte (roja)
  ctx.strokeStyle = 'rgba(200, 80, 80, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(bruX, bruY - bruR + 2);
  ctx.lineTo(bruX, bruY + bruR - 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(80, 80, 80, 0.2)';
  ctx.beginPath();
  ctx.moveTo(bruX - bruR + 2, bruY);
  ctx.lineTo(bruX + bruR - 2, bruY);
  ctx.stroke();
  
  ctx.fillStyle = 'rgba(200, 80, 80, 0.35)';
  ctx.font = `bold ${Math.round(bruR * 0.8)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('N', bruX, bruY - bruR + 1);
  
  // ── Título inferior ──
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.font = `600 ${Math.round(w * 0.032)}px 'Quicksand', 'Segoe UI', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('MONUMENTOS DEL MUNDO', w * 0.5, h * 0.04);
}


// =====================================================================
//  TEMA: CONTINENTE INDIVIDUAL (zoom a un continente con mapa realista)
// =====================================================================

/**
 * Dibuja un continente individual con zoom y fondo oceánico
 * Usa los mismos datos GeoJSON pero recortados al continente específico
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w - Ancho del canvas
 * @param {number} h - Alto del canvas  
 * @param {string} continenteId - ID del continente (america, europa, asia, africa, oceania, antartida)
 */
async function dibujarContinenteIndividual(ctx, w, h, continenteId) {
  try {
    const data = await cargarDatosGeoJSON();
    
    // Construir mapa inverso: appId → [nombresGeo]
    const continentesInversos = {};
    Object.entries(MAPEO_CONTINENTES_GEO).forEach(([geoName, appId]) => {
      if (!continentesInversos[appId]) continentesInversos[appId] = [];
      continentesInversos[appId].push(geoName);
    });
    
    const nombresGeo = continentesInversos[continenteId] || [];
    
    const features = data.features.filter(f => {
      const cont = f.properties.CONTINENT;
      return nombresGeo.includes(cont);
    });
    
    if (features.length === 0) {
      dibujarOceano(ctx, w, h);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = `600 ${Math.round(w * 0.04)}px 'Quicksand', 'Segoe UI', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`Datos no disponibles para ${continenteId}`, w * 0.5, h * 0.5);
      return;
    }
    
    // Calcular bounding box combinado para el zoom
    const geometrias = features.map(f => f.geometry);
    const bbox = combinarBBox(geometrias);
    
    if (!bbox) {
      dibujarOceano(ctx, w, h);
      return;
    }
    
    // Padding adaptativo: continentes alargados necesitan menos padding
    const aspectRatio = (bbox.maxY - bbox.minY) / Math.max(1, bbox.maxX - bbox.minX);
    const padding = aspectRatio > 2 ? 0.08 : 0.14;
    
    // 1. Océano con gradiente
    dibujarOceano(ctx, w, h);
    
    // 2. Colores del continente
    const colores = TERRENO_COLORS[continenteId] || TERRENO_COLORS.america;
    const nombresCont = { america: 'AMÉRICA', europa: 'EUROPA', asia: 'ASIA', africa: 'ÁFRICA', oceania: 'OCEANÍA', antartida: 'ANTÁRTIDA' };
    const nombreContinente = nombresCont[continenteId] || continenteId.toUpperCase();
    
    // ── Reutilizar funciones globales con proyección zoom temporal ──
    // Guardamos la función original y la reemplazamos temporalmente
    // con una versión currificada que usa el bbox y padding calculados
    const proyectarOriginal = proyectar;
    try {
      proyectar = (lon, lat, canvW, canvH) => proyectarZoom(lon, lat, canvW, canvH, bbox, padding);
      
      // ── Sombra de elevación ──
      const offsetSombra = Math.min(w, h) * 0.003;
      ctx.save();
      features.forEach(f => {
        ctx.save();
        ctx.translate(offsetSombra, offsetSombra);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        dibujarGeometria(ctx, f.geometry, w, h);
        ctx.fill();
        ctx.restore();
      });
      
      // ── Masa terrestre ──
      features.forEach(f => {
        ctx.fillStyle = colores.tierra;
        dibujarGeometria(ctx, f.geometry, w, h);
        ctx.fill();
      });
      
      // ── Contornos y bordes ──
      features.forEach(f => {
        ctx.strokeStyle = colores.sombra;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.3;
        dibujarGeometria(ctx, f.geometry, w, h);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
        
        ctx.strokeStyle = colores.resalte;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.2;
        dibujarGeometria(ctx, f.geometry, w, h);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
        
        ctx.strokeStyle = colores.borde;
        ctx.lineWidth = 0.6;
        ctx.globalAlpha = 0.4;
        dibujarGeometria(ctx, f.geometry, w, h);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      });
      
      // ── Textura de terreno ──
      const semillaMap = { america: 10, europa: 20, asia: 30, africa: 40, oceania: 50, antartida: 60 };
      const semilla = semillaMap[continenteId] || 99;
      features.forEach(f => {
        ctx.save();
        dibujarGeometria(ctx, f.geometry, w, h);
        ctx.clip();
        const fBbox = obtenerBBox(f.geometry);
        if (isFinite(fBbox.minX)) {
          const [x1, y1] = proyectar(fBbox.minX, fBbox.maxY, w, h);
          const [x2, y2] = proyectar(fBbox.maxX, fBbox.minY, w, h);
          const bw = Math.max(20, x2 - x1);
          const bh = Math.max(20, y2 - y1);
          generarTexturaTerreno(ctx, x1, y1, bw, bh, colores.sombra, 0.08, semilla);
        }
        ctx.restore();
      });
      
      ctx.restore();
      
      // ── Rellenar áreas oceánicas que puedan haber quedado sin pintar ──
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = OCEANO.profundo;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
    } finally {
      // Restaurar proyección original incluso si ocurre un error
      proyectar = proyectarOriginal;
    }
    
    // ── Etiqueta del continente ──
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const fontSize = Math.round(Math.min(w, h) * 0.04);
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 6;
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = `700 ${fontSize}px 'Quicksand', 'Segoe UI', sans-serif`;
    ctx.fillText(nombreContinente, w * 0.5, h * 0.05);
    ctx.shadowBlur = 0;
    
    // ── Brújula decorativa (esquina inferior derecha) ──
    const bruX = w - 40;
    const bruY = h - 40;
    const bruR = 14;
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(bruX, bruY, bruR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,100,100,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bruX, bruY - bruR + 2);
    ctx.lineTo(bruX, bruY + bruR - 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bruX - bruR + 2, bruY);
    ctx.lineTo(bruX + bruR - 2, bruY);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,100,100,0.3)';
    ctx.font = `bold ${Math.round(bruR * 0.8)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', bruX, bruY - bruR + 1);
    
  } catch (err) {
    console.error('Error al dibujar continente individual:', err);
    dibujarFallbackColorido(ctx, w, h);
  }
}


// =====================================================================
//  FALLBACK COLORIDO (cuando falla la carga del GeoJSON)
// =====================================================================

/**
 * Dibuja un patrón colorido de respaldo cuando no se puede cargar el mapa.
 * Muestra círculos de colores vibrantes y el texto "🌍 Mundo Kids" 
 * para que el puzzle nunca se vea negro aunque falle la carga de datos.
 */
function dibujarFallbackColorido(ctx, w, h) {
  // Fondo blanco-azulado
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#dbeafe');
  grad.addColorStop(0.5, '#f0f9ff');
  grad.addColorStop(1, '#e0f2fe');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  
  // Círculos de colores dispersos (deterministas)
  const coloresCirculos = ['#f472b6', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#fb923c'];
  for (let i = 0; i < 12; i++) {
    const cx = ((i * 89 + 13) % 100) / 100 * w;
    const cy = ((i * 73 + 41) % 100) / 100 * h;
    const radio = 15 + (i % 5) * 8;
    ctx.fillStyle = coloresCirculos[i % coloresCirculos.length];
    ctx.globalAlpha = 0.12 + (i % 3) * 0.06;
    ctx.beginPath();
    ctx.arc(cx, cy, radio, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;
  
  // Texto central grande
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${Math.round(w * 0.07)}px 'Quicksand', 'Segoe UI', sans-serif`;
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.fillText('🌍 Mundo Kids', w * 0.5, h * 0.48);
  
  ctx.font = `600 ${Math.round(w * 0.028)}px 'Quicksand', 'Segoe UI', sans-serif`;
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.fillText('Rompecabezas Geográfico', w * 0.5, h * 0.58);
}


// =====================================================================
//  FUNCIÓN AUXILIAR: Estrella
// =====================================================================

function dibujarEstrella(ctx, cx, cy, r, puntas) {
  ctx.beginPath();
  for (let i = 0; i < puntas * 2; i++) {
    const radius = i % 2 === 0 ? r : r * 0.4;
    const angle = (i * Math.PI / puntas) - Math.PI / 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}


// =====================================================================
//  FUNCIÓN PRINCIPAL: Generar imagen del puzzle
// =====================================================================

/**
 * Genera una imagen Canvas para el puzzle
 * @param {string} temaId - ID del tema ('mapa', 'continentes', 'banderas', 'animales')
 * @param {number} ancho - Ancho de la imagen en píxeles
 * @param {number} alto - Alto de la imagen en píxeles
 * @returns {Promise<string>} Data URL de la imagen generada
 */
async function generarImagenPuzzle(temaId, ancho = 600, alto = 600) {
  const canvas = document.createElement('canvas');
  canvas.width = ancho;
  canvas.height = alto;
  const ctx = canvas.getContext('2d');
  
  ctx.clearRect(0, 0, ancho, alto);
  
  switch (temaId) {
    case 'mapa':
      await dibujarMapaMundo(ctx, ancho, alto);
      break;
    case 'continentes':
      dibujarContinentes(ctx, ancho, alto);
      break;
    case 'banderas':
      dibujarBanderas(ctx, ancho, alto);
      break;
    case 'animales':
      dibujarAnimales(ctx, ancho, alto);
      break;
    case 'monumentos':
      dibujarMonumentos(ctx, ancho, alto);
      break;
    default:
      // Verificar si es un tema de continente individual (continente-america, continente-europa, etc.)
      if (temaId && temaId.startsWith('continente-')) {
        const contId = temaId.replace('continente-', '');
        await dibujarContinenteIndividual(ctx, ancho, alto, contId);
      } else {
        await dibujarMapaMundo(ctx, ancho, alto);
      }
  }
  
  return canvas.toDataURL('image/jpeg', 0.92);
}


// =====================================================================
//  UTILIDAD: Cargar datos GeoJSON
// =====================================================================

async function cargarDatosGeoJSON() {
  if (datosGeoJSON) return datosGeoJSON;
  const res = await fetch('/data/continentes.geojson');
  if (!res.ok) throw new Error(`Error HTTP ${res.status} al cargar datos del mapa`);
  datosGeoJSON = await res.json();
  return datosGeoJSON;
}


/**
 * Obtiene el nombre descriptivo de un tema para mostrarlo
 */
function obtenerNombreTema(temaId) {
  const nombres = {
    mapa: '🗺️ Mapa del Mundo',
    continentes: '🌍 Los Continentes',
    banderas: '🚩 Banderas del Mundo',
    animales: '🦁 Animales del Mundo',
    monumentos: '🗽 Monumentos del Mundo'
  };
  
  // Temas de continente individual
  if (temaId && temaId.startsWith('continente-')) {
    const contId = temaId.replace('continente-', '');
    const nombresCont = {
      america: '🌎 Puzzle: América',
      europa: '🏰 Puzzle: Europa',
      asia: '🏯 Puzzle: Asia',
      africa: '🦁 Puzzle: África',
      oceania: '🦘 Puzzle: Oceanía',
      antartida: '🐧 Puzzle: Antártida'
    };
    return nombresCont[contId] || `🌍 Puzzle: ${contId}`;
  }
  
  return nombres[temaId] || '🗺️ Mapa del Mundo';
}
