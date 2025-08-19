/**
 * @file interpretacionCualitativaService.js
 * @description Servicio para generar interpretaciones cualitativas personalizadas
 * basadas en las aptitudes completadas por cada paciente según BAT-7
 */

export class InterpretacionCualitativaService {
  
  // Función para determinar el nivel según percentil (nueva escala)
  static getNivelPorPercentil(percentil) {
    if (percentil <= 5) return 'Muy Bajo';
    if (percentil <= 20) return 'Bajo';
    if (percentil <= 40) return 'Medio-Bajo';
    if (percentil <= 60) return 'Medio';
    if (percentil <= 80) return 'Medio-Alto';
    if (percentil <= 95) return 'Alto';
    return 'Muy Alto';
  }

  // Interpretaciones por aptitud y nivel
  static interpretacionesPorAptitud = {
    'V': { // Aptitud Verbal
      nombre: 'Aptitud Verbal',
      descripcion: 'La aptitud verbal evalúa la capacidad para comprender y operar con conceptos expresados verbalmente, incluyendo el manejo del vocabulario, la comprensión de relaciones semánticas y la fluidez en el procesamiento del lenguaje.',
      interpretaciones: {
        'Muy Bajo': {
          rendimiento: 'El rendimiento verbal se sitúa significativamente por debajo del promedio esperado para su grupo de edad, indicando dificultades importantes en el procesamiento y comprensión del lenguaje.',
          academico: 'Puede experimentar dificultades en asignaturas que requieren comprensión lectora, expresión escrita y oral. Necesita apoyo específico en estrategias de vocabulario y comprensión textual.',
          vocacional: 'Se recomienda evitar profesiones que demanden alta competencia verbal. Puede beneficiarse de actividades que fortalezcan gradualmente sus habilidades lingüísticas.'
        },
        'Bajo': {
          rendimiento: 'El rendimiento verbal está por debajo del promedio, sugiriendo algunas limitaciones en el manejo de conceptos verbales y la comprensión de información compleja.',
          academico: 'Puede requerir apoyo adicional en materias como lengua, literatura y ciencias sociales. Se beneficia de explicaciones claras y material de apoyo visual.',
          vocacional: 'Puede tener éxito en profesiones técnicas o prácticas que no requieran alta demanda verbal, con entrenamiento específico en comunicación.'
        },
        'Medio-Bajo': {
          rendimiento: 'El rendimiento verbal se encuentra ligeramente por debajo del promedio, indicando capacidades verbales funcionales pero con margen de mejora.',
          academico: 'Puede manejar el currículo académico con esfuerzo adicional en áreas verbales. Se beneficia de técnicas de estudio que incluyan resúmenes y mapas conceptuales.',
          vocacional: 'Tiene potencial para diversas áreas profesionales con desarrollo de habilidades comunicativas. Se recomienda fortalecer la expresión oral y escrita.'
        },
        'Medio': {
          rendimiento: 'El rendimiento verbal se sitúa en el rango promedio, indicando capacidades verbales adecuadas para la mayoría de tareas cotidianas y académicas.',
          academico: 'Puede manejar satisfactoriamente las demandas académicas verbales. Se beneficia de estrategias de estudio organizadas y práctica regular.',
          vocacional: 'Tiene acceso a una amplia gama de opciones profesionales. Puede desarrollar especialización en áreas de interés con formación adecuada.'
        },
        'Medio-Alto': {
          rendimiento: 'El rendimiento verbal está por encima del promedio, indicando buenas capacidades para el manejo de conceptos verbales y comprensión de información compleja.',
          academico: 'Muestra fortalezas en asignaturas verbales y puede asumir roles de liderazgo en actividades que requieran comunicación efectiva.',
          vocacional: 'Tiene potencial para profesiones que requieran habilidades comunicativas sólidas como educación, periodismo, derecho o relaciones públicas.'
        },
        'Alto': {
          rendimiento: 'El rendimiento verbal es claramente superior al promedio, demostrando excelentes capacidades para el procesamiento verbal y la comprensión de conceptos complejos.',
          academico: 'Destaca en materias verbales y puede servir como tutor para compañeros. Se beneficia de desafíos académicos adicionales en áreas lingüísticas.',
          vocacional: 'Excelente potencial para carreras que demanden alta competencia verbal como literatura, filosofía, derecho, diplomacia o comunicación.'
        },
        'Muy Alto': {
          rendimiento: 'El rendimiento verbal es excepcional, situándose en el percentil superior de su grupo de edad, indicando capacidades verbales sobresalientes.',
          academico: 'Muestra talento excepcional en áreas verbales. Se recomienda programas de enriquecimiento y oportunidades de desarrollo avanzado.',
          vocacional: 'Potencial excepcional para carreras de alta demanda verbal como investigación lingüística, escritura creativa, crítica literaria o comunicación especializada.'
        }
      }
    },
    'E': { // Aptitud Espacial
      nombre: 'Aptitud Espacial',
      descripcion: 'La aptitud espacial evalúa la capacidad para percibir, analizar y manipular mentalmente objetos en el espacio, incluyendo la visualización de formas tridimensionales y la comprensión de relaciones espaciales.',
      interpretaciones: {
        'Muy Bajo': {
          rendimiento: 'El rendimiento espacial se encuentra significativamente por debajo del promedio, indicando dificultades importantes en la visualización y manipulación mental de objetos espaciales.',
          academico: 'Puede experimentar dificultades en geometría, dibujo técnico y materias que requieran visualización espacial. Necesita apoyo con material concreto y manipulativo.',
          vocacional: 'Se recomienda evitar profesiones que demanden alta competencia espacial como arquitectura o ingeniería. Puede beneficiarse de entrenamiento específico en habilidades espaciales.'
        },
        'Bajo': {
          rendimiento: 'El rendimiento espacial está por debajo del promedio, sugiriendo algunas limitaciones en la percepción y manipulación de información espacial.',
          academico: 'Puede requerir apoyo adicional en matemáticas (geometría) y ciencias. Se beneficia de modelos físicos y representaciones concretas.',
          vocacional: 'Puede tener éxito en profesiones que no requieran alta demanda espacial, con entrenamiento específico si es necesario.'
        },
        'Medio-Bajo': {
          rendimiento: 'El rendimiento espacial se encuentra ligeramente por debajo del promedio, indicando capacidades espaciales funcionales pero con margen de mejora.',
          academico: 'Puede manejar el currículo con esfuerzo adicional en áreas espaciales. Se beneficia de práctica sistemática con ejercicios de visualización.',
          vocacional: 'Tiene potencial para diversas áreas con desarrollo de habilidades espaciales. Se recomienda práctica con software de diseño o modelado.'
        },
        'Medio': {
          rendimiento: 'El rendimiento espacial se sitúa en el rango promedio, indicando capacidades espaciales adecuadas para la mayoría de tareas cotidianas y académicas.',
          academico: 'Puede manejar satisfactoriamente las demandas académicas espaciales. Se beneficia de práctica regular con problemas de geometría y visualización.',
          vocacional: 'Tiene acceso a diversas opciones profesionales. Puede desarrollar especialización en áreas técnicas con formación adecuada.'
        },
        'Medio-Alto': {
          rendimiento: 'El rendimiento espacial está por encima del promedio, indicando buenas capacidades para la visualización y manipulación de información espacial.',
          academico: 'Muestra fortalezas en geometría, dibujo técnico y ciencias. Puede asumir proyectos que requieran diseño o construcción.',
          vocacional: 'Tiene potencial para profesiones técnicas como ingeniería, arquitectura, diseño gráfico o artes visuales.'
        },
        'Alto': {
          rendimiento: 'El rendimiento espacial es claramente superior al promedio, demostrando excelentes capacidades para la percepción y manipulación espacial.',
          academico: 'Destaca en materias espaciales y puede servir como apoyo para compañeros. Se beneficia de desafíos adicionales en diseño y construcción.',
          vocacional: 'Excelente potencial para carreras que demanden alta competencia espacial como arquitectura, ingeniería, diseño industrial o artes plásticas.'
        },
        'Muy Alto': {
          rendimiento: 'El rendimiento espacial es excepcional, situándose en el percentil superior, indicando capacidades espaciales sobresalientes.',
          academico: 'Muestra talento excepcional en áreas espaciales. Se recomienda programas de enriquecimiento en diseño, arquitectura o ingeniería.',
          vocacional: 'Potencial excepcional para carreras de alta demanda espacial como arquitectura avanzada, ingeniería aeroespacial o diseño de videojuegos.'
        }
      }
    },
    'A': { // Atención y Concentración
      nombre: 'Atención y Concentración',
      descripcion: 'La atención y concentración evalúa la capacidad para mantener el foco atencional, resistir distracciones y procesar información de manera sostenida y selectiva.',
      interpretaciones: {
        'Muy Bajo': {
          rendimiento: 'El nivel atencional se encuentra significativamente por debajo del promedio, indicando dificultades importantes para mantener la concentración y resistir distracciones.',
          academico: 'Puede experimentar dificultades significativas en el rendimiento académico debido a problemas atencionales. Necesita estrategias específicas de manejo atencional.',
          vocacional: 'Se recomienda evitar trabajos que requieran atención sostenida prolongada. Puede beneficiarse de técnicas de mindfulness y organización.'
        },
        'Bajo': {
          rendimiento: 'El nivel atencional está por debajo del promedio, sugiriendo algunas dificultades para mantener la concentración en tareas prolongadas.',
          academico: 'Puede requerir descansos frecuentes y estrategias de organización. Se beneficia de ambientes de estudio estructurados y libres de distracciones.',
          vocacional: 'Puede tener éxito en trabajos con variedad de tareas y pausas regulares. Se recomienda desarrollo de técnicas de concentración.'
        },
        'Medio-Bajo': {
          rendimiento: 'El nivel atencional se encuentra ligeramente por debajo del promedio, indicando capacidades atencionales funcionales pero con margen de mejora.',
          academico: 'Puede manejar las demandas académicas con estrategias de organización y técnicas de estudio estructuradas.',
          vocacional: 'Tiene potencial para diversas áreas profesionales con desarrollo de habilidades de concentración y manejo del tiempo.'
        },
        'Medio': {
          rendimiento: 'El nivel atencional se sitúa en el rango promedio, indicando capacidades atencionales adecuadas para la mayoría de tareas cotidianas y académicas.',
          academico: 'Puede manejar satisfactoriamente las demandas académicas atencionales. Se beneficia de técnicas de estudio organizadas.',
          vocacional: 'Tiene acceso a una amplia gama de opciones profesionales que requieran niveles normales de concentración.'
        },
        'Medio-Alto': {
          rendimiento: 'El nivel atencional está por encima del promedio, indicando buenas capacidades para mantener la concentración y resistir distracciones.',
          academico: 'Muestra fortalezas atencionales que facilitan el aprendizaje. Puede manejar tareas complejas que requieran concentración sostenida.',
          vocacional: 'Tiene potencial para profesiones que requieran alta concentración como investigación, programación o análisis de datos.'
        },
        'Alto': {
          rendimiento: 'El nivel atencional es claramente superior al promedio, demostrando excelentes capacidades para la concentración sostenida y selectiva.',
          academico: 'Destaca en su capacidad de concentración y puede servir como modelo para compañeros. Se beneficia de desafíos académicos complejos.',
          vocacional: 'Excelente potencial para carreras que demanden alta concentración como medicina, investigación científica o control de calidad.'
        },
        'Muy Alto': {
          rendimiento: 'El nivel atencional es excepcional, situándose en el percentil superior, indicando capacidades atencionales sobresalientes.',
          academico: 'Muestra capacidades atencionales excepcionales. Se recomienda aprovechar esta fortaleza en proyectos de investigación o estudio independiente.',
          vocacional: 'Potencial excepcional para carreras de alta demanda atencional como cirugía, investigación avanzada o actividades que requieran precisión extrema.'
        }
      }
    },
    'R': { // Razonamiento
      nombre: 'Razonamiento',
      descripcion: 'La aptitud de razonamiento evalúa la capacidad para identificar patrones, establecer relaciones lógicas y resolver problemas mediante el pensamiento analítico y deductivo.',
      interpretaciones: {
        'Muy Bajo': {
          rendimiento: 'El razonamiento lógico se encuentra significativamente por debajo del promedio, indicando dificultades importantes para establecer relaciones causales y resolver problemas complejos.',
          academico: 'Puede experimentar dificultades en matemáticas, ciencias y materias que requieran pensamiento lógico. Necesita apoyo con estrategias de resolución de problemas paso a paso.',
          vocacional: 'Se recomienda evitar profesiones que demanden alto razonamiento lógico. Puede beneficiarse de entrenamiento en pensamiento estructurado.'
        },
        'Bajo': {
          rendimiento: 'El razonamiento lógico está por debajo del promedio, sugiriendo algunas limitaciones en la resolución de problemas y el pensamiento analítico.',
          academico: 'Puede requerir apoyo adicional en materias analíticas. Se beneficia de ejemplos concretos y práctica guiada en resolución de problemas.',
          vocacional: 'Puede tener éxito en trabajos que no requieran razonamiento complejo, con entrenamiento específico en técnicas de análisis.'
        },
        'Medio-Bajo': {
          rendimiento: 'El razonamiento lógico se encuentra ligeramente por debajo del promedio, indicando capacidades analíticas funcionales pero con margen de mejora.',
          academico: 'Puede manejar el currículo con esfuerzo adicional en áreas analíticas. Se beneficia de práctica sistemática con problemas de lógica.',
          vocacional: 'Tiene potencial para diversas áreas con desarrollo de habilidades analíticas. Se recomienda práctica con ejercicios de razonamiento.'
        },
        'Medio': {
          rendimiento: 'El razonamiento lógico se sitúa en el rango promedio, indicando capacidades analíticas adecuadas para la mayoría de tareas cotidianas y académicas.',
          academico: 'Puede manejar satisfactoriamente las demandas académicas analíticas. Se beneficia de práctica regular con problemas de razonamiento.',
          vocacional: 'Tiene acceso a diversas opciones profesionales que requieran niveles normales de análisis y resolución de problemas.'
        },
        'Medio-Alto': {
          rendimiento: 'El razonamiento lógico está por encima del promedio, indicando buenas capacidades para el análisis y la resolución de problemas complejos.',
          academico: 'Muestra fortalezas en materias analíticas y puede asumir roles de liderazgo en proyectos que requieran pensamiento crítico.',
          vocacional: 'Tiene potencial para profesiones analíticas como ingeniería, investigación, consultoría o análisis de sistemas.'
        },
        'Alto': {
          rendimiento: 'El razonamiento lógico es claramente superior al promedio, demostrando excelentes capacidades para el pensamiento analítico y la resolución de problemas.',
          academico: 'Destaca en materias que requieren razonamiento y puede servir como tutor en áreas analíticas. Se beneficia de desafíos intelectuales complejos.',
          vocacional: 'Excelente potencial para carreras que demanden alto razonamiento como investigación científica, ingeniería avanzada o consultoría estratégica.'
        },
        'Muy Alto': {
          rendimiento: 'El razonamiento lógico es excepcional, situándose en el percentil superior, indicando capacidades analíticas sobresalientes.',
          academico: 'Muestra talento excepcional en razonamiento. Se recomienda programas de enriquecimiento en matemáticas, ciencias o filosofía.',
          vocacional: 'Potencial excepcional para carreras de alta demanda analítica como investigación avanzada, desarrollo de algoritmos o análisis estratégico.'
        }
      }
    },
    'N': { // Aptitud Numérica
      nombre: 'Aptitud Numérica',
      descripcion: 'La aptitud numérica evalúa la capacidad para trabajar con números, realizar operaciones matemáticas y comprender conceptos cuantitativos de manera eficiente y precisa.',
      interpretaciones: {
        'Muy Bajo': {
          rendimiento: 'La competencia numérica se encuentra significativamente por debajo del promedio, indicando dificultades importantes en el manejo de números y operaciones matemáticas.',
          academico: 'Puede experimentar dificultades significativas en matemáticas y ciencias exactas. Necesita apoyo intensivo con material manipulativo y estrategias concretas.',
          vocacional: 'Se recomienda evitar profesiones que requieran alta competencia numérica. Puede beneficiarse de calculadoras y herramientas de apoyo.'
        },
        'Bajo': {
          rendimiento: 'La competencia numérica está por debajo del promedio, sugiriendo algunas limitaciones en el procesamiento de información cuantitativa.',
          academico: 'Puede requerir apoyo adicional en matemáticas. Se beneficia de explicaciones paso a paso y práctica adicional con operaciones básicas.',
          vocacional: 'Puede tener éxito en trabajos que no requieran cálculos complejos, con apoyo de herramientas tecnológicas.'
        },
        'Medio-Bajo': {
          rendimiento: 'La competencia numérica se encuentra ligeramente por debajo del promedio, indicando habilidades matemáticas funcionales pero con margen de mejora.',
          academico: 'Puede manejar el currículo matemático con esfuerzo adicional. Se beneficia de práctica sistemática y refuerzo en conceptos básicos.',
          vocacional: 'Tiene potencial para diversas áreas con desarrollo de habilidades numéricas básicas. Se recomienda uso de herramientas de cálculo.'
        },
        'Medio': {
          rendimiento: 'La competencia numérica se sitúa en el rango promedio, indicando habilidades matemáticas adecuadas para la mayoría de tareas cotidianas y académicas.',
          academico: 'Puede manejar satisfactoriamente las demandas académicas matemáticas. Se beneficia de práctica regular y aplicación de conceptos.',
          vocacional: 'Tiene acceso a diversas opciones profesionales que requieran competencias numéricas básicas a intermedias.'
        },
        'Medio-Alto': {
          rendimiento: 'La competencia numérica está por encima del promedio, indicando buenas habilidades para el trabajo con números y conceptos matemáticos.',
          academico: 'Muestra fortalezas en matemáticas y puede asumir roles de apoyo en actividades que requieran cálculos precisos.',
          vocacional: 'Tiene potencial para profesiones que requieran competencia numérica como contabilidad, economía, estadística o ingeniería.'
        },
        'Alto': {
          rendimiento: 'La competencia numérica es claramente superior al promedio, demostrando excelentes habilidades matemáticas y de cálculo.',
          academico: 'Destaca en matemáticas y ciencias exactas. Puede servir como tutor y se beneficia de desafíos matemáticos avanzados.',
          vocacional: 'Excelente potencial para carreras que demanden alta competencia numérica como matemáticas aplicadas, actuaría, ingeniería financiera.'
        },
        'Muy Alto': {
          rendimiento: 'La competencia numérica es excepcional, situándose en el percentil superior, indicando habilidades matemáticas sobresalientes.',
          academico: 'Muestra talento excepcional en matemáticas. Se recomienda programas de enriquecimiento y competencias matemáticas.',
          vocacional: 'Potencial excepcional para carreras de alta demanda numérica como investigación matemática, criptografía o modelado financiero.'
        }
      }
    },
    'M': { // Aptitud Mecánica
      nombre: 'Aptitud Mecánica',
      descripcion: 'La aptitud mecánica evalúa la comprensión de principios físicos básicos, el funcionamiento de mecanismos y la capacidad para resolver problemas prácticos relacionados con objetos y herramientas.',
      interpretaciones: {
        'Muy Bajo': {
          rendimiento: 'La comprensión mecánica se encuentra significativamente por debajo del promedio, indicando dificultades importantes para entender principios físicos y mecánicos básicos.',
          academico: 'Puede experimentar dificultades en física y tecnología. Necesita apoyo con demostraciones prácticas y material manipulativo.',
          vocacional: 'Se recomienda evitar profesiones técnicas o mecánicas. Puede beneficiarse de entrenamiento básico en uso de herramientas.'
        },
        'Bajo': {
          rendimiento: 'La comprensión mecánica está por debajo del promedio, sugiriendo algunas limitaciones en la comprensión de principios físicos y mecánicos.',
          academico: 'Puede requerir apoyo adicional en materias técnicas. Se beneficia de demostraciones prácticas y explicaciones concretas.',
          vocacional: 'Puede tener éxito en trabajos que no requieran conocimientos técnicos complejos, con entrenamiento específico si es necesario.'
        },
        'Medio-Bajo': {
          rendimiento: 'La comprensión mecánica se encuentra ligeramente por debajo del promedio, indicando conocimientos técnicos funcionales pero con margen de mejora.',
          academico: 'Puede manejar materias técnicas básicas con esfuerzo adicional. Se beneficia de práctica hands-on y proyectos aplicados.',
          vocacional: 'Tiene potencial para áreas técnicas básicas con desarrollo de habilidades prácticas. Se recomienda formación técnica específica.'
        },
        'Medio': {
          rendimiento: 'La comprensión mecánica se sitúa en el rango promedio, indicando conocimientos técnicos adecuados para tareas cotidianas y académicas básicas.',
          academico: 'Puede manejar satisfactoriamente materias técnicas básicas. Se beneficia de aplicación práctica de conceptos teóricos.',
          vocacional: 'Tiene acceso a diversas opciones técnicas que requieran comprensión mecánica básica a intermedia.'
        },
        'Medio-Alto': {
          rendimiento: 'La comprensión mecánica está por encima del promedio, indicando buena capacidad para entender y aplicar principios técnicos y mecánicos.',
          academico: 'Muestra fortalezas en materias técnicas y puede liderar proyectos prácticos que requieran comprensión mecánica.',
          vocacional: 'Tiene potencial para profesiones técnicas como mecánica, mantenimiento industrial, tecnología o ingeniería aplicada.'
        },
        'Alto': {
          rendimiento: 'La comprensión mecánica es claramente superior al promedio, demostrando excelente capacidad para entender sistemas mecánicos complejos.',
          academico: 'Destaca en materias técnicas y puede servir como mentor en proyectos de ingeniería o tecnología.',
          vocacional: 'Excelente potencial para carreras técnicas avanzadas como ingeniería mecánica, diseño industrial o desarrollo tecnológico.'
        },
        'Muy Alto': {
          rendimiento: 'La comprensión mecánica es excepcional, situándose en el percentil superior, indicando capacidades técnicas sobresalientes.',
          academico: 'Muestra talento excepcional en áreas técnicas. Se recomienda programas de enriquecimiento en ingeniería o tecnología avanzada.',
          vocacional: 'Potencial excepcional para carreras de alta demanda técnica como ingeniería de precisión, robótica o innovación tecnológica.'
        }
      }
    },
    'O': { // Ortografía
      nombre: 'Ortografía',
      descripcion: 'La competencia ortográfica evalúa el dominio de las reglas de escritura, la precisión en el uso de signos de puntuación y la capacidad para detectar y corregir errores ortográficos.',
      interpretaciones: {
        'Muy Bajo': {
          rendimiento: 'La competencia ortográfica se encuentra significativamente por debajo del promedio, indicando dificultades importantes en el dominio de reglas de escritura.',
          academico: 'Puede experimentar dificultades en todas las materias que requieran expresión escrita. Necesita apoyo intensivo en reglas ortográficas básicas.',
          vocacional: 'Se recomienda evitar profesiones que requieran escritura formal. Puede beneficiarse de correctores automáticos y revisión externa.'
        },
        'Bajo': {
          rendimiento: 'La competencia ortográfica está por debajo del promedio, sugiriendo algunas limitaciones en el dominio de reglas de escritura.',
          academico: 'Puede requerir apoyo adicional en expresión escrita. Se beneficia de práctica sistemática con reglas ortográficas.',
          vocacional: 'Puede tener éxito en trabajos que no requieran escritura formal extensa, con apoyo de herramientas de corrección.'
        },
        'Medio-Bajo': {
          rendimiento: 'La competencia ortográfica se encuentra ligeramente por debajo del promedio, indicando dominio funcional pero con margen de mejora.',
          academico: 'Puede manejar la escritura académica con esfuerzo adicional en revisión y corrección. Se beneficia de práctica regular.',
          vocacional: 'Tiene potencial para diversas áreas con desarrollo de habilidades de escritura. Se recomienda uso de herramientas de apoyo.'
        },
        'Medio': {
          rendimiento: 'La competencia ortográfica se sitúa en el rango promedio, indicando dominio adecuado de reglas de escritura para tareas cotidianas.',
          academico: 'Puede manejar satisfactoriamente las demandas de escritura académica. Se beneficia de revisión sistemática de textos.',
          vocacional: 'Tiene acceso a diversas opciones profesionales que requieran competencia ortográfica básica a intermedia.'
        },
        'Medio-Alto': {
          rendimiento: 'La competencia ortográfica está por encima del promedio, indicando buen dominio de reglas de escritura y precisión ortográfica.',
          academico: 'Muestra fortalezas en expresión escrita y puede apoyar a compañeros en tareas de redacción y corrección.',
          vocacional: 'Tiene potencial para profesiones que requieran escritura de calidad como periodismo, edición, comunicación o educación.'
        },
        'Alto': {
          rendimiento: 'La competencia ortográfica es claramente superior al promedio, demostrando excelente dominio de reglas de escritura y precisión.',
          academico: 'Destaca en expresión escrita y puede servir como corrector o editor de textos académicos.',
          vocacional: 'Excelente potencial para carreras que demanden alta competencia ortográfica como corrección de estilo, edición profesional o escritura técnica.'
        },
        'Muy Alto': {
          rendimiento: 'La competencia ortográfica es excepcional, situándose en el percentil superior, indicando dominio sobresaliente de la escritura.',
          academico: 'Muestra talento excepcional en escritura. Se recomienda oportunidades de desarrollo en escritura creativa o técnica avanzada.',
          vocacional: 'Potencial excepcional para carreras de alta demanda ortográfica como corrección profesional, lexicografía o escritura especializada.'
        }
      }
    }
  };

  /**
   * Genera interpretación cualitativa personalizada para un paciente
   * @param {Array} resultados - Array de resultados del paciente
   * @param {Object} paciente - Datos del paciente
   * @returns {Object} Interpretación cualitativa completa
   */
  static generarInterpretacionPersonalizada(resultados, paciente) {
    const interpretacion = {
      resumenGeneral: this.generarResumenGeneral(resultados, paciente),
      aptitudesEspecificas: this.generarInterpretacionAptitudes(resultados),
      recomendaciones: this.generarRecomendaciones(resultados, paciente),
      perfilVocacional: this.generarPerfilVocacional(resultados)
    };

    return interpretacion;
  }

  /**
   * Genera resumen general del perfil
   */
  static generarResumenGeneral(resultados, paciente) {
    const percentiles = resultados.map(r => r.percentil).filter(p => p !== null);
    const promedioPC = percentiles.length > 0 ? Math.round(percentiles.reduce((sum, pc) => sum + pc, 0) / percentiles.length) : 0;
    const nivelGeneral = this.getNivelPorPercentil(promedioPC);
    
    return {
      percentilPromedio: promedioPC,
      nivelGeneral: nivelGeneral,
      totalAptitudes: resultados.length,
      descripcion: this.getDescripcionNivelGeneral(nivelGeneral, promedioPC, paciente)
    };
  }

  /**
   * Genera interpretación específica por aptitud
   */
  static generarInterpretacionAptitudes(resultados) {
    return resultados.map(resultado => {
      const codigoAptitud = resultado.aptitud?.codigo;
      const percentil = resultado.percentil;
      const nivel = this.getNivelPorPercentil(percentil);
      const aptitudInfo = this.interpretacionesPorAptitud[codigoAptitud];

      if (!aptitudInfo) {
        return {
          codigo: codigoAptitud,
          nombre: resultado.aptitud?.nombre || 'Aptitud Desconocida',
          percentil: percentil,
          nivel: nivel,
          interpretacion: 'Interpretación no disponible para esta aptitud.'
        };
      }

      return {
        codigo: codigoAptitud,
        nombre: aptitudInfo.nombre,
        descripcion: aptitudInfo.descripcion,
        percentil: percentil,
        nivel: nivel,
        interpretacion: aptitudInfo.interpretaciones[nivel] || {
          rendimiento: 'Interpretación no disponible para este nivel.',
          academico: 'Información académica no disponible.',
          vocacional: 'Información vocacional no disponible.'
        }
      };
    });
  }

  /**
   * Genera descripción del nivel general
   */
  static getDescripcionNivelGeneral(nivel, percentil, paciente) {
    const edad = paciente?.fecha_nacimiento ? 
      Math.floor((new Date() - new Date(paciente.fecha_nacimiento)) / (365.25 * 24 * 60 * 60 * 1000)) : 
      'no especificada';

    const descripciones = {
      'Muy Alto': `${paciente?.nombre || 'El/La evaluado/a'} presenta un perfil cognitivo excepcional (PC: ${percentil}), situándose en el percentil superior de su grupo de edad. Este rendimiento indica capacidades intelectuales sobresalientes que requieren estimulación y desafíos académicos apropiados.`,
      'Alto': `${paciente?.nombre || 'El/La evaluado/a'} muestra un perfil cognitivo claramente superior al promedio (PC: ${percentil}), indicando fortalezas intelectuales significativas que pueden ser aprovechadas en su desarrollo académico y profesional.`,
      'Medio-Alto': `${paciente?.nombre || 'El/La evaluado/a'} presenta un perfil cognitivo por encima del promedio (PC: ${percentil}), sugiriendo buenas capacidades intelectuales con potencial para el éxito académico y profesional.`,
      'Medio': `${paciente?.nombre || 'El/La evaluado/a'} muestra un perfil cognitivo dentro del rango promedio (PC: ${percentil}), indicando capacidades intelectuales adecuadas para las demandas académicas y profesionales típicas.`,
      'Medio-Bajo': `${paciente?.nombre || 'El/La evaluado/a'} presenta un perfil cognitivo ligeramente por debajo del promedio (PC: ${percentil}), sugiriendo la necesidad de apoyo adicional en algunas áreas para optimizar su rendimiento.`,
      'Bajo': `${paciente?.nombre || 'El/La evaluado/a'} muestra un perfil cognitivo por debajo del promedio (PC: ${percentil}), indicando la necesidad de estrategias de apoyo específicas y adaptaciones en el proceso de aprendizaje.`,
      'Muy Bajo': `${paciente?.nombre || 'El/La evaluado/a'} presenta un perfil cognitivo significativamente por debajo del promedio (PC: ${percentil}), requiriendo intervención especializada y apoyo intensivo para optimizar su desarrollo académico.`
    };

    return descripciones[nivel] || 'Perfil cognitivo en evaluación.';
  }

  /**
   * Genera recomendaciones personalizadas
   */
  static generarRecomendaciones(resultados, paciente) {
    const fortalezas = resultados.filter(r => r.percentil >= 80);
    const debilidades = resultados.filter(r => r.percentil <= 20);
    
    return {
      fortalezas: fortalezas.map(r => ({
        aptitud: r.aptitud?.nombre,
        recomendacion: `Potenciar la ${r.aptitud?.nombre} mediante actividades desafiantes y oportunidades de liderazgo.`
      })),
      areasDeDesarrollo: debilidades.map(r => ({
        aptitud: r.aptitud?.nombre,
        recomendacion: `Implementar estrategias de apoyo específicas para fortalecer la ${r.aptitud?.nombre}.`
      })),
      estrategiasGenerales: this.generarEstrategiasGenerales(resultados)
    };
  }

  /**
   * Genera perfil vocacional
   */
  static generarPerfilVocacional(resultados) {
    // Lógica para determinar áreas vocacionales recomendadas
    const perfilVocacional = {
      areasRecomendadas: [],
      areasAEvitar: [],
      consideracionesEspeciales: []
    };

    // Análisis basado en fortalezas
    resultados.forEach(resultado => {
      if (resultado.percentil >= 80) {
        const codigo = resultado.aptitud?.codigo;
        switch(codigo) {
          case 'V':
            perfilVocacional.areasRecomendadas.push('Comunicación, Literatura, Derecho, Educación');
            break;
          case 'E':
            perfilVocacional.areasRecomendadas.push('Arquitectura, Ingeniería, Diseño, Artes Visuales');
            break;
          case 'N':
            perfilVocacional.areasRecomendadas.push('Matemáticas, Economía, Contabilidad, Ciencias Exactas');
            break;
          case 'R':
            perfilVocacional.areasRecomendadas.push('Investigación, Análisis, Resolución de Problemas');
            break;
          case 'M':
            perfilVocacional.areasRecomendadas.push('Ingeniería Mecánica, Tecnología, Mantenimiento');
            break;
          case 'A':
            perfilVocacional.areasRecomendadas.push('Medicina, Investigación, Control de Calidad');
            break;
          case 'O':
            perfilVocacional.areasRecomendadas.push('Edición, Corrección, Comunicación Escrita');
            break;
        }
      }
    });

    return perfilVocacional;
  }

  /**
   * Genera estrategias generales
   */
  static generarEstrategiasGenerales(resultados) {
    return [
      'Implementar técnicas de estudio personalizadas según el perfil de fortalezas y debilidades.',
      'Establecer metas académicas realistas y alcanzables.',
      'Buscar oportunidades de desarrollo en las áreas de fortaleza identificadas.',
      'Considerar apoyo adicional en las áreas que requieren desarrollo.',
      'Mantener una actitud positiva hacia el aprendizaje y el crecimiento personal.'
    ];
  }
}
