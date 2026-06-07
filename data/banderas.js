// Datos de banderas para la trivia de Mundo Kids

const preguntasBanderas = [
  {
    id: 'bandera-1',
    descripcion: 'Bandera de Venezuela',
    pais: 'Venezuela',
    codigo: 've',
    opciones: ['Colombia', 'Venezuela', 'Ecuador', 'Bolivia'],
    respuestaCorrecta: 1,
    puntos: 15,
    continente: 'america'
  },
  {
    id: 'bandera-2',
    descripcion: 'Bandera de México',
    pais: 'México',
    codigo: 'mx',
    opciones: ['México', 'Italia', 'Irán', 'Hungría'],
    respuestaCorrecta: 0,
    puntos: 15,
    continente: 'america'
  },
  {
    id: 'bandera-3',
    descripcion: 'Bandera de Brasil',
    pais: 'Brasil',
    codigo: 'br',
    opciones: ['Argentina', 'Brasil', 'Uruguay', 'Paraguay'],
    respuestaCorrecta: 1,
    puntos: 15,
    continente: 'america'
  },
  {
    id: 'bandera-4',
    descripcion: 'Bandera de Argentina',
    pais: 'Argentina',
    codigo: 'ar',
    opciones: ['Uruguay', 'Argentina', 'Nicaragua', 'Honduras'],
    respuestaCorrecta: 1,
    puntos: 15,
    continente: 'america'
  },
  {
    id: 'bandera-5',
    descripcion: 'Bandera de Francia',
    pais: 'Francia',
    codigo: 'fr',
    opciones: ['Francia', 'Países Bajos', 'Rusia', 'República Checa'],
    respuestaCorrecta: 0,
    puntos: 15,
    continente: 'europa'
  },
  {
    id: 'bandera-6',
    descripcion: 'Bandera de Japón',
    pais: 'Japón',
    codigo: 'jp',
    opciones: ['China', 'Japón', 'Corea del Sur', 'Bangladesh'],
    respuestaCorrecta: 1,
    puntos: 15,
    continente: 'asia'
  },
  {
    id: 'bandera-7',
    descripcion: 'Bandera de China',
    pais: 'China',
    codigo: 'cn',
    opciones: ['Vietnam', 'China', 'Corea del Norte', 'Myanmar'],
    respuestaCorrecta: 1,
    puntos: 15,
    continente: 'asia'
  },
  {
    id: 'bandera-8',
    descripcion: 'Bandera de Alemania',
    pais: 'Alemania',
    codigo: 'de',
    opciones: ['Bélgica', 'Alemania', 'Uganda', 'Angola'],
    respuestaCorrecta: 1,
    puntos: 15,
    continente: 'europa'
  },
  {
    id: 'bandera-9',
    descripcion: 'Bandera de India',
    pais: 'India',
    codigo: 'in',
    opciones: ['Irlanda', 'India', 'Costa de Marfil', 'Níger'],
    respuestaCorrecta: 1,
    puntos: 15,
    continente: 'asia'
  },
  {
    id: 'bandera-10',
    descripcion: 'Bandera de Senegal',
    pais: 'Senegal',
    codigo: 'sn',
    opciones: ['Ghana', 'Camerún', 'Senegal', 'Mali'],
    respuestaCorrecta: 2,
    puntos: 15,
    continente: 'africa'
  },
  {
    id: 'bandera-11',
    descripcion: 'Bandera de Austria',
    pais: 'Austria',
    codigo: 'at',
    opciones: ['Suiza', 'Austria', 'Polonia', 'Dinamarca'],
    respuestaCorrecta: 1,
    puntos: 15,
    continente: 'europa'
  },
  {
    id: 'bandera-12',
    descripcion: 'Bandera de Egipto',
    pais: 'Egipto',
    codigo: 'eg',
    opciones: ['Siria', 'Egipto', 'Yemen', 'Irak'],
    respuestaCorrecta: 1,
    puntos: 15,
    continente: 'africa'
  },
  {
    id: 'bandera-13',
    descripcion: 'Bandera de Reino Unido',
    pais: 'Reino Unido',
    codigo: 'gb',
    opciones: ['Reino Unido', 'Australia', 'Nueva Zelanda', 'Islandia'],
    respuestaCorrecta: 0,
    puntos: 15,
    continente: 'europa'
  },
  {
    id: 'bandera-14',
    descripcion: 'Bandera de Italia',
    pais: 'Italia',
    codigo: 'it',
    opciones: ['Italia', 'Irlanda', 'Francia', 'México'],
    respuestaCorrecta: 0,
    puntos: 15,
    continente: 'europa'
  },
  {
    id: 'bandera-15',
    descripcion: 'Bandera de España',
    pais: 'España',
    codigo: 'es',
    opciones: ['España', 'Andorra', 'Portugal', 'Costa Rica'],
    respuestaCorrecta: 0,
    puntos: 15,
    continente: 'europa'
  },
  {
    id: 'bandera-16',
    descripcion: 'Bandera de Australia',
    pais: 'Australia',
    codigo: 'au',
    opciones: ['Nueva Zelanda', 'Australia', 'Reino Unido', 'Fiyi'],
    respuestaCorrecta: 1,
    puntos: 15,
    continente: 'oceania'
  },
  {
    id: 'bandera-17',
    descripcion: 'Bandera de Canadá',
    pais: 'Canadá',
    codigo: 'ca',
    opciones: ['Canadá', 'Estados Unidos', 'Groenlandia', 'Rusia'],
    respuestaCorrecta: 0,
    puntos: 15,
    continente: 'america'
  },
  {
    id: 'bandera-18',
    descripcion: 'Bandera de Colombia',
    pais: 'Colombia',
    codigo: 'co',
    opciones: ['Ecuador', 'Venezuela', 'Colombia', 'Panamá'],
    respuestaCorrecta: 2,
    puntos: 15,
    continente: 'america'
  },
  {
    id: 'bandera-19',
    descripcion: 'Bandera de Chile',
    pais: 'Chile',
    codigo: 'cl',
    opciones: ['Chile', 'Perú', 'Bolivia', 'Paraguay'],
    respuestaCorrecta: 0,
    puntos: 15,
    continente: 'america'
  },
  {
    id: 'bandera-20',
    descripcion: 'Bandera de Perú',
    pais: 'Perú',
    codigo: 'pe',
    opciones: ['Perú', 'Argentina', 'Chile', 'Bolivia'],
    respuestaCorrecta: 0,
    puntos: 15,
    continente: 'america'
  },
  {
    id: 'bandera-21',
    descripcion: 'Bandera de Sudáfrica',
    pais: 'Sudáfrica',
    codigo: 'za',
    opciones: ['Sudáfrica', 'Kenia', 'Angola', 'Mozambique'],
    respuestaCorrecta: 0,
    puntos: 15,
    continente: 'africa'
  },
  {
    id: 'bandera-22',
    descripcion: 'Bandera de Marruecos',
    pais: 'Marruecos',
    codigo: 'ma',
    opciones: ['Marruecos', 'Túnez', 'Argelia', 'Turquía'],
    respuestaCorrecta: 0,
    puntos: 15,
    continente: 'africa'
  },
  {
    id: 'bandera-23',
    descripcion: 'Bandera de Nigeria',
    pais: 'Nigeria',
    codigo: 'ng',
    opciones: ['Costa de Marfil', 'Nigeria', 'Irlanda', 'Níger'],
    respuestaCorrecta: 1,
    puntos: 15,
    continente: 'africa'
  },
  {
    id: 'bandera-24',
    descripcion: 'Bandera de Rusia',
    pais: 'Rusia',
    codigo: 'ru',
    opciones: ['Rusia', 'Eslovaquia', 'Eslovenia', 'Serbia'],
    respuestaCorrecta: 0,
    puntos: 15,
    continente: 'europa'
  },
  {
    id: 'bandera-25',
    descripcion: 'Bandera de Turquía',
    pais: 'Turquía',
    codigo: 'tr',
    opciones: ['Túnez', 'Turquía', 'Argelia', 'Azerbaiyán'],
    respuestaCorrecta: 1,
    puntos: 15,
    continente: 'asia'
  },
  {
    id: 'bandera-26',
    descripcion: 'Bandera de Corea del Sur',
    pais: 'Corea del Sur',
    codigo: 'kr',
    opciones: ['China', 'Corea del Norte', 'Corea del Sur', 'Taiwán'],
    respuestaCorrecta: 2,
    puntos: 15,
    continente: 'asia'
  },
  {
    id: 'bandera-27',
    descripcion: 'Bandera de Suecia',
    pais: 'Suecia',
    codigo: 'se',
    opciones: ['Suecia', 'Noruega', 'Finlandia', 'Dinamarca'],
    respuestaCorrecta: 0,
    puntos: 15,
    continente: 'europa'
  }
];

function obtenerPreguntasBanderas() {
  return preguntasBanderas;
}

function obtenerPreguntaAleatoria(preguntasRespondidas = []) {
  const preguntasDisponibles = preguntasBanderas.filter(
    p => !preguntasRespondidas.includes(p.id)
  );
  if (preguntasDisponibles.length === 0) return null;
  const indiceAleatorio = Math.floor(Math.random() * preguntasDisponibles.length);
  return preguntasDisponibles[indiceAleatorio];
}

function obtenerPreguntaPorId(id) {
  return preguntasBanderas.find(p => p.id === id);
}

module.exports = {
  obtenerPreguntasBanderas,
  obtenerPreguntaAleatoria,
  obtenerPreguntaPorId
};
