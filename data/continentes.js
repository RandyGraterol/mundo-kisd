// Datos mock de continentes para Mundo Kids
// Cada continente incluye información educativa completa

const continentes = [
  {
    id: 'america',
    nombre: 'América',
    emoji: '🌎',
    color: '#ec4899', // Rosa/Fucsia
    descripcion: 'América es el segundo continente más grande del mundo, dividido en América del Norte, Central y del Sur. Tiene una gran diversidad de climas, desde el frío ártico hasta las selvas tropicales. Es hogar de culturas milenarias como los mayas, aztecas e incas.',
    datosCuriosos: 'El río Amazonas, que atraviesa América del Sur, es el más caudaloso del mundo y su selva produce el 20% del oxígeno de la Tierra.',
    paisesPrincipales: ['Brasil', 'Estados Unidos', 'México', 'Argentina', 'Canadá', 'Venezuela'],
    preguntas: [
      {
        id: 'america-1',
        pregunta: '¿Cuál es el río más caudaloso del mundo que está en América?',
        opciones: ['Río Nilo', 'Río Amazonas', 'Río Mississippi', 'Río Orinoco'],
        respuestaCorrecta: 1,
        puntos: 10
      },
      {
        id: 'america-2',
        pregunta: '¿En qué país de América está Venezuela?',
        opciones: ['América del Norte', 'América Central', 'América del Sur', 'América Antártica'],
        respuestaCorrecta: 2,
        puntos: 10
      },
      {
        id: 'america-3',
        pregunta: '¿Qué culturas antiguas vivieron en América?',
        opciones: ['Egipcios y Griegos', 'Mayas, Aztecas e Incas', 'Romanos y Vikingos', 'Samurais y Ninjas'],
        respuestaCorrecta: 1,
        puntos: 10
      }
    ]
  },
  {
    id: 'europa',
    nombre: 'Europa',
    emoji: '🏰',
    color: '#3b82f6', // Azul
    descripcion: 'Europa es un continente con una rica historia y cultura. Aunque es el segundo continente más pequeño, tiene una gran densidad de población. Es conocido por sus monumentos históricos, arte y arquitectura. Aquí nacieron grandes civilizaciones como la griega y la romana.',
    datosCuriosos: 'Europa tiene más de 200 idiomas diferentes y es el continente con mayor número de países pequeños. El Vaticano, el país más pequeño del mundo, está en Europa.',
    paisesPrincipales: ['Rusia', 'Alemania', 'Francia', 'Reino Unido', 'Italia', 'España'],
    preguntas: [
      {
        id: 'europa-1',
        pregunta: '¿Cuál es el país más pequeño del mundo que está en Europa?',
        opciones: ['Mónaco', 'El Vaticano', 'San Marino', 'Liechtenstein'],
        respuestaCorrecta: 1,
        puntos: 10
      },
      {
        id: 'europa-2',
        pregunta: '¿Qué civilizaciones antiguas nacieron en Europa?',
        opciones: ['Mayas y Aztecas', 'Egipcios y Persas', 'Griegos y Romanos', 'Incas y Olmecas'],
        respuestaCorrecta: 2,
        puntos: 10
      },
      {
        id: 'europa-3',
        pregunta: '¿Cuántos idiomas diferentes tiene Europa aproximadamente?',
        opciones: ['50 idiomas', '100 idiomas', 'Más de 200 idiomas', '500 idiomas'],
        respuestaCorrecta: 2,
        puntos: 10
      }
    ]
  },
  {
    id: 'asia',
    nombre: 'Asia',
    emoji: '🏯',
    color: '#fbbf24', // Amarillo
    descripcion: 'Asia es el continente más grande y poblado del mundo. Tiene una increíble diversidad de paisajes, desde las montañas más altas (el Himalaya) hasta desiertos y selvas tropicales. Es la cuna de grandes civilizaciones antiguas como China, India y Mesopotamia.',
    datosCuriosos: 'El Monte Everest, la montaña más alta del mundo con 8,848 metros, está en Asia. Además, más de la mitad de la población mundial vive en este continente.',
    paisesPrincipales: ['China', 'India', 'Japón', 'Indonesia', 'Corea del Sur', 'Tailandia'],
    preguntas: [
      {
        id: 'asia-1',
        pregunta: '¿Cuál es la montaña más alta del mundo que está en Asia?',
        opciones: ['Monte Kilimanjaro', 'Monte Aconcagua', 'Monte Everest', 'Monte Fuji'],
        respuestaCorrecta: 2,
        puntos: 10
      },
      {
        id: 'asia-2',
        pregunta: '¿Qué porcentaje de la población mundial vive en Asia?',
        opciones: ['Un cuarto', 'Un tercio', 'Más de la mitad', 'Casi toda'],
        respuestaCorrecta: 2,
        puntos: 10
      },
      {
        id: 'asia-3',
        pregunta: '¿Cuántos metros de altura tiene el Monte Everest?',
        opciones: ['5,000 metros', '6,500 metros', '8,848 metros', '10,000 metros'],
        respuestaCorrecta: 2,
        puntos: 10
      }
    ]
  },
  {
    id: 'africa',
    nombre: 'África',
    emoji: '🦁',
    color: '#10b981', // Verde
    descripcion: 'África es el tercer continente más grande del mundo y es conocido como la cuna de la humanidad. Tiene una increíble diversidad de vida salvaje, con animales como leones, elefantes y jirafas. El desierto del Sahara, el más grande del mundo, está en África.',
    datosCuriosos: 'El río Nilo, que atraviesa África, es el río más largo del mundo con 6,650 kilómetros. África tiene más de 3,000 grupos étnicos diferentes y más de 2,000 idiomas.',
    paisesPrincipales: ['Nigeria', 'Egipto', 'Sudáfrica', 'Kenia', 'Etiopía', 'Marruecos'],
    preguntas: [
      {
        id: 'africa-1',
        pregunta: '¿Cuál es el río más largo del mundo que está en África?',
        opciones: ['Río Congo', 'Río Nilo', 'Río Níger', 'Río Zambeze'],
        respuestaCorrecta: 1,
        puntos: 10
      },
      {
        id: 'africa-2',
        pregunta: '¿Por qué África es conocida como la cuna de la humanidad?',
        opciones: ['Porque tiene muchos animales', 'Porque ahí nacieron los primeros humanos', 'Porque es muy grande', 'Porque tiene pirámides'],
        respuestaCorrecta: 1,
        puntos: 10
      },
      {
        id: 'africa-3',
        pregunta: '¿Cuál es el desierto más grande del mundo?',
        opciones: ['Desierto de Gobi', 'Desierto de Atacama', 'Desierto del Sahara', 'Desierto de Arabia'],
        respuestaCorrecta: 2,
        puntos: 10
      }
    ]
  },
  {
    id: 'oceania',
    nombre: 'Oceanía',
    emoji: '🦘',
    color: '#8b5cf6', // Morado
    descripcion: 'Oceanía es el continente más pequeño, formado por miles de islas en el océano Pacífico. Australia es el país más grande de este continente. Tiene animales únicos que no se encuentran en ningún otro lugar, como los canguros y los koalas.',
    datosCuriosos: 'Hay más ovejas y canguros que personas en gran parte de este continente. La Gran Barrera de Coral, el arrecife de coral más grande del mundo, está en Australia.',
    paisesPrincipales: ['Australia', 'Fiyi', 'Islas Marshall', 'Islas Salomón', 'Kiribati', 'Micronesia', 'Nauru', 'Nueva Zelanda', 'Palaos', 'Papúa N. Guinea', 'Samoa', 'Tonga', 'Tuvalu', 'Vanuatu'],
    preguntas: [
      {
        id: 'oceania-1',
        pregunta: '¿Qué animales únicos viven en Oceanía?',
        opciones: ['Leones y tigres', 'Canguros y koalas', 'Osos y lobos', 'Elefantes y jirafas'],
        respuestaCorrecta: 1,
        puntos: 10
      },
      {
        id: 'oceania-2',
        pregunta: '¿Cuál es el país más grande de Oceanía?',
        opciones: ['Nueva Zelanda', 'Fiyi', 'Australia', 'Papúa Nueva Guinea'],
        respuestaCorrecta: 2,
        puntos: 10
      },
      {
        id: 'oceania-3',
        pregunta: '¿Qué es la Gran Barrera de Coral?',
        opciones: ['Una montaña', 'El arrecife de coral más grande del mundo', 'Un río', 'Un desierto'],
        respuestaCorrecta: 1,
        puntos: 10
      }
    ]
  },
  {
    id: 'antartida',
    nombre: 'Antártida',
    emoji: '🐧',
    color: '#6b7280', // Gris
    descripcion: 'La Antártida es el continente más frío, seco y ventoso de la Tierra. Está cubierto casi completamente de hielo y nieve. No tiene población permanente, solo científicos que viven temporalmente en estaciones de investigación. Es el hogar de pingüinos, focas y ballenas.',
    datosCuriosos: 'La Antártida contiene el 90% del hielo del mundo y el 70% del agua dulce del planeta. La temperatura más baja registrada en la Tierra fue aquí: -89.2°C.',
    paisesPrincipales: [], // No tiene países, es un territorio internacional
    preguntas: [
      {
        id: 'antartida-1',
        pregunta: '¿Qué porcentaje del hielo del mundo está en la Antártida?',
        opciones: ['50%', '70%', '90%', '100%'],
        respuestaCorrecta: 2,
        puntos: 10
      },
      {
        id: 'antartida-2',
        pregunta: '¿Qué animales viven en la Antártida?',
        opciones: ['Leones y elefantes', 'Canguros y koalas', 'Pingüinos, focas y ballenas', 'Tigres y osos'],
        respuestaCorrecta: 2,
        puntos: 10
      },
      {
        id: 'antartida-3',
        pregunta: '¿Por qué no hay población permanente en la Antártida?',
        opciones: ['Porque es muy pequeña', 'Porque es muy fría y difícil vivir ahí', 'Porque no hay agua', 'Porque está prohibido'],
        respuestaCorrecta: 1,
        puntos: 10
      }
    ]
  }
];

/**
 * Obtiene todos los continentes disponibles
 * @returns {Array} Array con todos los continentes
 */
function obtenerContinentes() {
  return continentes;
}

/**
 * Obtiene un continente específico por su ID
 * @param {string} id - ID del continente (america, europa, asia, africa, oceania, antartida)
 * @returns {Object|undefined} Objeto del continente o undefined si no existe
 */
function obtenerContinentePorId(id) {
  return continentes.find(c => c.id === id);
}

module.exports = {
  obtenerContinentes,
  obtenerContinentePorId
};
