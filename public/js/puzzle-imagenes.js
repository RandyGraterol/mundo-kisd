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
//  TEMA: CONTINENTES — un continente al azar por partida (mapa simple)
// =====================================================================

function dibujarSiluetaContinente(ctx, puntos, w, h, color, offsetX, offsetY, escala) {
  escala = escala || 1;
  const cx = w / 2 + (offsetX || 0) * w;
  const cy = h / 2 + (offsetY || 0) * h;
  const factor = Math.min(w, h) * 0.38 * escala;

  ctx.beginPath();
  puntos.forEach((p, i) => {
    const x = cx + p[0] * factor;
    const y = cy + p[1] * factor;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.shadowColor = 'rgba(0,0,0,0.25)';
  ctx.shadowBlur = 12;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function dibujarFondoOceano(ctx, w, h) {
  const grad = ctx.createRadialGradient(w*0.5, h*0.4, w*0.1, w*0.45, h*0.4, w*0.65);
  grad.addColorStop(0, '#aed6f1');
  grad.addColorStop(0.25, '#5dade2');
  grad.addColorStop(0.55, '#3498db');
  grad.addColorStop(1, '#2980b9');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

var CONTINENTE_DISENOS = [
  // 0 — América
  function(ctx, w, h) {
    dibujarFondoOceano(ctx, w, h);
    // América del Norte + América del Sur simplificado
    dibujarSiluetaContinente(ctx, [
      [-0.1,-0.7],[0.2,-0.65],[0.4,-0.5],[0.45,-0.3],[0.35,-0.15],
      [0.3,-0.05],[0.35,0.05],[0.3,0.15],[0.2,0.2],[0.1,0.25],
      [0.05,0.35],[0.0,0.45],[-0.05,0.5],[-0.12,0.45],[-0.15,0.35],
      [-0.1,0.25],[-0.15,0.2],[-0.2,0.15],[-0.25,0.05],[-0.2,-0.05],
      [-0.25,-0.15],[-0.3,-0.25],[-0.35,-0.35],[-0.3,-0.45],[-0.25,-0.55],
      [-0.2,-0.65]
    ], w, h, '#5b8c5a');
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = `700 ${Math.round(Math.min(w,h)*0.055)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 8;
    ctx.fillText('AMÉRICA', w*0.5, h*0.88); ctx.shadowBlur = 0;
  },
  // 1 — Europa
  function(ctx, w, h) {
    dibujarFondoOceano(ctx, w, h);
    dibujarSiluetaContinente(ctx, [
      [-0.15,-0.4],[0.0,-0.45],[0.15,-0.4],[0.2,-0.3],[0.25,-0.2],
      [0.3,-0.1],[0.25,0.0],[0.2,0.05],[0.15,0.1],[0.1,0.05],
      [0.0,0.1],[-0.1,0.05],[-0.15,0.0],[-0.2,-0.05],[-0.25,-0.1],
      [-0.2,-0.2],[-0.15,-0.3]
    ], w, h, '#7aaa6a');
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = `700 ${Math.round(Math.min(w,h)*0.055)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 8;
    ctx.fillText('EUROPA', w*0.5, h*0.88); ctx.shadowBlur = 0;
  },
  // 2 — Asia
  function(ctx, w, h) {
    dibujarFondoOceano(ctx, w, h);
    dibujarSiluetaContinente(ctx, [
      [-0.4,-0.5],[-0.2,-0.55],[0.0,-0.5],[0.2,-0.45],[0.35,-0.4],
      [0.45,-0.3],[0.5,-0.2],[0.55,-0.1],[0.5,0.0],[0.45,0.1],
      [0.4,0.2],[0.35,0.3],[0.25,0.25],[0.15,0.3],[0.05,0.25],
      [-0.05,0.2],[-0.15,0.15],[-0.2,0.05],[-0.25,-0.05],[-0.3,-0.1],
      [-0.35,-0.2],[-0.4,-0.3],[-0.45,-0.4]
    ], w, h, '#c4a86a');
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = `700 ${Math.round(Math.min(w,h)*0.055)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 8;
    ctx.fillText('ASIA', w*0.5, h*0.88); ctx.shadowBlur = 0;
  },
  // 3 — África
  function(ctx, w, h) {
    dibujarFondoOceano(ctx, w, h);
    dibujarSiluetaContinente(ctx, [
      [-0.1,-0.5],[0.1,-0.45],[0.2,-0.35],[0.25,-0.25],[0.2,-0.1],
      [0.15,0.0],[0.1,0.1],[0.05,0.2],[0.0,0.3],[-0.05,0.35],
      [-0.15,0.3],[-0.2,0.2],[-0.15,0.1],[-0.2,0.0],[-0.2,-0.1],
      [-0.25,-0.2],[-0.2,-0.35],[-0.15,-0.45]
    ], w, h, '#c4b06a');
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = `700 ${Math.round(Math.min(w,h)*0.055)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 8;
    ctx.fillText('ÁFRICA', w*0.5, h*0.88); ctx.shadowBlur = 0;
  },
  // 4 — Oceanía
  function(ctx, w, h) {
    dibujarFondoOceano(ctx, w, h);
    dibujarSiluetaContinente(ctx, [
      [-0.1,-0.25],[0.0,-0.3],[0.1,-0.25],[0.15,-0.15],[0.2,-0.05],
      [0.15,0.05],[0.1,0.1],[0.05,0.15],[-0.0,0.2],[-0.05,0.15],
      [-0.1,0.1],[-0.15,0.05],[-0.2,0.0],[-0.15,-0.1],[-0.1,-0.2]
    ], w, h, '#b8884a');
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = `700 ${Math.round(Math.min(w,h)*0.055)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 8;
    ctx.fillText('OCEANÍA', w*0.5, h*0.88); ctx.shadowBlur = 0;
  },
  // 5 — Antártida
  function(ctx, w, h) {
    const grad = ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,'#e0f2fe'); grad.addColorStop(0.5,'#bae6fd'); grad.addColorStop(1,'#7dd3fc');
    ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
    ctx.fillStyle = '#e8ecf0';
    ctx.shadowColor = 'rgba(0,0,0,0.15)'; ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.ellipse(w*0.5, h*0.7, w*0.35, h*0.15, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = `700 ${Math.round(Math.min(w,h)*0.055)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 8;
    ctx.fillText('ANTÁRTIDA', w*0.5, h*0.88); ctx.shadowBlur = 0;
  }
];

var CONTINENTE_SELECCIONADO = -1;

function dibujarContinentes(ctx, w, h) {
  if (CONTINENTE_SELECCIONADO < 0) {
    CONTINENTE_SELECCIONADO = Math.floor(Math.random() * CONTINENTE_DISENOS.length);
  }
  CONTINENTE_DISENOS[CONTINENTE_SELECCIONADO](ctx, w, h);
}


// =====================================================================
//  TEMA: BANDERAS — diseños únicos (se elige 1 al azar por partida)
// =====================================================================

var FLAG_DISENOS = [

  // 0 — Francia (tricolor vertical) con estrella
  function(ctx, w, h, fx, fy, flagW, flagH) {
    ['#0055A4','#FFFFFF','#EF4135'].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.fillRect(fx + (flagW/3)*i, fy, flagW/3+0.5, flagH);
    });
    const cx = fx + flagW/2, cy = fy + flagH/2, r = Math.min(flagW,flagH)*0.18;
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.shadowColor = 'rgba(0,0,0,0.15)'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
    ctx.strokeStyle = '#D4A843'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke();
    dibujarEstrella(ctx,cx,cy,r*0.55,5);
    ctx.fillStyle = '#D4A843'; ctx.shadowColor = 'rgba(212,168,67,0.3)'; ctx.shadowBlur = 6; ctx.fill(); ctx.shadowBlur = 0;
    for (let i = 0; i < 12; i++) {
      const a = (i/12)*Math.PI*2, d = r*0.85;
      ctx.fillStyle = i%2===0 ? '#0055A4' : '#EF4135';
      ctx.beginPath(); ctx.arc(cx+Math.cos(a)*d,cy+Math.sin(a)*d,3,0,Math.PI*2); ctx.fill();
    }
  },

  // 1 — Alemania (tricolor horizontal)
  function(ctx, w, h, fx, fy, flagW, flagH) {
    ['#000000','#DD0000','#FFD700'].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.fillRect(fx, fy + (flagH/3)*i, flagW, flagH/3+0.5);
    });
  },

  // 2 — Italia (tricolor vertical verde-blanco-rojo)
  function(ctx, w, h, fx, fy, flagW, flagH) {
    ['#009246','#FFFFFF','#CE2B37'].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.fillRect(fx + (flagW/3)*i, fy, flagW/3+0.5, flagH);
    });
  },

  // 3 — España (rojo-amarillo-rojo con escudo)
  function(ctx, w, h, fx, fy, flagW, flagH) {
    ctx.fillStyle = '#AA151B';
    ctx.fillRect(fx,fy,flagW,flagH*0.25);
    ctx.fillRect(fx,fy+flagH*0.75,flagW,flagH*0.25);
    ctx.fillStyle = '#F1BF00';
    ctx.fillRect(fx,fy+flagH*0.25,flagW,flagH*0.5);
    const cx = fx+flagW/2, cy = fy+flagH/2, r = Math.min(flagW,flagH)*0.14;
    ctx.fillStyle = 'rgba(0,0,128,0.15)'; ctx.shadowBlur = 0;
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#AA151B'; ctx.font = `700 ${Math.round(r*1.2)}px sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('★', cx, cy);
  },

  // 4 — Brasil (verde con rombo amarillo y círculo azul)
  function(ctx, w, h, fx, fy, flagW, flagH) {
    ctx.fillStyle = '#009739';
    ctx.fillRect(fx,fy,flagW,flagH);
    ctx.fillStyle = '#FEDD00';
    ctx.beginPath();
    ctx.moveTo(fx+flagW*0.5, fy+flagH*0.08);
    ctx.lineTo(fx+flagW*0.82, fy+flagH*0.5);
    ctx.lineTo(fx+flagW*0.5, fy+flagH*0.92);
    ctx.lineTo(fx+flagW*0.18, fy+flagH*0.5);
    ctx.closePath(); ctx.fill();
    const cx = fx+flagW/2, cy = fy+flagH/2, r = Math.min(flagW,flagH)*0.15;
    ctx.fillStyle = '#012169';
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.font = `700 ${Math.round(r*0.7)}px sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('ORDEM', cx, cy-r*0.1);
    ctx.fillStyle = '#009739'; ctx.font = `600 ${Math.round(r*0.35)}px sans-serif`;
    ctx.fillText('E PROGRESSO', cx, cy+r*0.25);
  },

  // 5 — Japón (círculo rojo sobre blanco)
  function(ctx, w, h, fx, fy, flagW, flagH) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(fx,fy,flagW,flagH);
    const cx = fx+flagW/2, cy = fy+flagH/2, r = Math.min(flagW,flagH)*0.28;
    ctx.fillStyle = '#BC002D';
    ctx.shadowColor = 'rgba(0,0,0,0.08)'; ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
  },

  // 6 — Argentina (celeste y blanco con sol)
  function(ctx, w, h, fx, fy, flagW, flagH) {
    ctx.fillStyle = '#75AADB';
    ctx.fillRect(fx,fy,flagW,flagH*0.33);
    ctx.fillRect(fx,fy+flagH*0.66,flagW,flagH*0.34);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(fx,fy+flagH*0.33,flagW,flagH*0.33);
    const cx = fx+flagW/2, cy = fy+flagH/2, r = Math.min(flagW,flagH)*0.16;
    ctx.fillStyle = '#FFD700';
    ctx.shadowColor = 'rgba(255,215,0,0.3)'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#D4A017';
    ctx.font = `700 ${Math.round(r*1.4)}px sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('☀', cx, cy);
  },

  // 7 — México (verde-blanco-rojo vertical con escudo)
  function(ctx, w, h, fx, fy, flagW, flagH) {
    ['#006847','#FFFFFF','#CE1126'].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.fillRect(fx + (flagW/3)*i, fy, flagW/3+0.5, flagH);
    });
    const cx = fx+flagW/2, cy = fy+flagH/2, r = Math.min(flagW,flagH)*0.15;
    ctx.fillStyle = '#5B7C2B';
    ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 4;
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#FFFFFF'; ctx.font = `700 ${Math.round(r)}px sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('🦅', cx, cy+2);
  },

  // 8 — Chile (blanco-rojo con cuadrado azul y estrella)
  function(ctx, w, h, fx, fy, flagW, flagH) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(fx,fy,flagW,flagH*0.5);
    ctx.fillStyle = '#D52B1E';
    ctx.fillRect(fx,fy+flagH*0.5,flagW,flagH*0.5);
    ctx.fillStyle = '#0039A6';
    ctx.fillRect(fx,fy,flagW*0.4,flagH*0.5);
    const cx = fx+flagW*0.2, cy = fy+flagH*0.25;
    const r = Math.min(flagW,flagH)*0.04;
    dibujarEstrella(ctx,cx,cy,r,5);
    ctx.fillStyle = '#FFFFFF'; ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 3; ctx.fill(); ctx.shadowBlur = 0;
  },

  // 9 — Grecia (azul y blanco con cruz)
  function(ctx, w, h, fx, fy, flagW, flagH) {
    for (let i = 0; i < 9; i++) {
      ctx.fillStyle = i%2===0 ? '#0D5EAF' : '#FFFFFF';
      ctx.fillRect(fx, fy + (flagH/9)*i, flagW, flagH/9+0.5);
    }
    const cw = flagW*0.4, ch = flagH*0.44;
    ctx.fillStyle = '#0D5EAF';
    ctx.fillRect(fx,fy,cw,ch);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(fx+cw*0.42, fy, cw*0.16, ch);
    ctx.fillRect(fx, fy+ch*0.42, cw, ch*0.16);
  }
];

var FLAG_SELECCIONADA = -1;

function dibujarBanderas(ctx, w, h) {
  // Fondo degradado azul cielo
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#dbeafe');
  grad.addColorStop(0.3, '#bfdbfe');
  grad.addColorStop(0.6, '#93c5fd');
  grad.addColorStop(1, '#60a5fa');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Elegir diseño al azar
  if (FLAG_SELECCIONADA < 0) {
    FLAG_SELECCIONADA = Math.floor(Math.random() * FLAG_DISENOS.length);
  }

  // ── Una sola bandera grande ──
  const flagW = w * 0.7;
  const flagH = h * 0.55;
  const fx = (w - flagW) / 2;
  const fy = (h - flagH) / 2;

  // Sombra de la bandera
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 4;

  // Dibujar el diseño elegido
  FLAG_DISENOS[FLAG_SELECCIONADA](ctx, w, h, fx, fy, flagW, flagH);

  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // ── Marco de la bandera ──
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 2;
  ctx.strokeRect(fx, fy, flagW, flagH);

  // ── Asta decorativa ──
  ctx.fillStyle = '#8B7355';
  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 4;
  ctx.fillRect(fx - flagW * 0.03, fy, flagW * 0.03, flagH);
  ctx.shadowBlur = 0;

  // ── Texto inferior ──
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = `600 ${Math.round(w * 0.03)}px 'Quicksand', 'Segoe UI', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('BANDERAS DEL MUNDO', w * 0.5, h * 0.92);
}


// =====================================================================
//  TEMA: ANIMALES — un animal grande al azar por partida
// =====================================================================

var ANIMAL_DISENOS = [
  // 0 — León (sabana)
  function(ctx, w, h) {
    const grad = ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,'#fbbf24'); grad.addColorStop(0.4,'#f59e0b');
    grad.addColorStop(0.7,'#86efac'); grad.addColorStop(1,'#22c55e');
    ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
    const eSize = Math.min(w,h)*0.45;
    ctx.font = `${eSize}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.2)'; ctx.shadowBlur = 15;
    ctx.fillText('🦁', w*0.5, h*0.48); ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.font = `600 ${Math.round(w*0.035)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('LEÓN', w*0.5, h*0.85);
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.font = `${Math.round(w*0.02)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('Rey de la sabana africana', w*0.5, h*0.91);
  },
  // 1 — Pingüino (antártico)
  function(ctx, w, h) {
    const grad = ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,'#e0f2fe'); grad.addColorStop(0.3,'#bae6fd');
    grad.addColorStop(0.6,'#7dd3fc'); grad.addColorStop(1,'#38bdf8');
    ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
    for (let i = 0; i < 15; i++) {
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.beginPath(); ctx.arc(((i*137+47)%100)/100*w, ((i*89+23)%100)/100*h, 1.5, 0, Math.PI*2); ctx.fill();
    }
    const eSize = Math.min(w,h)*0.4;
    ctx.font = `${eSize}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.15)'; ctx.shadowBlur = 12;
    ctx.fillText('🐧', w*0.5, h*0.48); ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.font = `600 ${Math.round(w*0.035)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('PINGÜINO', w*0.5, h*0.85);
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.font = `${Math.round(w*0.02)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('Habitante del hielo antártico', w*0.5, h*0.91);
  },
  // 2 — Perro (doméstico / pastor alemán)
  function(ctx, w, h) {
    const grad = ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,'#fef3c7'); grad.addColorStop(0.5,'#fde68a'); grad.addColorStop(1,'#fcd34d');
    ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
    const eSize = Math.min(w,h)*0.45;
    ctx.font = `${eSize}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.2)'; ctx.shadowBlur = 15;
    ctx.fillText('🐕', w*0.5, h*0.48); ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.font = `600 ${Math.round(w*0.035)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('PERRO', w*0.5, h*0.85);
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.font = `${Math.round(w*0.02)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('El mejor amigo del hombre', w*0.5, h*0.91);
  },
  // 3 — Gato
  function(ctx, w, h) {
    const grad = ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,'#ddd6fe'); grad.addColorStop(0.5,'#c4b5fd'); grad.addColorStop(1,'#a78bfa');
    ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
    const eSize = Math.min(w,h)*0.45;
    ctx.font = `${eSize}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.2)'; ctx.shadowBlur = 15;
    ctx.fillText('🐱', w*0.5, h*0.48); ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.font = `600 ${Math.round(w*0.035)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('GATO', w*0.5, h*0.85);
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.font = `${Math.round(w*0.02)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('Felino doméstico', w*0.5, h*0.91);
  },
  // 4 — Elefante
  function(ctx, w, h) {
    const grad = ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,'#a78bfa'); grad.addColorStop(0.5,'#8b5cf6'); grad.addColorStop(1,'#6d28d9');
    ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
    const eSize = Math.min(w,h)*0.4;
    ctx.font = `${eSize}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.2)'; ctx.shadowBlur = 15;
    ctx.fillText('🐘', w*0.5, h*0.48); ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = `600 ${Math.round(w*0.035)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('ELEFANTE', w*0.5, h*0.85);
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = `${Math.round(w*0.02)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('El animal terrestre más grande', w*0.5, h*0.91);
  },
  // 5 — Delfín
  function(ctx, w, h) {
    const grad = ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,'#dbeafe'); grad.addColorStop(0.5,'#93c5fd'); grad.addColorStop(1,'#3b82f6');
    ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
    const eSize = Math.min(w,h)*0.45;
    ctx.font = `${eSize}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.15)'; ctx.shadowBlur = 15;
    ctx.fillText('🐬', w*0.5, h*0.48); ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = `600 ${Math.round(w*0.035)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('DELFÍN', w*0.5, h*0.85);
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.font = `${Math.round(w*0.02)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('Inteligente nadador del océano', w*0.5, h*0.91);
  },
  // 6 — Tigre
  function(ctx, w, h) {
    const grad = ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,'#fdba74'); grad.addColorStop(0.5,'#fb923c'); grad.addColorStop(1,'#f97316');
    ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
    const eSize = Math.min(w,h)*0.42;
    ctx.font = `${eSize}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.2)'; ctx.shadowBlur = 15;
    ctx.fillText('🐅', w*0.5, h*0.48); ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.font = `600 ${Math.round(w*0.035)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('TIGRE', w*0.5, h*0.85);
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.font = `${Math.round(w*0.02)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('El gran felino rayado de Asia', w*0.5, h*0.91);
  },
  // 7 — Oso Panda
  function(ctx, w, h) {
    const grad = ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,'#e5e7eb'); grad.addColorStop(0.5,'#d1d5db'); grad.addColorStop(1,'#9ca3af');
    ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
    const eSize = Math.min(w,h)*0.45;
    ctx.font = `${eSize}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.2)'; ctx.shadowBlur = 15;
    ctx.fillText('🐼', w*0.5, h*0.48); ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.font = `600 ${Math.round(w*0.035)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('OSO PANDA', w*0.5, h*0.85);
    ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.font = `${Math.round(w*0.02)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('Tesoro nacional de China', w*0.5, h*0.91);
  },
  // 8 — Águila
  function(ctx, w, h) {
    const grad = ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,'#bfdbfe'); grad.addColorStop(0.3,'#93c5fd');
    grad.addColorStop(0.6,'#fde68a'); grad.addColorStop(1,'#fcd34d');
    ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
    const eSize = Math.min(w,h)*0.45;
    ctx.font = `${eSize}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.2)'; ctx.shadowBlur = 15;
    ctx.fillText('🦅', w*0.5, h*0.48); ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.font = `600 ${Math.round(w*0.035)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('ÁGUILA', w*0.5, h*0.85);
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.font = `${Math.round(w*0.02)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('Señora de los cielos', w*0.5, h*0.91);
  },
  // 9 — Canguro
  function(ctx, w, h) {
    const grad = ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,'#fef3c7'); grad.addColorStop(0.5,'#fde68a'); grad.addColorStop(1,'#f59e0b');
    ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
    const eSize = Math.min(w,h)*0.42;
    ctx.font = `${eSize}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.2)'; ctx.shadowBlur = 15;
    ctx.fillText('🦘', w*0.5, h*0.48); ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.font = `600 ${Math.round(w*0.035)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('CANGURO', w*0.5, h*0.85);
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.font = `${Math.round(w*0.02)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('El saltador de Oceanía', w*0.5, h*0.91);
  },
  // 10 — Mariposa
  function(ctx, w, h) {
    const grad = ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,'#fce7f3'); grad.addColorStop(0.5,'#fbcfe8'); grad.addColorStop(1,'#f9a8d4');
    ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
    const eSize = Math.min(w,h)*0.5;
    ctx.font = `${eSize}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.15)'; ctx.shadowBlur = 12;
    ctx.fillText('🦋', w*0.5, h*0.48); ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.font = `600 ${Math.round(w*0.035)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('MARIPOSA', w*0.5, h*0.85);
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.font = `${Math.round(w*0.02)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('Belleza alada de la naturaleza', w*0.5, h*0.91);
  }
];

var ANIMAL_SELECCIONADO = -1;

function dibujarAnimales(ctx, w, h) {
  if (ANIMAL_SELECCIONADO < 0) {
    ANIMAL_SELECCIONADO = Math.floor(Math.random() * ANIMAL_DISENOS.length);
  }
  ANIMAL_DISENOS[ANIMAL_SELECCIONADO](ctx, w, h);
}


// =====================================================================
//  TEMA: MONUMENTOS — un monumento grande al azar por partida
// =====================================================================

var MONUMENTO_DISENOS = [
  // 0 — Estatua de la Libertad
  function(ctx, w, h) {
    const grad = ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,'#dbeafe'); grad.addColorStop(0.5,'#bfdbfe'); grad.addColorStop(1,'#93c5fd');
    ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
    const eSize = Math.min(w,h)*0.45;
    ctx.font = `${eSize}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.2)'; ctx.shadowBlur = 15;
    ctx.fillText('🗽', w*0.5, h*0.46); ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.font = `600 ${Math.round(w*0.035)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('ESTATUA DE LA LIBERTAD', w*0.5, h*0.83);
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.font = `${Math.round(w*0.02)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('Nueva York, EE.UU.', w*0.5, h*0.89);
  },
  // 1 — Torre Eiffel
  function(ctx, w, h) {
    const grad = ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,'#fef3c7'); grad.addColorStop(0.5,'#fde68a'); grad.addColorStop(1,'#fcd34d');
    ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
    const eSize = Math.min(w,h)*0.5;
    ctx.font = `${eSize}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.2)'; ctx.shadowBlur = 15;
    ctx.fillText('🗼', w*0.5, h*0.46); ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.font = `600 ${Math.round(w*0.035)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('TORRE EIFFEL', w*0.5, h*0.83);
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.font = `${Math.round(w*0.02)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('París, Francia', w*0.5, h*0.89);
  },
  // 2 — Coliseo Romano
  function(ctx, w, h) {
    const grad = ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,'#fce7f3'); grad.addColorStop(0.5,'#fbcfe8'); grad.addColorStop(1,'#f9a8d4');
    ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
    const eSize = Math.min(w,h)*0.45;
    ctx.font = `${eSize}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.2)'; ctx.shadowBlur = 15;
    ctx.fillText('🏛️', w*0.5, h*0.46); ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.font = `600 ${Math.round(w*0.035)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('COLISEO ROMANO', w*0.5, h*0.83);
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.font = `${Math.round(w*0.02)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('Roma, Italia', w*0.5, h*0.89);
  },
  // 3 — Monte Fuji
  function(ctx, w, h) {
    const grad = ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,'#e0f2fe'); grad.addColorStop(0.4,'#bae6fd'); grad.addColorStop(1,'#7dd3fc');
    ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
    const eSize = Math.min(w,h)*0.5;
    ctx.font = `${eSize}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.2)'; ctx.shadowBlur = 15;
    ctx.fillText('🗻', w*0.5, h*0.46); ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.font = `600 ${Math.round(w*0.035)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('MONTE FUJI', w*0.5, h*0.83);
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.font = `${Math.round(w*0.02)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('Honshu, Japón', w*0.5, h*0.89);
  },
  // 4 — Cristo Redentor
  function(ctx, w, h) {
    const grad = ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,'#fef3c7'); grad.addColorStop(0.5,'#fde68a'); grad.addColorStop(1,'#f59e0b');
    ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
    const eSize = Math.min(w,h)*0.45;
    ctx.font = `${eSize}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.2)'; ctx.shadowBlur = 15;
    ctx.fillText('⛪', w*0.5, h*0.46); ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.font = `600 ${Math.round(w*0.035)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('CRISTO REDENTOR', w*0.5, h*0.83);
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.font = `${Math.round(w*0.02)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('Río de Janeiro, Brasil', w*0.5, h*0.89);
  },
  // 5 — Pirámides de Guiza
  function(ctx, w, h) {
    const grad = ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,'#fbbf24'); grad.addColorStop(0.5,'#f59e0b'); grad.addColorStop(1,'#d97706');
    ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
    const eSize = Math.min(w,h)*0.45;
    ctx.font = `${eSize}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.2)'; ctx.shadowBlur = 15;
    ctx.fillText('🔺', w*0.5, h*0.46); ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.font = `600 ${Math.round(w*0.035)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('PIRÁMIDES DE GUIZA', w*0.5, h*0.83);
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.font = `${Math.round(w*0.02)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('El Cairo, Egipto', w*0.5, h*0.89);
  },
  // 6 — Gran Muralla China
  function(ctx, w, h) {
    const grad = ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,'#dcfce7'); grad.addColorStop(0.5,'#bbf7d0'); grad.addColorStop(1,'#86efac');
    ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
    const eSize = Math.min(w,h)*0.45;
    ctx.font = `${eSize}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.2)'; ctx.shadowBlur = 15;
    ctx.fillText('🏯', w*0.5, h*0.46); ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.font = `600 ${Math.round(w*0.035)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('GRAN MURALLA CHINA', w*0.5, h*0.83);
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.font = `${Math.round(w*0.02)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('China', w*0.5, h*0.89);
  },
  // 7 — Ópera de Sídney
  function(ctx, w, h) {
    const grad = ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,'#e0f2fe'); grad.addColorStop(0.5,'#bae6fd'); grad.addColorStop(1,'#7dd3fc');
    ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
    const eSize = Math.min(w,h)*0.45;
    ctx.font = `${eSize}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.2)'; ctx.shadowBlur = 15;
    ctx.fillText('🎭', w*0.5, h*0.46); ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.font = `600 ${Math.round(w*0.035)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('ÓPERA DE SÍDNEY', w*0.5, h*0.83);
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.font = `${Math.round(w*0.02)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('Sídney, Australia', w*0.5, h*0.89);
  },
  // 8 — Taj Mahal
  function(ctx, w, h) {
    const grad = ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,'#fdf2f8'); grad.addColorStop(0.5,'#fce7f3'); grad.addColorStop(1,'#fbcfe8');
    ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
    const eSize = Math.min(w,h)*0.45;
    ctx.font = `${eSize}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.2)'; ctx.shadowBlur = 15;
    ctx.fillText('🕌', w*0.5, h*0.46); ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.font = `600 ${Math.round(w*0.035)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('TAJ MAHAL', w*0.5, h*0.83);
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.font = `${Math.round(w*0.02)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('Agra, India', w*0.5, h*0.89);
  },
  // 9 — Machu Picchu
  function(ctx, w, h) {
    const grad = ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,'#fef3c7'); grad.addColorStop(0.5,'#d9f99d'); grad.addColorStop(1,'#86efac');
    ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
    const eSize = Math.min(w,h)*0.45;
    ctx.font = `${eSize}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.2)'; ctx.shadowBlur = 15;
    ctx.fillText('🏔️', w*0.5, h*0.46); ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.font = `600 ${Math.round(w*0.035)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('MACHU PICCHU', w*0.5, h*0.83);
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.font = `${Math.round(w*0.02)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('Cusco, Perú', w*0.5, h*0.89);
  },
  // 10 — Big Ben
  function(ctx, w, h) {
    const grad = ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,'#f3e8ff'); grad.addColorStop(0.5,'#e9d5ff'); grad.addColorStop(1,'#d8b4fe');
    ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
    const eSize = Math.min(w,h)*0.45;
    ctx.font = `${eSize}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.2)'; ctx.shadowBlur = 15;
    ctx.fillText('🕰️', w*0.5, h*0.46); ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.font = `600 ${Math.round(w*0.035)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('BIG BEN', w*0.5, h*0.83);
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.font = `${Math.round(w*0.02)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('Londres, Reino Unido', w*0.5, h*0.89);
  },
  // 11 — Moái de Rapa Nui
  function(ctx, w, h) {
    const grad = ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,'#fef3c7'); grad.addColorStop(0.5,'#fde68a'); grad.addColorStop(1,'#fcd34d');
    ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
    const eSize = Math.min(w,h)*0.45;
    ctx.font = `${eSize}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.2)'; ctx.shadowBlur = 15;
    ctx.fillText('🗿', w*0.5, h*0.46); ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.font = `600 ${Math.round(w*0.035)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('MOÁI DE RAPA NUI', w*0.5, h*0.83);
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.font = `${Math.round(w*0.02)}px 'Quicksand','Segoe UI',sans-serif`;
    ctx.fillText('Isla de Pascua, Chile', w*0.5, h*0.89);
  }
];

var MONUMENTO_SELECCIONADO = -1;

function dibujarMonumentos(ctx, w, h) {
  if (MONUMENTO_SELECCIONADO < 0) {
    MONUMENTO_SELECCIONADO = Math.floor(Math.random() * MONUMENTO_DISENOS.length);
  }
  MONUMENTO_DISENOS[MONUMENTO_SELECCIONADO](ctx, w, h);
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
