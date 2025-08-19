
// Interpretaciones hardcodeadas para BAT-7
export const INTERPRETACIONES_HARDCODED = {
  // Función para obtener nivel por percentil
  obtenerNivelPorPercentil: (percentil) => {
    if (percentil <= 5) return { id: 1, nombre: 'Muy Bajo', color: 'text-red-600' };
    if (percentil <= 20) return { id: 2, nombre: 'Bajo', color: 'text-red-500' };
    if (percentil <= 40) return { id: 3, nombre: 'Medio-Bajo', color: 'text-orange-500' };
    if (percentil <= 60) return { id: 4, nombre: 'Medio', color: 'text-yellow-600' };
    if (percentil <= 80) return { id: 5, nombre: 'Medio-Alto', color: 'text-blue-500' };
    if (percentil <= 95) return { id: 6, nombre: 'Alto', color: 'text-green-600' };
    return { id: 7, nombre: 'Muy Alto', color: 'text-green-700' };
  },

  // Interpretaciones por aptitud y nivel
  interpretaciones: {
    'V': {
      1: {
        rendimiento: 'Presenta dificultades significativas en la comprensión y manejo de conceptos verbales.',
        academico: 'Puede presentar dificultades en asignaturas como Lengua y Literatura, Historia, Filosofía.',
        vocacional: 'Se beneficiaría de actividades profesionales que no dependan del procesamiento verbal complejo.'
      },
      2: {
        rendimiento: 'Muestra un rendimiento por debajo del promedio en tareas verbales.',
        academico: 'Requiere apoyo adicional en materias con alta carga verbal.',
        vocacional: 'Puede desenvolverse en profesiones que combinen habilidades verbales básicas con otras competencias.'
      },
      3: {
        rendimiento: 'Demuestra una capacidad verbal ligeramente por debajo del promedio.',
        academico: 'Puede manejar contenido verbal básico pero requiere apoyo en textos complejos.',
        vocacional: 'Adecuado para profesiones con demandas verbales moderadas.'
      },
      4: {
        rendimiento: 'Demuestra una capacidad verbal dentro del rango promedio.',
        academico: 'Presenta un rendimiento satisfactorio en materias con componente verbal.',
        vocacional: 'Posee las competencias verbales necesarias para una amplia gama de profesiones.'
      },
      5: {
        rendimiento: 'Muestra una capacidad verbal por encima del promedio.',
        academico: 'Destaca en materias que requieren comprensión verbal y puede abordar textos complejos.',
        vocacional: 'Tiene potencial para profesiones que requieren habilidades verbales avanzadas.'
      },
      6: {
        rendimiento: 'Demuestra una capacidad verbal superior.',
        academico: 'Destaca significativamente en materias verbales y puede manejar contenido académico avanzado.',
        vocacional: 'Posee las competencias para destacar en profesiones altamente verbales.'
      },
      7: {
        rendimiento: 'Presenta una capacidad verbal excepcional.',
        academico: 'Puede destacar significativamente en todas las materias con componente verbal.',
        vocacional: 'Posee el potencial para sobresalir en las profesiones más exigentes verbalmente.'
      }
    },
    'E': {
      4: {
        rendimiento: 'Demuestra una capacidad espacial dentro del rango promedio.',
        academico: 'Presenta un rendimiento satisfactorio en materias con componente espacial.',
        vocacional: 'Posee las competencias espaciales necesarias para diversas profesiones.'
      },
      5: {
        rendimiento: 'Muestra una capacidad espacial por encima del promedio.',
        academico: 'Destaca en materias que requieren visualización espacial.',
        vocacional: 'Tiene potencial para profesiones técnicas y de diseño.'
      },
      6: {
        rendimiento: 'Demuestra una capacidad espacial superior.',
        academico: 'Destaca en matemáticas, física y materias técnicas.',
        vocacional: 'Excelente para ingeniería, arquitectura y diseño.'
      }
    },
    'R': {
      4: {
        rendimiento: 'Demuestra una capacidad de razonamiento dentro del rango promedio.',
        academico: 'Presenta un rendimiento satisfactorio en materias que requieren razonamiento.',
        vocacional: 'Posee las competencias de razonamiento necesarias para una amplia gama de profesiones.'
      },
      5: {
        rendimiento: 'Muestra una capacidad de razonamiento por encima del promedio.',
        academico: 'Destaca en materias que requieren análisis lógico.',
        vocacional: 'Tiene potencial para profesiones analíticas y de resolución de problemas.'
      },
      6: {
        rendimiento: 'Demuestra una capacidad de razonamiento superior.',
        academico: 'Destaca en materias que requieren razonamiento complejo.',
        vocacional: 'Excelente para investigación, análisis y consultoría.'
      }
    },
    'N': {
      4: {
        rendimiento: 'Demuestra una capacidad numérica dentro del rango promedio.',
        academico: 'Presenta un rendimiento satisfactorio en matemáticas.',
        vocacional: 'Posee las competencias numéricas necesarias para diversas profesiones.'
      },
      5: {
        rendimiento: 'Muestra una capacidad numérica por encima del promedio.',
        academico: 'Destaca en matemáticas y materias con componente numérico.',
        vocacional: 'Tiene potencial para profesiones que requieren habilidades matemáticas.'
      },
      6: {
        rendimiento: 'Demuestra una capacidad numérica superior.',
        academico: 'Destaca significativamente en matemáticas y ciencias exactas.',
        vocacional: 'Excelente para ingeniería, finanzas y ciencias.'
      }
    },
    'A': {
      4: {
        rendimiento: 'Demuestra una capacidad atencional dentro del rango promedio.',
        academico: 'Presenta un rendimiento satisfactorio en tareas que requieren concentración.',
        vocacional: 'Posee las competencias atencionales necesarias para diversas profesiones.'
      },
      5: {
        rendimiento: 'Muestra una capacidad atencional por encima del promedio.',
        academico: 'Destaca en tareas que requieren concentración sostenida.',
        vocacional: 'Tiene potencial para profesiones que demandan alta concentración.'
      },
      6: {
        rendimiento: 'Demuestra una capacidad atencional superior.',
        academico: 'Destaca en todas las actividades académicas que requieren concentración.',
        vocacional: 'Excelente para profesiones de precisión y control de calidad.'
      }
    },
    'M': {
      4: {
        rendimiento: 'Demuestra una comprensión mecánica dentro del rango promedio.',
        academico: 'Presenta un rendimiento satisfactorio en materias técnicas.',
        vocacional: 'Posee las competencias mecánicas necesarias para diversas profesiones técnicas.'
      },
      5: {
        rendimiento: 'Muestra una comprensión mecánica por encima del promedio.',
        academico: 'Destaca en materias técnicas y de ciencias aplicadas.',
        vocacional: 'Tiene potencial para profesiones de ingeniería y tecnología.'
      },
      6: {
        rendimiento: 'Demuestra una comprensión mecánica superior.',
        academico: 'Destaca significativamente en todas las materias técnicas.',
        vocacional: 'Excelente para ingeniería mecánica y desarrollo tecnológico.'
      }
    },
    'O': {
      4: {
        rendimiento: 'Demuestra un conocimiento ortográfico dentro del rango promedio.',
        academico: 'Presenta un rendimiento satisfactorio en escritura y comunicación.',
        vocacional: 'Posee las competencias ortográficas necesarias para diversas profesiones.'
      },
      5: {
        rendimiento: 'Muestra un conocimiento ortográfico por encima del promedio.',
        academico: 'Destaca en materias de lengua y comunicación escrita.',
        vocacional: 'Tiene potencial para profesiones que requieren comunicación escrita precisa.'
      },
      6: {
        rendimiento: 'Demuestra un conocimiento ortográfico superior.',
        academico: 'Destaca significativamente en todas las materias de comunicación.',
        vocacional: 'Excelente para periodismo, edición y comunicación profesional.'
      }
    }
  },

  // Función principal para obtener interpretación
  obtenerInterpretacionAptitud: (aptitudCodigo, percentil) => {
    const nivel = INTERPRETACIONES_HARDCODED.obtenerNivelPorPercentil(percentil);
    const interpretacion = INTERPRETACIONES_HARDCODED.interpretaciones[aptitudCodigo]?.[nivel.id];
    
    if (!interpretacion) {
      return {
        nivel_nombre: nivel.nombre,
        rendimiento: 'Interpretación no disponible para este nivel.',
        academico: 'Se requiere evaluación adicional.',
        vocacional: 'Consulte con un profesional para orientación específica.'
      };
    }
    
    return {
      nivel_nombre: nivel.nombre,
      rendimiento: interpretacion.rendimiento,
      academico: interpretacion.academico,
      vocacional: interpretacion.vocacional
    };
  }
};
