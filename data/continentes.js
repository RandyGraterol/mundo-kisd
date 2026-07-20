// Datos mock de continentes para Mundo Kids
// Cada continente incluye información educativa completa

const continentes = [
  {
    id: 'america',
    nombre: 'América',
    svgIcon: 'america',
    color: '#ec4899',
    superficie: '42,549,000 km²',
    poblacion: '~1,020 millones',
    numPaises: 35,
    descripcion: 'América es el segundo continente más grande del mundo, extendiéndose desde el Ártico hasta la Antártida. Está dividido en tres grandes regiones: América del Norte, América Central y América del Sur. Su geografía es extraordinariamente diversa: desde las heladas tundras de Alaska y Canadá hasta las selvas tropicales del Amazonas, pasando por las altas cumbres de los Andes y las vastas llanuras de las Grandes Praderas. Es el hogar de civilizaciones milenarias como los mayas, aztecas e incas, que construyeron impresionantes ciudades y desarrollaron avanzados conocimientos en astronomía, matemáticas y agricultura.',
    clima: 'América posee todos los climas del mundo. En el norte predominan climas fríos y templados, mientras que en Centroamérica y Sudamérica hay climas tropicales y ecuatoriales. La cordillera de los Andes genera microclimas únicos, y la Amazonía presenta un clima ecuatorial húmedo. El Desierto de Atacama en Chile es el más árido del planeta, mientras que la Patagonia experimenta fuertes vientos y temperaturas frías.',
    puntosExtremos: [
      { nombre: 'Punto más alto', valor: 'Monte Aconcagua — 6,961 m (Argentina)' },
      { nombre: 'Punto más bajo', valor: 'Valle de la Muerte — -86 m (EE.UU.)' },
      { nombre: 'Río más largo', valor: 'Río Amazonas — 7,062 km' },
      { nombre: 'Lago más grande', valor: 'Lago Superior — 82,100 km² (EE.UU./Canadá)' }
    ],
    idiomasPrincipales: ['Español', 'Inglés', 'Portugués', 'Francés'],
    datosCuriosos: [
      'El río Amazonas, que atraviesa América del Sur, es el más caudaloso del mundo y su selva produce el 20% del oxígeno de la Tierra.',
      'América tiene el desierto más seco del mundo: el Desierto de Atacama en Chile, donde hay zonas que nunca han registrado lluvias.',
      'El Gran Cañón en Estados Unidos tiene casi 2,000 millones de años de antigüedad y fue formado por el río Colorado.',
      'Canadá tiene más lagos que cualquier otro país del mundo: más de 2 millones de lagos.',
      'Brasil es el país con mayor biodiversidad del planeta, con más de 4,000 especies de aves y mamíferos.',
      'El Salto Ángel en Venezuela es la catarata más alta del mundo con 979 metros de caída.',
      'América tiene el volcán más alto del mundo: el Monte Pissis (6,793 m) en Argentina.'
    ],
    monumentos: ['Estatua de la Libertad (EE.UU.)', 'Machu Picchu (Perú)', 'Cristo Redentor (Brasil)', 'Chichén Itzá (México)', 'Cataratas del Iguazú (Argentina/Brasil)'],
    gastronomia: ['Tacos (México)', 'Hamburguesas (EE.UU.)', 'Feijoada (Brasil)', 'Arepas (Venezuela)', 'Ceviche (Perú)'],
    fauna: ['Águila calva', 'Jaguar', 'Cóndor andino', 'Oso polar', 'Piraña'],
    curiosidadesAdicionales: [
      'El nombre "América" proviene del explorador italiano Américo Vespucio, quien demostró que las tierras descubiertas por Colón eran un continente nuevo.',
      'La Panamericana es la carretera más larga del mundo, recorriendo unos 30,000 km desde Alaska hasta Argentina.',
      'En Brasil se hablan más de 150 lenguas indígenas además del portugués.'
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
    color: '#3b82f6',
    superficie: '10,180,000 km²',
    poblacion: '~750 millones',
    numPaises: 50,
    descripcion: 'Europa es el segundo continente más pequeño del mundo, pero su influencia en la historia global ha sido inmensa. Bañado por los océanos Atlántico y Ártico y por los mares Mediterráneo, Negro y Báltico, Europa cuenta con una geografía variada que incluye montañas como los Alpes y los Pirineos, extensas llanuras y fértiles valles fluviales. Es la cuna de la civilización occidental, con un legado que abarca desde la antigua Grecia y Roma hasta el Renacimiento y la Revolución Industrial. Su riqueza cultural se refleja en más de 200 idiomas, una arquitectura impresionante y una tradición artística inigualable.',
    clima: 'Europa abarca climas que van desde el mediterráneo (veranos secos y cálidos, inviernos suaves) en el sur, hasta el continental (inviernos fríos y veranos cálidos) en el centro y este, y el subártico en Escandinavia. El clima oceánico predomina en el noroeste, con lluvias frecuentes y temperaturas moderadas. Los países nórdicos experimentan noches polares en invierno y soles de medianoche en verano.',
    puntosExtremos: [
      { nombre: 'Punto más alto', valor: 'Monte Elbrús — 5,642 m (Rusia)' },
      { nombre: 'Punto más bajo', valor: 'Mar Caspio — -28 m (Rusia/Kazajistán)' },
      { nombre: 'Río más largo', valor: 'Río Volga — 3,530 km (Rusia)' },
      { nombre: 'Lago más grande', valor: 'Lago Ladoga — 17,700 km² (Rusia)' }
    ],
    idiomasPrincipales: ['Alemán', 'Francés', 'Inglés', 'Italiano', 'Español'],
    datosCuriosos: [
      'Europa tiene más de 200 idiomas diferentes y es el continente con mayor número de países pequeños.',
      'El Vaticano, el país más pequeño del mundo con solo 0.44 km², está en Europa y es gobernado por el Papa.',
      'Los Juegos Olímpicos modernos comenzaron en Atenas, Grecia, en 1896, inspirándose en los antiguos juegos de Olimpia.',
      'El tren más rápido del mundo está en Francia: el TGV alcanzó una velocidad récord de 574.8 km/h.',
      'Islandia, un país europeo, no tiene ejército y es uno de los lugares más seguros del mundo para vivir.',
      'Venecia, Italia, está construida sobre 118 islas y tiene más de 400 puentes.',
      'Los Países Bajos tienen más bicicletas que personas: unos 23 millones para 17 millones de habitantes.'
    ],
    monumentos: ['Torre Eiffel (Francia)', 'Coliseo Romano (Italia)', 'Torre de Londres (Inglaterra)', 'Sagrada Familia (España)', 'Muralla de Ávila (España)'],
    gastronomia: ['Pizza (Italia)', 'Paella (España)', 'Croissant (Francia)', 'Fish & Chips (Inglaterra)', 'Salchicha (Alemania)'],
    fauna: ['Lobo ibérico', 'Oso pardo', 'Lince boreal', 'Zorro ártico', 'Reno'],
    curiosidadesAdicionales: [
      'El nombre "Europa" proviene de la mitología griega: Europa era una princesa fenicia que fue raptada por Zeus convertido en toro.',
      'Suiza tiene cuatro idiomas oficiales: alemán, francés, italiano y romanche.',
      'El Castillo de Neuschwanstein en Alemania fue la inspiración para el castillo de Disney.'
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
    color: '#fbbf24',
    superficie: '44,614,000 km²',
    poblacion: '~4,700 millones',
    numPaises: 49,
    descripcion: 'Asia es el continente más grande y más poblado del planeta. Alberga más de la mitad de la población mundial y cuenta con una diversidad geográfica, cultural y económica asombrosa. Desde las cumbres nevadas del Himalaya —donde se encuentra el Monte Everest, el techo del mundo— hasta los desiertos cálidos de Arabia, las selvas tropicales del sudeste asiático y las estepas heladas de Siberia. Asia es cuna de las civilizaciones más antiguas del mundo: la china, la india y la mesopotámica. Aquí nacieron grandes religiones como el budismo, hinduismo, islam y confucianismo, y se inventaron el papel, la pólvora, la brújula y la imprenta.',
    clima: 'Asia posee la mayor variedad climática del planeta. En Siberia se registran temperaturas de hasta -50°C, mientras que en el desierto de Arabia superan los 50°C. El monzón domina el sur y el este, conlluvias torrenciales en verano. La región del Himalaya tiene glaciares que alimentan los grandes ríos del continente. El sudeste asiático es cálido y húmedo todo el año con selvas tropicales.',
    puntosExtremos: [
      { nombre: 'Punto más alto', valor: 'Monte Everest — 8,849 m (Nepal/China)' },
      { nombre: 'Punto más bajo', valor: 'Mar Muerto — -430 m (Israel/Jordania)' },
      { nombre: 'Río más largo', valor: 'Río Yangtsé — 6,300 km (China)' },
      { nombre: 'Lago más grande', valor: 'Mar Caspio — 371,000 km² (Asia/Europa)' }
    ],
    idiomasPrincipales: ['Chino mandarín', 'Hindi', 'Árabe', 'Ruso', 'Japonés'],
    datosCuriosos: [
      'El Monte Everest, la montaña más alta del mundo con 8,849 metros, está en la cordillera del Himalaya en Asia.',
      'Más de la mitad de la población mundial vive en Asia: aproximadamente 4,700 millones de personas.',
      'China tiene la muralla más larga del mundo: la Gran Muralla China mide más de 21,000 kilómetros.',
      'Japón tiene más de 6,800 islas, pero solo 430 están habitadas.',
      'El idioma más hablado del mundo es el chino mandarín, con más de 1,100 millones de hablantes.',
      'Dubái tiene el edificio más alto del mundo: el Burj Khalifa con 828 metros.',
      'La ciudad más poblada del mundo, Tokio, tiene más de 37 millones de habitantes.'
    ],
    monumentos: ['Gran Muralla China (China)', 'Taj Mahal (India)', 'Angkor Wat (Camboya)', 'Torre de Tokio (Japón)', 'Petra (Jordania)'],
    gastronomia: ['Sushi (Japón)', 'Curry (India)', 'Fideos (China)', 'Pad Thai (Tailandia)', 'Kimchi (Corea)'],
    fauna: ['Panda gigante', 'Tigre de Bengala', 'Dragón de Komodo', 'Elefante asiático', 'Orangután'],
    curiosidadesAdicionales: [
      'El ajedrez se inventó en la India alrededor del siglo VI d.C.',
      'En Arabia Saudita no hay ríos permanentes; toda el agua proviene de acuíferos y plantas desalinizadoras.',
      'Singapur es una ciudad-estado y también un país: es uno de los tres únicos en el mundo con esta característica.'
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
    color: '#10b981',
    superficie: '30,370,000 km²',
    poblacion: '~1,400 millones',
    numPaises: 54,
    descripcion: 'África es el tercer continente más grande del mundo y es conocido como la "cuna de la humanidad", pues en su territorio se han encontrado los fósiles de los primeros homínidos. Su geografía es tan vasta como diversa: el desierto del Sahara —el cálido más grande del planeta— ocupa gran parte del norte, mientras que en el centro y oeste se extienden frondosas selvas tropicales. Al este, la sabana africana alberga la vida salvaje más espectacular del mundo, con animales como leones, elefantes, jirafas, rinocerontes y cebras. África cuenta con más de 3,000 grupos étnicos y 2,000 idiomas, lo que la convierte en el continente con mayor diversidad cultural del planeta.',
    clima: 'África es el continente más cálido de la Tierra. El norte está dominado por el clima desértico del Sahara, mientras que el centro tiene clima ecuatorial con lluvias abundantes. Al este y sur predomina el clima de sabana con estaciones secas y húmedas bien marcadas. El extremo sur tiene clima mediterráneo. Las temperaturas son generalmente altas durante todo el año en la mayor parte del continente.',
    puntosExtremos: [
      { nombre: 'Punto más alto', valor: 'Monte Kilimanjaro — 5,895 m (Tanzania)' },
      { nombre: 'Punto más bajo', valor: 'Lago Assal — -155 m (Yibuti)' },
      { nombre: 'Río más largo', valor: 'Río Nilo — 6,650 km' },
      { nombre: 'Lago más grande', valor: 'Lago Victoria — 68,870 km² (Uganda/Kenia/Tanzania)' }
    ],
    idiomasPrincipales: ['Árabe', 'Suajili', 'Hausa', 'Yoruba', 'Inglés', 'Francés'],
    datosCuriosos: [
      'El río Nilo, que atraviesa África, es el río más largo del mundo con 6,650 kilómetros de longitud.',
      'África tiene más de 3,000 grupos étnicos diferentes y más de 2,000 idiomas distintos.',
      'El Kilimanjaro en Tanzania es la montaña más alta de África con 5,895 metros, ¡y tiene nieve en el ecuador!',
      'Egipto tiene las pirámides más antiguas del mundo: la Gran Pirámide de Guiza se construyó hace más de 4,500 años.',
      'África es el único continente que se extiende por los cuatro hemisferios: norte, sur, este y oeste.',
      'El Lago Victoria es el lago más grande de África y el segundo lago de agua dulce más grande del mundo.',
      'Madagascar tiene especies únicas que no existen en ningún otro lugar, como los lémures y el árbol baobab.'
    ],
    monumentos: ['Pirámides de Guiza (Egipto)', 'Monte Kilimanjaro (Tanzania)', 'Cataratas Victoria (Zambia/Zimbabue)', 'Mesa de la Mesa (Sudáfrica)', 'Parque Nacional Serengueti (Tanzania)'],
    gastronomia: ['Cuscús (Marruecos)', 'Yassa (Senegal)', 'Bobotie (Sudáfrica)', 'Injera (Etiopía)', 'Jollof (Nigeria)'],
    fauna: ['León', 'Elefante africano', 'Jirafa', 'Rinoceronte', 'Guepardo'],
    curiosidadesAdicionales: [
      'África tiene el mayor depósito de oro del mundo: Sudáfrica es el principal productor del continente.',
      'El nombre "África" proviene del latín "Aprica", que significa "soleado", o del griego "aphrike" (sin frío).',
      'En Etiopía se encuentra la depresión de Danakil, uno de los lugares más cálidos e inhóspitos del planeta.'
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
    color: '#8b5cf6',
    superficie: '8,525,989 km²',
    poblacion: '~45 millones',
    numPaises: 14,
    descripcion: 'Oceanía es el continente más pequeño del mundo, pero su extensión marítima es colosal: está formado por miles de islas esparcidas por el océano Pacífico. Australia, el país más grande del continente, es una masa continental propia (a veces llamada isla-continente), mientras que el resto del territorio lo componen archipiélagos como Nueva Zelanda, Papúa Nueva Guinea, Fiyi y las numerosas islas de la Polinesia, Micronesia y Melanesia. Oceanía alberga una biodiversidad única: canguros, koalas, ornitorrincos y equidnas son animales que no existen en ningún otro lugar del mundo. Sus culturas indígenas, como los aborígenes australianos y los maoríes neozelandeses, tienen tradiciones que se remontan a decenas de miles de años.',
    clima: 'Oceanía presenta climas que van desde el tropical húmedo en las islas del Pacífico hasta el árido y semiárido en el interior de Australia. El norte de Australia tiene clima tropical con monzones, mientras que el sur es mediterráneo. Nueva Zelanda tiene clima oceánico templado con lluvias abundantes. Muchas islas del Pacífico tienen temperaturas cálidas durante todo el año.',
    puntosExtremos: [
      { nombre: 'Punto más alto', valor: 'Puncak Jaya — 4,884 m (Indonesia/Papúa)' },
      { nombre: 'Punto más bajo', valor: 'Lago Eyre — -15 m (Australia)' },
      { nombre: 'Río más largo', valor: 'Río Murray-Darling — 3,672 km (Australia)' },
      { nombre: 'Lago más grande', valor: 'Lago Eyre — 9,500 km² (Australia, salado)' }
    ],
    idiomasPrincipales: ['Inglés', 'Francés', 'Maorí', 'Hawaiano'],
    datosCuriosos: [
      'Hay más ovejas y canguros que personas en gran parte de Oceanía: Australia tiene 3 veces más ovejas que personas.',
      'La Gran Barrera de Coral, el arrecife de coral más grande del mundo, está en Australia y puede verse desde el espacio.',
      'Nueva Zelanda fue el primer país del mundo en darle el voto a la mujer, en 1893.',
      'Oceanía tiene la capital más pequeña del mundo: Funafuti, en Tuvalu, con menos de 7,000 habitantes.',
      'Papúa Nueva Guinea tiene más de 800 idiomas nativos, lo que la convierte en el país con mayor diversidad lingüística del planeta.',
      'Australia es el país más seco habitado del mundo: el 70% de su territorio es desierto o semiárido.'
    ],
    monumentos: ['Ópera de Sídney (Australia)', 'Uluru (Australia)', 'Rangitoto (Nueva Zelanda)', 'Bora Bora (Polinesia Francesa)', 'Tongariro (Nueva Zelanda)'],
    gastronomia: ['Vegemite (Australia)', 'Pavlova (Nueva Zelanda)', 'Kokoda (Fiyi)', 'Hāngi (Nueva Zelanda)', 'Lamingtons (Australia)'],
    fauna: ['Canguro', 'Koala', 'Ornitorrinco', 'Kiwi', 'Demonio de Tasmania'],
    curiosidadesAdicionales: [
      'Los aborígenes australianos tienen la cultura viva más antigua del mundo, con más de 50,000 años de historia.',
      'Nueva Zelanda tiene más ovejas que personas en una proporción de 6 a 1.',
      'Fiyi está formado por más de 330 islas, de las cuales solo 110 están habitadas.'
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
    color: '#6b7280',
    superficie: '14,200,000 km²',
    poblacion: '~5,000 (temporal, científicos)',
    numPaises: 0,
    descripcion: 'La Antártida es el continente más frío, seco y ventoso de la Tierra. Está cubierto casi completamente por una capa de hielo que tiene un grosor promedio de 2,000 metros. Es el único continente sin población permanente: solo alberga científicos y personal de apoyo que viven temporalmente en estaciones de investigación de distintos países. A pesar de las condiciones extremas, la vida prospera en sus costas y aguas circundantes: pingüinos, focas, ballenas y aves marinas se han adaptado a este entorno único. La Antártida está protegida por el Tratado Antártico, que prohíbe la explotación minera y reserva el continente para la investigación científica pacífica.',
    clima: 'La Antártida es el lugar más frío de la Tierra. La temperatura más baja registrada es de -89.2°C. Es también el continente más ventoso y seco: recibe menos precipitación que el desierto del Sahara. En la costa las temperaturas invernales rondan los -30°C, mientras que en el interior descienden por debajo de los -60°C. En verano, el sol brilla 24 horas al día; en invierno, reina la oscuridad total.',
    puntosExtremos: [
      { nombre: 'Punto más alto', valor: 'Macizo Vinson — 4,892 m' },
      { nombre: 'Punto más bajo', valor: 'Fosa subglacial Bentley — -2,540 m (bajo el hielo)' },
      { nombre: 'Río más largo', valor: 'Río Onyx — 32 km (solo fluye en verano)' },
      { nombre: 'Lago más grande', valor: 'Lago Vostok — 12,500 km² (subglacial)' }
    ],
    idiomasPrincipales: ['No tiene idioma oficial — se hablan todos los idiomas de los países investigadores'],
    datosCuriosos: [
      'La Antártida contiene el 90% del hielo del mundo y el 70% del agua dulce del planeta.',
      'La temperatura más baja registrada en la Tierra fue en la Antártida: -89.2°C en 1983.',
      'No hay osos polares en la Antártida — los osos polares viven solo en el Ártico, en el Polo Norte.',
      'La Antártida no tiene husos horarios: es el único continente sin una zona horaria definida.',
      'En verano, la Antártida recibe 24 horas de luz solar al día, y en invierno, 24 horas de oscuridad total.',
      'Bajo el hielo antártico hay más de 400 lagos subglaciales, siendo el Lago Vostok el más grande.',
      'El iceberg más grande jamás registrado se desprendió de la Antártida en 2021: medía 4,320 km².'
    ],
    monumentos: ['Base McMurdo (EE.UU.)', 'Base Amundsen-Scott (Polo Sur)', 'Icebergs gigantes', 'Glaciar Lambert', 'Estrecho de Gerlache'],
    gastronomia: ['No hay gastronomía nativa — la comida llega de otros países para los científicos'],
    fauna: ['Pingüino emperador', 'Foca leopardo', 'Ballena azul', 'Albatros', 'Krill antártico'],
    curiosidadesAdicionales: [
      'En la Antártida no hay reptiles ni anfibios: las temperaturas son demasiado extremas para ellos.',
      'El Tratado Antártico de 1959 prohíbe cualquier actividad militar y la explotación de minerales.',
      'El 99% de la Antártida está cubierta por hielo que tiene hasta 4,776 metros de espesor en algunos puntos.'
    ],
    paisesPrincipales: [],
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
