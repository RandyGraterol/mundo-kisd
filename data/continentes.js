// Datos mock de continentes para Mundo Kids
// Cada continente incluye información educativa completa

const continentes = [
  {
    id: 'america',
    nombre: 'América',
    svgIcon: 'america',
    color: '#ec4899', // Rosa/Fucsia
    descripcion: 'América es el segundo continente más grande del mundo, dividido en América del Norte, Central y del Sur. Tiene una gran diversidad de climas, desde el frío ártico hasta las selvas tropicales. Es hogar de culturas milenarias como los mayas, aztecas e incas.',
    datosCuriosos: [
      'El río Amazonas, que atraviesa América del Sur, es el más caudaloso del mundo y su selva produce el 20% del oxígeno de la Tierra.',
      'América tiene el desierto más seco del mundo: el Desierto de Atacama en Chile, donde hay zonas que nunca han registrado lluvias.',
      'El Gran Cañón en Estados Unidos tiene casi 2,000 millones de años de antigüedad y fue formado por el río Colorado.',
      'Canadá tiene más lagos que cualquier otro país del mundo: más de 2 millones de lagos.',
      'Brasil es el país con mayor biodiversidad del planeta, con más de 4,000 especies de aves y mamíferos.'
    ],
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
        pregunta: '¿En qué región de América está Venezuela?',
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
      },
      {
        id: 'america-4',
        pregunta: '¿Cuál es el desierto más seco del mundo y en qué país está?',
        opciones: ['Desierto de Sonora (México)', 'Desierto de Atacama (Chile)', 'Desierto de Mojave (EE.UU.)', 'Desierto de Patagonia (Argentina)'],
        respuestaCorrecta: 1,
        puntos: 12
      },
      {
        id: 'america-5',
        pregunta: '¿Qué país americano tiene más lagos que el resto del mundo juntos?',
        opciones: ['Estados Unidos', 'Brasil', 'Canadá', 'Argentina'],
        respuestaCorrecta: 2,
        puntos: 12
      },
      {
        id: 'america-6',
        pregunta: '¿Cuál es la catarata más alta del mundo y dónde está?',
        opciones: ['Cataratas del Niágara (Canadá)', 'Salto Ángel (Venezuela)', 'Cataratas de Iguazú (Argentina)', 'Cataratas Victoria (Brasil)'],
        respuestaCorrecta: 1,
        puntos: 15
      }
    ]
  },
  {
    id: 'europa',
    nombre: 'Europa',
    svgIcon: 'europa',
    color: '#3b82f6', // Azul
    descripcion: 'Europa es un continente con una rica historia y cultura. Aunque es el segundo continente más pequeño, tiene una gran densidad de población. Es conocido por sus monumentos históricos, arte y arquitectura. Aquí nacieron grandes civilizaciones como la griega y la romana.',
    datosCuriosos: [
      'Europa tiene más de 200 idiomas diferentes y es el continente con mayor número de países pequeños.',
      'El Vaticano, el país más pequeño del mundo con solo 0.44 km², está en Europa y es gobernado por el Papa.',
      'Los Juegos Olímpicos modernos comenzaron en Atenas, Grecia, en 1896, inspirándose en los antiguos juegos de Olimpia.',
      'El tren más rápido del mundo está en Francia: el TGV alcanzó una velocidad récord de 574.8 km/h.',
      'Islandia, un país europeo, no tiene ejército y es uno de los lugares más seguros del mundo para vivir.'
    ],
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
      },
      {
        id: 'europa-4',
        pregunta: '¿En qué ciudad comenzaron los Juegos Olímpicos modernos en 1896?',
        opciones: ['Roma', 'Atenas', 'París', 'Londres'],
        respuestaCorrecta: 1,
        puntos: 12
      },
      {
        id: 'europa-5',
        pregunta: '¿Qué país europeo no tiene ejército y es uno de los más seguros del mundo?',
        opciones: ['Suiza', 'Islandia', 'Suecia', 'Austria'],
        respuestaCorrecta: 1,
        puntos: 12
      },
      {
        id: 'europa-6',
        pregunta: '¿Cuál es el tren más rápido del mundo y en qué país está?',
        opciones: ['TGV (Francia)', 'Shinkansen (Japón)', 'ICE (Alemania)', 'AVE (España)'],
        respuestaCorrecta: 0,
        puntos: 15
      }
    ]
  },
  {
    id: 'asia',
    nombre: 'Asia',
    svgIcon: 'asia',
    color: '#fbbf24', // Amarillo
    descripcion: 'Asia es el continente más grande y poblado del mundo. Tiene una increíble diversidad de paisajes, desde las montañas más altas (el Himalaya) hasta desiertos y selvas tropicales. Es la cuna de grandes civilizaciones antiguas como China, India y Mesopotamia.',
    datosCuriosos: [
      'El Monte Everest, la montaña más alta del mundo con 8,848 metros, está en la cordillera del Himalaya en Asia.',
      'Más de la mitad de la población mundial vive en Asia: aproximadamente 4,700 millones de personas.',
      'China tiene la muralla más larga del mundo: la Gran Muralla China mide más de 21,000 kilómetros.',
      'Japón tiene más de 6,800 islas, pero solo 430 están habitadas.',
      'El idioma más hablado del mundo es el chino mandarín, con más de 1,100 millones de hablantes.'
    ],
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
      },
      {
        id: 'asia-4',
        pregunta: '¿Cuál es la muralla más larga del mundo y en qué país está?',
        opciones: ['Muralla de Adriano (Inglaterra)', 'Gran Muralla China (China)', 'Muro de Berlín (Alemania)', 'Muralla de Constantinopla (Turquía)'],
        respuestaCorrecta: 1,
        puntos: 12
      },
      {
        id: 'asia-5',
        pregunta: '¿Qué idioma es el más hablado del mundo y proviene de Asia?',
        opciones: ['Inglés', 'Chino mandarín', 'Hindi', 'Árabe'],
        respuestaCorrecta: 1,
        puntos: 12
      },
      {
        id: 'asia-6',
        pregunta: '¿Cuántas islas tiene Japón aproximadamente?',
        opciones: ['100 islas', '1,000 islas', 'Más de 6,800 islas', '10,000 islas'],
        respuestaCorrecta: 2,
        puntos: 15
      }
    ]
  },
  {
    id: 'africa',
    nombre: 'África',
    svgIcon: 'africa',
    color: '#10b981', // Verde
    descripcion: 'África es el tercer continente más grande del mundo y es conocido como la cuna de la humanidad. Tiene una increíble diversidad de vida salvaje, con animales como leones, elefantes y jirafas. El desierto del Sahara, el más grande del mundo, está en África.',
    datosCuriosos: [
      'El río Nilo, que atraviesa África, es el río más largo del mundo con 6,650 kilómetros de longitud.',
      'África tiene más de 3,000 grupos étnicos diferentes y más de 2,000 idiomas distintos.',
      'El Kilimanjaro en Tanzania es la montaña más alta de África con 5,895 metros, ¡y tiene nieve en el ecuador!',
      'Egipto tiene las pirámides más antiguas del mundo: la Gran Pirámide de Guiza se construyó hace más de 4,500 años.',
      'África es el único continente que se extiende por los cuatro hemisferios: norte, sur, este y oeste.'
    ],
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
      },
      {
        id: 'africa-4',
        pregunta: '¿Cuántos grupos étnicos diferentes tiene África aproximadamente?',
        opciones: ['100 grupos', '500 grupos', 'Más de 3,000 grupos', '10,000 grupos'],
        respuestaCorrecta: 2,
        puntos: 12
      },
      {
        id: 'africa-5',
        pregunta: '¿En qué país africano están las pirámides más antiguas del mundo?',
        opciones: ['Sudán', 'Egipto', 'Etiopía', 'Marruecos'],
        respuestaCorrecta: 1,
        puntos: 12
      },
      {
        id: 'africa-6',
        pregunta: '¿Cuál es la montaña más alta de África y en qué país está?',
        opciones: ['Monte Kenia (Kenia)', 'Monte Kilimanjaro (Tanzania)', 'Monte Atlas (Marruecos)', 'Monte Drakensberg (Sudáfrica)'],
        respuestaCorrecta: 1,
        puntos: 15
      }
    ]
  },
  {
    id: 'oceania',
    nombre: 'Oceanía',
    svgIcon: 'oceania',
    color: '#8b5cf6', // Morado
    descripcion: 'Oceanía es el continente más pequeño, formado por miles de islas en el océano Pacífico. Australia es el país más grande de este continente. Tiene animales únicos que no se encuentran en ningún otro lugar, como los canguros y los koalas.',
    datosCuriosos: [
      'Hay más ovejas y canguros que personas en gran parte de Oceanía: Australia tiene 3 veces más ovejas que personas.',
      'La Gran Barrera de Coral, el arrecife de coral más grande del mundo, está en Australia y puede verse desde el espacio.',
      'Nueva Zelanda fue el primer país del mundo en darle el voto a la mujer, en 1893.',
      'Oceanía tiene la capital más pequeña del mundo: Funafuti, en Tuvalu, con menos de 7,000 habitantes.',
      'Papúa Nueva Guinea tiene más de 800 idiomas nativos, lo que la convierte en el país con mayor diversidad lingüística del planeta.'
    ],
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
      },
      {
        id: 'oceania-4',
        pregunta: '¿Qué país fue el primero en darle el voto a la mujer en 1893?',
        opciones: ['Australia', 'Nueva Zelanda', 'Fiyi', 'Samoa'],
        respuestaCorrecta: 1,
        puntos: 12
      },
      {
        id: 'oceania-5',
        pregunta: '¿Cuál es la capital más pequeña del mundo, ubicada en Oceanía?',
        opciones: ['Funafuti (Tuvalu)', 'Yaren (Nauru)', 'Apia (Samoa)', 'Suva (Fiyi)'],
        respuestaCorrecta: 0,
        puntos: 15
      },
      {
        id: 'oceania-6',
        pregunta: '¿Qué país de Oceanía tiene más de 800 idiomas nativos?',
        opciones: ['Australia', 'Papúa Nueva Guinea', 'Nueva Zelanda', 'Islas Salomón'],
        respuestaCorrecta: 1,
        puntos: 15
      }
    ]
  },
  {
    id: 'antartida',
    nombre: 'Antártida',
    svgIcon: 'antartida',
    color: '#6b7280', // Gris
    descripcion: 'La Antártida es el continente más frío, seco y ventoso de la Tierra. Está cubierto casi completamente de hielo y nieve. No tiene población permanente, solo científicos que viven temporalmente en estaciones de investigación. Es el hogar de pingüinos, focas y ballenas.',
    datosCuriosos: [
      'La Antártida contiene el 90% del hielo del mundo y el 70% del agua dulce del planeta.',
      'La temperatura más baja registrada en la Tierra fue en la Antártida: -89.2°C en 1983.',
      'No hay osos polares en la Antártida — los osos polares viven solo en el Ártico, en el Polo Norte.',
      'La Antártida no tiene husos horarios: es el único continente sin una zona horaria definida.',
      'En verano, la Antártida recibe 24 horas de luz solar al día, y en invierno, 24 horas de oscuridad total.'
    ],
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
      },
      {
        id: 'antartida-4',
        pregunta: '¿Cuál fue la temperatura más baja registrada en la Tierra en la Antártida?',
        opciones: ['-50°C', '-89.2°C', '-100°C', '-120°C'],
        respuestaCorrecta: 1,
        puntos: 12
      },
      {
        id: 'antartida-5',
        pregunta: '¿Qué pasa con la luz solar en la Antártida durante el verano?',
        opciones: ['Nieva todo el día', 'Hay 24 horas de luz solar', 'Está siempre oscuro', 'Solo hay 2 horas de luz'],
        respuestaCorrecta: 1,
        puntos: 12
      },
      {
        id: 'antartida-6',
        pregunta: '¿Dónde viven los osos polares: en la Antártida o en el Ártico?',
        opciones: ['En la Antártida', 'En el Ártico (Polo Norte)', 'En ambos', 'En ninguno'],
        respuestaCorrecta: 1,
        puntos: 15
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
