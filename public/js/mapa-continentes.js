// Coordenadas de los límites aproximados de cada continente para interacción
const continentesGeoJSON = {
  america: {
    type: "Feature",
    id: "america",
    properties: { name: "América", color: "rgba(236, 72, 153, 0.4)" }, // Rosa transparente
    geometry: {
      type: "Polygon",
      coordinates: [[
        [-170, 70], [-170, 50], [-140, 60], [-120, 50], [-110, 40],
        [-100, 30], [-95, 20], [-85, 15], [-80, 10], [-75, 5],
        [-70, -10], [-65, -20], [-60, -30], [-55, -40], [-70, -55],
        [-80, -50], [-75, -40], [-70, -30], [-60, -20], [-50, -10],
        [-55, 0], [-60, 10], [-70, 15], [-80, 20], [-90, 25],
        [-100, 30], [-110, 35], [-120, 40], [-130, 50], [-150, 60],
        [-170, 70]
      ]]
    }
  },
  europa: {
    type: "Feature",
    id: "europa",
    properties: { name: "Europa", color: "rgba(59, 130, 246, 0.4)" }, // Azul transparente
    geometry: {
      type: "Polygon",
      coordinates: [[
        [-10, 71], [0, 70], [10, 69], [20, 70], [30, 69],
        [40, 65], [50, 60], [60, 55], [65, 50], [60, 45],
        [50, 42], [40, 40], [30, 38], [20, 36], [10, 36],
        [0, 38], [-10, 42], [-10, 71]
      ]]
    }
  },
  asia: {
    type: "Feature",
    id: "asia",
    properties: { name: "Asia", color: "rgba(251, 191, 36, 0.4)" }, // Amarillo transparente
    geometry: {
      type: "Polygon",
      coordinates: [[
        [40, 70], [50, 72], [70, 75], [90, 75], [110, 72],
        [130, 70], [150, 65], [170, 60], [180, 55], [180, 45],
        [170, 35], [160, 25], [150, 15], [140, 5], [130, -5],
        [120, -10], [110, -8], [100, -5], [90, 0], [80, 5],
        [70, 10], [60, 20], [50, 30], [40, 40], [40, 70]
      ]]
    }
  },
  africa: {
    type: "Feature",
    id: "africa",
    properties: { name: "África", color: "rgba(16, 185, 129, 0.4)" }, // Verde transparente
    geometry: {
      type: "Polygon",
      coordinates: [[
        [-18, 37], [-10, 35], [0, 32], [10, 30], [20, 32],
        [30, 31], [40, 30], [50, 25], [52, 15], [50, 5],
        [45, -5], [40, -15], [35, -25], [25, -33], [15, -35],
        [10, -30], [15, -20], [20, -10], [18, 0], [10, 10],
        [0, 15], [-10, 20], [-18, 30], [-18, 37]
      ]]
    }
  },
  oceania: {
    type: "Feature",
    id: "oceania",
    properties: { name: "Oceanía", color: "rgba(139, 92, 246, 0.4)" }, // Violeta transparente
    geometry: {
      type: "Polygon",
      coordinates: [[
        [110, -10], [120, -12], [130, -15], [140, -20], [150, -25],
        [155, -30], [155, -40], [150, -45], [140, -42], [130, -38],
        [120, -35], [115, -30], [112, -20], [110, -10]
      ]]
    }
  },
  antartida: {
    type: "Feature",
    id: "antartida",
    properties: { name: "Antártida", color: "rgba(107, 114, 128, 0.4)" }, // Gris transparente
    geometry: {
      type: "Polygon",
      coordinates: [[
        [-180, -60], [-90, -65], [0, -70], [90, -65], [180, -60],
        [180, -85], [-180, -85], [-180, -60]
      ]]
    }
  }
};

const features = Object.values(continentesGeoJSON);

// URLs de texturas de alta calidad para el globo (NASA Blue Marble)
const EARTH_TEXTURE = 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg';
const EARTH_BUMP = 'https://unpkg.com/three-globe/example/img/earth-topology.png';

document.addEventListener('DOMContentLoaded', function() {
  const container = document.getElementById('mapa-mundo');
  if (!container) return;

  // Pequeña pausa para asegurar que Globe esté disponible
  setTimeout(() => {
    if (typeof Globe === 'undefined') {
      container.innerHTML = '<div class="flex items-center justify-center h-full text-slate-500">Error: Librería 3D no disponible</div>';
      return;
    }

    try {
      const world = Globe()(container);
      
      // CONFIGURACIÓN VISUAL ESTILO GOOGLE EARTH
      world.width(container.clientWidth);
      world.height(container.clientHeight);
      world.backgroundColor('rgba(0,0,0,0)'); // Fondo transparente para usar el gradiente de la página
      
      // Capas del Globo
      world.globeImageUrl(EARTH_TEXTURE); // Textura real de la Tierra (Océanos azules, tierra verde/marrón)
      world.bumpImageUrl(EARTH_BUMP);     // Relieve de las montañas
      
      // Atmósfera
      world.showAtmosphere(true);
      world.atmosphereColor('#3b82f6'); // Azul brillante
      
      // Polígonos Interactivos (Transparentes sobre la textura)
      world.polygonsData(features);
      world.polygonCapColor(d => d.properties.color);
      world.polygonSideColor(() => 'rgba(255, 255, 255, 0.05)');
      world.polygonStrokeColor(() => 'rgba(255, 255, 255, 0.3)');
      world.polygonAltitude(0.005); // Muy cerca de la superficie
      
      // Tooltips
      world.polygonLabel(d => `
        <div class="globe-tooltip">
          ${d.properties.name}
        </div>
      `);
      
      // Eventos
      world.onPolygonClick(d => {
        window.location.href = '/continente/' + d.id;
      });
      
      world.onPolygonHover(hoverD => {
        // Resaltar continente al pasar el ratón
        world.polygonCapColor(d => d === hoverD ? 'rgba(255, 255, 255, 0.3)' : d.properties.color);
        world.polygonAltitude(d => d === hoverD ? 0.05 : 0.005);
      });

      // Posición inicial (Centrado en el Atlántico para ver América, Europa y África)
      world.pointOfView({ lat: 20, lng: -30, altitude: 2.5 });
      
      // Rotación suave automática
      const controls = world.controls();
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
      }

      window.addEventListener('resize', () => {
        world.width(container.clientWidth);
        world.height(container.clientHeight);
      });

      console.log('✅ Globo Terráqueo con textura real iniciado.');

    } catch (err) {
      console.error('❌ Error al crear el globo:', err);
      container.innerHTML = '<div class="flex items-center justify-center h-full text-slate-500">Error al iniciar el globo 3D</div>';
    }
  }, 150);
});
