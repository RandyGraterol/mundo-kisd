// Datos de banderas para la trivia de Mundo Kids
// Cada pregunta muestra una descripción de bandera y opciones de países

const preguntasBanderas = [
  {
    id: 'bandera-1',
    descripcion: 'Esta bandera tiene tres franjas horizontales: amarilla (arriba), azul (centro) y roja (abajo). Tiene 8 estrellas blancas en arco en la franja azul.',
    pais: 'Venezuela',
    opciones: ['Colombia', 'Venezuela', 'Ecuador', 'Bolivia'],
    respuestaCorrecta: 1,
    puntos: 15,
    continente: 'america'
  },
  {
    id: 'bandera-2',
    descripcion: 'Esta bandera tiene tres franjas verticales: verde (izquierda), blanca (centro) y roja (derecha). En el centro tiene un escudo con un águila devorando una serpiente.',
    pais: 'México',
    opciones: ['México', 'Italia', 'Irán', 'Hungría'],
    respuestaCorrecta: 0,
    puntos: 15,
    continente: 'america'
  },
  {
    id: 'bandera-3',
    descripcion: 'Esta bandera tiene fondo verde con un rombo amarillo en el centro y un círculo azul con estrellas blancas y la frase "Ordem e Progresso".',
    pais: 'Brasil',
    opciones: ['Argentina', 'Brasil', 'Uruguay', 'Paraguay'],
    respuestaCorrecta: 1,
    puntos: 15,
    continente: 'america'
  },
  {
    id: 'bandera-4',
    descripcion: 'Esta bandera tiene tres franjas horizontales: celeste (arriba), blanca con un sol amarillo en el centro, y celeste (abajo).',
    pais: 'Argentina',
    opciones: ['Uruguay', 'Argentina', 'Nicaragua', 'Honduras'],
    respuestaCorrecta: 1,
    puntos: 15,
    continente: 'america'
  },
  {
    id: 'bandera-5',
    descripcion: 'Esta bandera tiene tres franjas verticales: azul (izquierda), blanca (centro) y roja (derecha). Es muy famosa y representa libertad, igualdad y fraternidad.',
    pais: 'Francia',
    opciones: ['Francia', 'Países Bajos', 'Rusia', 'República Checa'],
    respuestaCorrecta: 0,
    puntos: 15,
    continente: 'europa'
  },
  {
    id: 'bandera-6',
    descripcion: 'Esta bandera tiene un círculo rojo en el centro sobre fondo blanco. Representa el sol naciente.',
    pais: 'Japón',
    opciones: ['China', 'Japón', 'Corea del Sur', 'Bangladesh'],
    respuestaCorrecta: 1,
    puntos: 15,
    continente: 'asia'
  },
  {
    id: 'bandera-7',
    descripcion: 'Esta bandera tiene fondo rojo con cinco estrellas amarillas en la esquina superior izquierda: una grande y cuatro pequeñas alrededor.',
    pais: 'China',
    opciones: ['Vietnam', 'China', 'Corea del Norte', 'Myanmar'],
    respuestaCorrecta: 1,
    puntos: 15,
    continente: 'asia'
  },
  {
    id: 'bandera-8',
    descripcion: 'Esta bandera tiene tres franjas horizontales: negra (arriba), roja (centro) y amarilla/dorada (abajo).',
    pais: 'Alemania',
    opciones: ['Bélgica', 'Alemania', 'Uganda', 'Angola'],
    respuestaCorrecta: 1,
    puntos: 15,
    continente: 'europa'
  },
  {
    id: 'bandera-9',
    descripcion: 'Esta bandera tiene tres franjas horizontales: azafrán/naranja (arriba), blanca con una rueda azul de 24 radios en el centro, y verde (abajo).',
    pais: 'India',
    opciones: ['Irlanda', 'India', 'Costa de Marfil', 'Níger'],
    respuestaCorrecta: 1,
    puntos: 15,
    continente: 'asia'
  },
  {
    id: 'bandera-10',
    descripcion: 'Esta bandera tiene tres franjas verticales: verde (izquierda), amarilla con una estrella verde en el centro, y roja (derecha).',
    pais: 'Senegal',
    opciones: ['Ghana', 'Camerún', 'Senegal', 'Mali'],
    respuestaCorrecta: 2,
    puntos: 15,
    continente: 'africa'
  },
  {
    id: 'bandera-11',
    descripcion: 'Esta bandera tiene tres franjas horizontales: roja (arriba), blanca (centro) y roja (abajo). Es muy simple y antigua.',
    pais: 'Austria',
    opciones: ['Suiza', 'Austria', 'Polonia', 'Dinamarca'],
    respuestaCorrecta: 1,
    puntos: 15,
    continente: 'europa'
  },
  {
    id: 'bandera-12',
    descripcion: 'Esta bandera tiene tres franjas horizontales: roja (arriba), blanca (centro) y negra (abajo). Tiene un águila dorada en el centro.',
    pais: 'Egipto',
    opciones: ['Siria', 'Egipto', 'Yemen', 'Irak'],
    respuestaCorrecta: 1,
    puntos: 15,
    continente: 'africa'
  }
];

/**
 * Obtiene todas las preguntas de banderas
 * @returns {Array} Array con todas las preguntas
 */
function obtenerPreguntasBanderas() {
  return preguntasBanderas;
}

/**
 * Obtiene una pregunta aleatoria de banderas
 * @param {Array} preguntasRespondidas - IDs de preguntas ya respondidas
 * @returns {Object|null} Pregunta aleatoria o null si no hay más
 */
function obtenerPreguntaAleatoria(preguntasRespondidas = []) {
  const preguntasDisponibles = preguntasBanderas.filter(
    p => !preguntasRespondidas.includes(p.id)
  );
  
  if (preguntasDisponibles.length === 0) {
    return null;
  }
  
  const indiceAleatorio = Math.floor(Math.random() * preguntasDisponibles.length);
  return preguntasDisponibles[indiceAleatorio];
}

/**
 * Obtiene una pregunta específica por su ID
 * @param {string} id - ID de la pregunta
 * @returns {Object|undefined} Pregunta o undefined si no existe
 */
function obtenerPreguntaPorId(id) {
  return preguntasBanderas.find(p => p.id === id);
}

module.exports = {
  obtenerPreguntasBanderas,
  obtenerPreguntaAleatoria,
  obtenerPreguntaPorId
};
