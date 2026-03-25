// Coordenadas de los límites aproximados de cada continente
// Formato: [longitud, latitud] para GeoJSON

const continentesGeoJSON = {
  america: {
    type: "Feature",
    properties: {
      name: "América",
      color: "#ec4899",
      center: [-90, 20]
    },
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
    properties: {
      name: "Europa",
      color: "#3b82f6",
      center: [25, 54]
    },
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
    properties: {
      name: "Asia",
      color: "#fbbf24",
      center: [100, 45]
    },
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
    properties: {
      name: "África",
      color: "#10b981",
      center: [20, 5]
    },
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
    properties: {
      name: "Oceanía",
      color: "#8b5cf6",
      center: [135, -25]
    },
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
    properties: {
      name: "Antártida",
      color: "#6b7280",
      center: [0, -75]
    },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [-180, -60], [-90, -65], [0, -70], [90, -65], [180, -60],
        [180, -85], [-180, -85], [-180, -60]
      ]]
    }
  }
};

// Inicializar el mapa cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  // Crear el mapa centrado en el mundo
  const map = L.map('mapa-mundo', {
    center: [20, 0],
    zoom: 2,
    minZoom: 2,
    maxZoom: 5,
    worldCopyJump: true,
    zoomControl: true
  });

  // Agregar capa de mapa base (OpenStreetMap)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    noWrap: false
  }).addTo(map);

  // Agregar cada continente al mapa
  Object.keys(continentesGeoJSON).forEach(function(continenteId) {
    const continente = continentesGeoJSON[continenteId];
    
    // Crear polígono para el continente
    const polygon = L.geoJSON(continente, {
      style: {
        fillColor: continente.properties.color,
        fillOpacity: 0.4,
        color: continente.properties.color,
        weight: 3,
        opacity: 0.9
      }
    }).addTo(map);

    // Agregar interactividad
    polygon.on('mouseover', function(e) {
      e.target.setStyle({
        fillOpacity: 0.6,
        weight: 5
      });
    });

    polygon.on('mouseout', function(e) {
      e.target.setStyle({
        fillOpacity: 0.4,
        weight: 3
      });
    });

    polygon.on('click', function() {
      window.location.href = '/continente/' + continenteId;
    });

    // Agregar tooltip con el nombre del continente
    polygon.bindTooltip(continente.properties.name, {
      permanent: false,
      direction: 'center',
      className: 'continente-tooltip'
    });

    // Agregar etiqueta permanente con el nombre del continente
    if (continente.properties.center) {
      const marker = L.marker(continente.properties.center, {
        icon: L.divIcon({
          className: 'continente-label',
          html: '<div style="background-color: ' + continente.properties.color + '; color: white; padding: 4px 12px; border-radius: 12px; font-weight: bold; font-size: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); white-space: nowrap; cursor: pointer;">' + continente.properties.name + '</div>',
          iconSize: null
        }),
        interactive: true
      }).addTo(map);

      // Hacer que la etiqueta también sea clickeable
      marker.on('click', function() {
        window.location.href = '/continente/' + continenteId;
      });
    }
  });
});
