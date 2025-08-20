/**
 * @file interpretacionesCualitativas.js
 * @description Interpretaciones cualitativas profesionales para el test BAT-7
 * Basado en el documento "interpretacion cualitativa.txt"
 * Nivel elemental (E): Escolares de 6.º a 7.º de ESO (12 a 14 años)
 */

// Niveles de rendimiento según percentiles
export const NIVELES_RENDIMIENTO = {
  1: { nombre: 'Muy Bajo', rango: '≤ 5', color: 'text-red-600' },
  2: { nombre: 'Bajo', rango: '6-20', color: 'text-red-500' },
  3: { nombre: 'Medio-Bajo', rango: '21-40', color: 'text-orange-500' },
  4: { nombre: 'Medio', rango: '41-60', color: 'text-yellow-600' },
  5: { nombre: 'Medio-Alto', rango: '61-80', color: 'text-blue-500' },
  6: { nombre: 'Alto', rango: '81-95', color: 'text-green-600' },
  7: { nombre: 'Muy Alto', rango: '> 95', color: 'text-green-700' }
};

// Función para obtener nivel según percentil
export const obtenerNivel = (percentil) => {
  if (percentil <= 5) return 1;
  if (percentil <= 20) return 2;
  if (percentil <= 40) return 3;
  if (percentil <= 60) return 4;
  if (percentil <= 80) return 5;
  if (percentil <= 95) return 6;
  return 7;
};

// SECCIÓN 1: INTERPRETACIONES DE APTITUDES ESPECÍFICAS

export const INTERPRETACIONES_APTITUDES = {
  V: { // Aptitud Verbal
    nombre: 'Aptitud Verbal',
    descripcion: 'La aptitud verbal evalúa la capacidad para comprender y operar con conceptos expresados verbalmente, incluyendo el manejo del vocabulario, la comprensión de relaciones semánticas y la fluidez en el procesamiento del lenguaje.',
    interpretaciones: {
      1: { // Muy Bajo
        rendimiento: 'Presenta dificultades significativas en la comprensión y manejo de conceptos verbales. Su vocabulario puede ser limitado y experimenta desafíos en tareas que requieren procesamiento lingüístico complejo.',
        academico: 'Puede presentar dificultades en asignaturas como Lengua y Literatura, Historia, Filosofía y otras materias que requieren comprensión lectora avanzada. Necesita apoyo específico en estrategias de comprensión textual y ampliación del vocabulario.',
        vocacional: 'Se beneficiaría de actividades profesionales que no dependan principalmente del procesamiento verbal complejo. Puede destacar en áreas técnicas, artísticas o manuales donde las habilidades verbales no sean el componente principal.'
      },
      2: { // Bajo
        rendimiento: 'Muestra un rendimiento por debajo del promedio en tareas verbales. Puede comprender conceptos básicos pero tiene dificultades con material verbal más complejo o abstracto.',
        academico: 'Requiere apoyo adicional en materias con alta carga verbal. Se beneficia de explicaciones visuales, esquemas y técnicas de estudio que complementen la información verbal con otros canales sensoriales.',
        vocacional: 'Puede desenvolverse adecuadamente en profesiones que combinen habilidades verbales básicas con otras competencias. Las áreas técnicas, deportivas o artísticas pueden ser opciones viables.'
      },
      3: { // Medio-Bajo
        rendimiento: 'Presenta un rendimiento ligeramente por debajo del promedio. Comprende la mayoría de conceptos verbales cotidianos pero puede tener dificultades con vocabulario técnico o textos complejos.',
        academico: 'Con esfuerzo adicional y estrategias adecuadas puede alcanzar un rendimiento satisfactorio en materias verbales. Se beneficia de técnicas de estudio estructuradas y apoyo en la comprensión de textos especializados.',
        vocacional: 'Tiene potencial para desarrollarse en diversas áreas profesionales, especialmente aquellas que no requieren un manejo verbal altamente especializado. Con formación adecuada puede compensar esta limitación.'
      },
      4: { // Medio
        rendimiento: 'Demuestra una capacidad verbal dentro del rango promedio. Comprende adecuadamente conceptos verbales y puede manejar textos de complejidad moderada sin dificultades significativas.',
        academico: 'Presenta un rendimiento satisfactorio en materias con componente verbal. Puede beneficiarse de técnicas de estudio convencionales y tiene capacidad para abordar textos académicos de nivel medio.',
        vocacional: 'Posee las competencias verbales necesarias para una amplia gama de profesiones. Puede desarrollarse tanto en áreas técnicas como humanísticas, dependiendo de sus otros intereses y habilidades.'
      },
      5: { // Medio-Alto
        rendimiento: 'Muestra una capacidad verbal por encima del promedio. Comprende conceptos complejos con facilidad y demuestra un buen manejo del vocabulario y las estructuras lingüísticas.',
        academico: 'Presenta fortalezas en materias con alto componente verbal como Literatura, Historia, Filosofía y Ciencias Sociales. Puede abordar textos complejos y expresar ideas con claridad.',
        vocacional: 'Tiene potencial para destacar en profesiones que requieren habilidades comunicativas desarrolladas: educación, periodismo, derecho, psicología, relaciones públicas y áreas humanísticas en general.'
      },
      6: { // Alto
        rendimiento: 'Demuestra una capacidad verbal superior. Maneja conceptos abstractos con facilidad, posee un vocabulario amplio y muestra fluidez en el procesamiento de información verbal compleja.',
        academico: 'Destaca en materias verbales y puede abordar textos académicos avanzados. Tiene capacidad para el análisis crítico, la síntesis de información y la expresión de ideas complejas.',
        vocacional: 'Posee las competencias para destacar en profesiones altamente especializadas en el ámbito verbal: investigación, escritura profesional, traducción, crítica literaria, docencia universitaria y áreas que requieren comunicación sofisticada.'
      },
      7: { // Muy Alto
        rendimiento: 'Presenta una capacidad verbal excepcional. Demuestra un dominio superior del lenguaje, comprende conceptos altamente abstractos y muestra una fluidez verbal notable.',
        academico: 'Puede destacar significativamente en todas las materias con componente verbal. Tiene potencial para el trabajo académico avanzado, la investigación y la producción intelectual de alto nivel.',
        vocacional: 'Posee el potencial para sobresalir en las profesiones más exigentes verbalmente: investigación académica, literatura, periodismo especializado, diplomacia, oratoria profesional y liderazgo intelectual.'
      }
    }
  },

  E: { // Aptitud Espacial
    nombre: 'Aptitud Espacial',
    descripcion: 'La aptitud espacial evalúa la capacidad para percibir, analizar y manipular mentalmente objetos en el espacio, incluyendo la visualización de formas tridimensionales y la comprensión de relaciones espaciales.',
    interpretaciones: {
      1: { // Muy Bajo
        rendimiento: 'Presenta dificultades significativas en la percepción y manipulación mental de objetos espaciales. Puede tener problemas para visualizar formas tridimensionales y comprender relaciones espaciales complejas.',
        academico: 'Puede experimentar dificultades en Matemáticas (especialmente geometría), Física, Dibujo Técnico y Educación Plástica. Necesita apoyo con material concreto y manipulativo para compensar estas limitaciones.',
        vocacional: 'Se beneficiaría de profesiones que no requieran habilidades espaciales complejas. Puede destacar en áreas verbales, sociales o administrativas donde las demandas espaciales sean mínimas.'
      },
      2: { // Bajo
        rendimiento: 'Muestra un rendimiento por debajo del promedio en tareas espaciales. Puede manejar conceptos espaciales básicos pero tiene dificultades con visualizaciones complejas o rotaciones mentales.',
        academico: 'Requiere apoyo adicional en materias con componente espacial. Se beneficia del uso de material manipulativo, modelos físicos y técnicas de visualización asistida.',
        vocacional: 'Puede desenvolverse en profesiones que requieran habilidades espaciales básicas, especialmente si se combinan con otras fortalezas. Las áreas administrativas, sociales o verbales pueden ser más adecuadas.'
      },
      3: { // Medio-Bajo
        rendimiento: 'Presenta un rendimiento ligeramente por debajo del promedio. Puede manejar tareas espaciales simples pero experimenta dificultades con problemas que requieren visualización espacial avanzada.',
        academico: 'Con esfuerzo adicional puede alcanzar un rendimiento satisfactorio en materias espaciales. Se beneficia de estrategias de enseñanza que incluyan múltiples representaciones y apoyo visual.',
        vocacional: 'Tiene potencial para desarrollarse en diversas áreas, especialmente aquellas que no dependan exclusivamente de habilidades espaciales complejas. Con formación adecuada puede compensar esta limitación.'
      },
      4: { // Medio
        rendimiento: 'Demuestra una capacidad espacial dentro del rango promedio. Puede visualizar y manipular objetos espaciales de complejidad moderada sin dificultades significativas.',
        academico: 'Presenta un rendimiento satisfactorio en materias con componente espacial. Puede abordar problemas geométricos y de visualización de nivel medio con estrategias convencionales.',
        vocacional: 'Posee las competencias espaciales necesarias para una amplia gama de profesiones. Puede desarrollarse tanto en áreas técnicas como creativas, dependiendo de sus otros intereses y habilidades.'
      },
      5: { // Medio-Alto
        rendimiento: 'Muestra una capacidad espacial por encima del promedio. Visualiza y manipula objetos espaciales con facilidad y comprende relaciones espaciales complejas.',
        academico: 'Presenta fortalezas en Matemáticas, Física, Dibujo Técnico y materias que requieren visualización espacial. Puede abordar problemas geométricos avanzados con confianza.',
        vocacional: 'Tiene potencial para destacar en profesiones que requieren habilidades espaciales desarrolladas: arquitectura, ingeniería, diseño, artes plásticas, medicina (especialmente cirugía) y áreas técnicas especializadas.'
      },
      6: { // Alto
        rendimiento: 'Demuestra una capacidad espacial superior. Maneja visualizaciones complejas con facilidad y muestra una comprensión avanzada de las relaciones espaciales tridimensionales.',
        academico: 'Destaca en materias espaciales y puede abordar problemas de alta complejidad. Tiene capacidad para el pensamiento espacial abstracto y la resolución de problemas geométricos avanzados.',
        vocacional: 'Posee las competencias para destacar en profesiones altamente especializadas: arquitectura avanzada, ingeniería de diseño, investigación espacial, arte escultórico, diseño industrial y áreas que requieren visualización sofisticada.'
      },
      7: { // Muy Alto
        rendimiento: 'Presenta una capacidad espacial excepcional. Demuestra un dominio superior de la visualización espacial y puede manejar las tareas más complejas de manipulación mental de objetos.',
        academico: 'Puede destacar significativamente en todas las materias con componente espacial. Tiene potencial para el trabajo académico avanzado en matemáticas aplicadas, física teórica y disciplinas espaciales especializadas.',
        vocacional: 'Posee el potencial para sobresalir en las profesiones más exigentes espacialmente: investigación en matemáticas aplicadas, diseño aeroespacial, arquitectura innovadora, arte conceptual y liderazgo en campos técnicos avanzados.'
      }
    }
  }
};

// SECCIÓN 2: INTERPRETACIONES DE ÍNDICES DE INTELIGENCIA

export const INTERPRETACIONES_INDICES = {
  g: { // Capacidad General
    nombre: 'Capacidad General (g)',
    descripcion: 'La Capacidad General (g) es la estimación más robusta del potencial intelectual global, representando la capacidad fundamental para procesar información, resolver problemas complejos y adaptarse a nuevas situaciones de aprendizaje.',
    interpretaciones: {
      1: { // Muy Bajo
        integrada: 'Presenta un funcionamiento intelectual general significativamente por debajo del promedio. Puede experimentar dificultades en múltiples áreas cognitivas y requerir apoyo especializado para el aprendizaje.',
        implicaciones: 'Necesita estrategias de enseñanza altamente estructuradas y apoyo individualizado. El desarrollo de habilidades básicas requerirá tiempo adicional y métodos pedagógicos especializados. Es importante identificar y potenciar áreas de fortaleza específicas.'
      },
      2: { // Bajo
        integrada: 'Muestra un funcionamiento intelectual general por debajo del promedio. Puede manejar tareas cognitivas básicas pero experimenta dificultades con problemas complejos o abstractos.',
        implicaciones: 'Se beneficia de enfoques pedagógicos estructurados, apoyo adicional y estrategias de enseñanza que descompongan las tareas complejas en pasos más simples. El ritmo de aprendizaje puede ser más lento pero constante.'
      },
      3: { // Medio-Bajo
        integrada: 'Presenta un funcionamiento intelectual ligeramente por debajo del promedio. Puede abordar la mayoría de tareas cognitivas con esfuerzo adicional y apoyo adecuado.',
        implicaciones: 'Con estrategias de estudio apropiadas y apoyo pedagógico puede alcanzar objetivos académicos satisfactorios. Es importante desarrollar técnicas de compensación y aprovechar estilos de aprendizaje preferentes.'
      },
      4: { // Medio
        integrada: 'Demuestra un funcionamiento intelectual dentro del rango promedio. Posee las capacidades cognitivas básicas para abordar tareas académicas y problemas cotidianos de complejidad moderada.',
        implicaciones: 'Presenta las competencias intelectuales necesarias para el éxito académico y profesional en una amplia gama de áreas. Puede beneficiarse de estrategias de estudio convencionales y tiene potencial para el desarrollo continuo.'
      },
      5: { // Medio-Alto
        integrada: 'Muestra un funcionamiento intelectual por encima del promedio. Demuestra buenas capacidades para el procesamiento de información compleja y la resolución de problemas abstractos.',
        implicaciones: 'Posee un potencial intelectual sólido para el éxito académico y profesional. Puede abordar desafíos cognitivos complejos y tiene capacidad para el aprendizaje autónomo y el pensamiento crítico avanzado.'
      },
      6: { // Alto
        integrada: 'Demuestra un funcionamiento intelectual superior. Posee capacidades cognitivas avanzadas para el procesamiento de información compleja, el razonamiento abstracto y la resolución de problemas sofisticados.',
        implicaciones: 'Presenta un alto potencial para el éxito académico y profesional en áreas especializadas. Puede beneficiarse de programas de enriquecimiento académico y tiene capacidad para el liderazgo intelectual y la innovación.'
      },
      7: { // Muy Alto
        integrada: 'Presenta un funcionamiento intelectual excepcional. Demuestra capacidades cognitivas superiores en múltiples dominios y un potencial notable para el procesamiento de información altamente compleja.',
        implicaciones: 'Posee un potencial intelectual excepcional que puede requerir programas educativos especializados. Tiene capacidad para contribuciones significativas en campos académicos o profesionales avanzados y puede beneficiarse de mentorización especializada.'
      }
    }
  },

  Gf: { // Inteligencia Fluida
    nombre: 'Inteligencia Fluida (Gf)',
    descripcion: 'La Inteligencia Fluida (Gf) representa la capacidad para resolver problemas nuevos, pensar de manera lógica y identificar patrones, independientemente del conocimiento previo. Se basa en el Razonamiento, Aptitud Numérica y Aptitud Espacial.',
    interpretaciones: {
      1: { // Muy Bajo
        integrada: 'Presenta dificultades significativas en el procesamiento de información nueva y la resolución de problemas lógicos. Puede tener limitaciones en tareas que requieren razonamiento abstracto o identificación de patrones complejos.',
        implicaciones: 'Necesita apoyo especializado para desarrollar estrategias de resolución de problemas. Se beneficia de enfoques pedagógicos que utilicen conocimientos previos como base para el aprendizaje de conceptos nuevos.'
      },
      2: { // Bajo
        integrada: 'Muestra un rendimiento por debajo del promedio en tareas de razonamiento lógico y procesamiento de información nueva. Puede manejar problemas simples pero experimenta dificultades con situaciones complejas o abstractas.',
        implicaciones: 'Requiere tiempo adicional y estrategias estructuradas para abordar problemas nuevos. Se beneficia de la práctica sistemática y el desarrollo gradual de habilidades de razonamiento.'
      },
      3: { // Medio-Bajo
        integrada: 'Presenta un funcionamiento ligeramente por debajo del promedio en inteligencia fluida. Puede resolver problemas de complejidad moderada con esfuerzo adicional y apoyo adecuado.',
        implicaciones: 'Con estrategias apropiadas puede desarrollar competencias de razonamiento satisfactorias. Es importante proporcionar múltiples oportunidades de práctica y retroalimentación constructiva.'
      },
      4: { // Medio
        integrada: 'Demuestra una capacidad de razonamiento fluido dentro del rango promedio. Puede abordar problemas nuevos de complejidad moderada y identificar patrones básicos con eficacia.',
        implicaciones: 'Posee las competencias de razonamiento necesarias para el éxito académico y profesional. Puede beneficiarse del desarrollo continuo de habilidades de pensamiento crítico y resolución de problemas.'
      },
      5: { // Medio-Alto
        integrada: 'Muestra una capacidad de razonamiento fluido por encima del promedio. Demuestra buenas habilidades para resolver problemas nuevos y identificar patrones complejos.',
        implicaciones: 'Presenta un potencial sólido para el éxito en áreas que requieren pensamiento lógico y analítico. Puede destacar en matemáticas, ciencias y disciplinas que demanden razonamiento abstracto.'
      },
      6: { // Alto
        integrada: 'Demuestra una capacidad de razonamiento fluido superior. Posee habilidades avanzadas para el procesamiento de información nueva, la resolución de problemas complejos y el pensamiento abstracto.',
        implicaciones: 'Presenta un alto potencial para el éxito en campos que requieren innovación y pensamiento analítico avanzado. Puede beneficiarse de desafíos intelectuales complejos y programas de enriquecimiento.'
      },
      7: { // Muy Alto
        integrada: 'Presenta una capacidad de razonamiento fluido excepcional. Demuestra habilidades superiores para resolver problemas altamente complejos y procesar información abstracta de manera sofisticada.',
        implicaciones: 'Posee un potencial excepcional para contribuciones significativas en campos que requieren innovación y pensamiento analítico avanzado. Puede beneficiarse de programas educativos especializados y mentorización en áreas de alta demanda cognitiva.'
      }
    }
  },

  Gc: { // Inteligencia Cristalizada
    nombre: 'Inteligencia Cristalizada (Gc)',
    descripcion: 'La Inteligencia Cristalizada (Gc) representa el conocimiento adquirido y las habilidades desarrolladas a través de la experiencia y la educación. Se basa en la Aptitud Verbal y la Ortografía, reflejando el aprendizaje cultural acumulado.',
    interpretaciones: {
      1: { // Muy Bajo
        integrada: 'Presenta limitaciones significativas en el conocimiento adquirido y las habilidades académicas básicas. Puede tener un vocabulario restringido y dificultades en competencias educativas fundamentales.',
        implicaciones: 'Necesita apoyo intensivo para desarrollar conocimientos básicos y habilidades académicas fundamentales. Es crucial proporcionar experiencias de aprendizaje enriquecedoras y apoyo educativo especializado.'
      },
      2: { // Bajo
        integrada: 'Muestra un nivel de conocimientos adquiridos por debajo del promedio. Puede tener limitaciones en vocabulario, comprensión cultural y habilidades académicas básicas.',
        implicaciones: 'Se beneficia de programas de refuerzo académico y experiencias educativas enriquecedoras. Es importante desarrollar estrategias para la adquisición sistemática de conocimientos y habilidades culturales.'
      },
      3: { // Medio-Bajo
        integrada: 'Presenta un nivel de inteligencia cristalizada ligeramente por debajo del promedio. Posee conocimientos básicos pero puede tener limitaciones en áreas específicas del saber académico.',
        implicaciones: 'Con apoyo educativo apropiado puede desarrollar un nivel satisfactorio de conocimientos académicos. Es importante identificar áreas de fortaleza y proporcionar apoyo específico en áreas de debilidad.'
      },
      4: { // Medio
        integrada: 'Demuestra un nivel de conocimientos adquiridos dentro del rango promedio. Posee las competencias académicas básicas y un vocabulario adecuado para su nivel educativo.',
        implicaciones: 'Presenta las bases de conocimiento necesarias para el éxito académico continuado. Puede beneficiarse del desarrollo sistemático de conocimientos especializados en áreas de interés.'
      },
      5: { // Medio-Alto
        integrada: 'Muestra un nivel de inteligencia cristalizada por encima del promedio. Demuestra buenos conocimientos académicos, vocabulario amplio y competencias culturales desarrolladas.',
        implicaciones: 'Presenta una base sólida de conocimientos para el éxito académico avanzado. Puede destacar en áreas humanísticas y beneficiarse de programas de profundización en materias de interés.'
      },
      6: { // Alto
        integrada: 'Demuestra un nivel superior de inteligencia cristalizada. Posee conocimientos académicos avanzados, vocabulario extenso y una comprensión cultural sofisticada.',
        implicaciones: 'Presenta un potencial elevado para el éxito en áreas que requieren conocimientos especializados y competencias académicas avanzadas. Puede beneficiarse de programas de excelencia académica.'
      },
      7: { // Muy Alto
        integrada: 'Presenta un nivel excepcional de inteligencia cristalizada. Demuestra conocimientos académicos superiores, dominio lingüístico avanzado y una comprensión cultural muy desarrollada.',
        implicaciones: 'Posee un potencial excepcional para contribuciones significativas en campos académicos y culturales. Puede beneficiarse de programas educativos especializados y oportunidades de desarrollo intelectual avanzado.'
      }
    }
  },

  R: { // Razonamiento
    nombre: 'Razonamiento',
    descripcion: 'La aptitud de razonamiento evalúa la capacidad para identificar patrones, establecer relaciones lógicas y resolver problemas que requieren pensamiento abstracto y deductivo.',
    interpretaciones: {
      1: { // Muy Bajo
        rendimiento: 'Presenta dificultades significativas en tareas de razonamiento lógico y abstracto. Puede tener problemas para identificar patrones, establecer relaciones causales y resolver problemas que requieren pensamiento deductivo.',
        academico: 'Puede experimentar dificultades en Matemáticas, Física, Filosofía y materias que requieren análisis lógico. Necesita apoyo con estrategias de resolución de problemas paso a paso y material concreto.',
        vocacional: 'Se beneficiaría de profesiones que no dependan principalmente del razonamiento abstracto complejo. Puede destacar en áreas que requieran habilidades prácticas, manuales o rutinarias.'
      },
      2: { // Bajo
        rendimiento: 'Muestra un rendimiento por debajo del promedio en tareas de razonamiento. Puede manejar problemas simples pero tiene dificultades con situaciones que requieren análisis lógico complejo.',
        academico: 'Requiere apoyo adicional en materias analíticas. Se beneficia de estrategias de enseñanza estructuradas, ejemplos concretos y práctica guiada en resolución de problemas.',
        vocacional: 'Puede desenvolverse en profesiones que requieran razonamiento básico, especialmente si se combinan con otras fortalezas. Las áreas técnicas estructuradas pueden ser adecuadas.'
      },
      3: { // Medio-Bajo
        rendimiento: 'Presenta un rendimiento ligeramente por debajo del promedio. Puede abordar problemas de razonamiento simples pero experimenta dificultades con análisis más complejos.',
        academico: 'Con esfuerzo adicional puede alcanzar un rendimiento satisfactorio en materias analíticas. Se beneficia de técnicas de estudio que descompongan los problemas en pasos más simples.',
        vocacional: 'Tiene potencial para desarrollarse en diversas áreas, especialmente aquellas que no dependan exclusivamente del razonamiento abstracto avanzado. Con formación puede compensar esta limitación.'
      },
      4: { // Medio
        rendimiento: 'Demuestra una capacidad de razonamiento dentro del rango promedio. Puede resolver problemas lógicos de complejidad moderada y identificar patrones básicos.',
        academico: 'Presenta un rendimiento satisfactorio en materias que requieren razonamiento. Puede abordar problemas matemáticos y científicos de nivel medio con estrategias convencionales.',
        vocacional: 'Posee las competencias de razonamiento necesarias para una amplia gama de profesiones. Puede desarrollarse tanto en áreas técnicas como administrativas.'
      },
      5: { // Medio-Alto
        rendimiento: 'Muestra una capacidad de razonamiento por encima del promedio. Identifica patrones complejos con facilidad y demuestra buenas habilidades de análisis lógico.',
        academico: 'Presenta fortalezas en Matemáticas, Ciencias y materias que requieren pensamiento analítico. Puede abordar problemas complejos y desarrollar estrategias de solución efectivas.',
        vocacional: 'Tiene potencial para destacar en profesiones que requieren análisis y resolución de problemas: ingeniería, ciencias, investigación, programación y áreas técnicas especializadas.'
      },
      6: { // Alto
        rendimiento: 'Demuestra una capacidad de razonamiento superior. Maneja problemas lógicos complejos con facilidad y muestra un pensamiento analítico avanzado.',
        academico: 'Destaca en materias analíticas y puede abordar problemas de alta complejidad. Tiene capacidad para el pensamiento abstracto avanzado y la resolución de problemas innovadores.',
        vocacional: 'Posee las competencias para destacar en profesiones altamente analíticas: investigación científica, ingeniería avanzada, matemáticas aplicadas, análisis de sistemas y campos que requieren innovación técnica.'
      },
      7: { // Muy Alto
        rendimiento: 'Presenta una capacidad de razonamiento excepcional. Demuestra un dominio superior del pensamiento lógico y puede resolver los problemas más complejos con facilidad.',
        academico: 'Puede destacar significativamente en todas las materias analíticas. Tiene potencial para el trabajo académico avanzado, la investigación y la innovación en campos técnicos.',
        vocacional: 'Posee el potencial para sobresalir en las profesiones más exigentes analíticamente: investigación de vanguardia, desarrollo tecnológico, matemáticas teóricas y liderazgo en innovación científica.'
      }
    }
  },

  N: { // Aptitud Numérica
    nombre: 'Aptitud Numérica',
    descripcion: 'La aptitud numérica evalúa la capacidad para trabajar con números, realizar cálculos mentales, comprender relaciones cuantitativas y resolver problemas matemáticos.',
    interpretaciones: {
      1: { // Muy Bajo
        rendimiento: 'Presenta dificultades significativas en el manejo de números y operaciones matemáticas básicas. Puede tener problemas con cálculos mentales y comprensión de conceptos cuantitativos.',
        academico: 'Puede experimentar dificultades importantes en Matemáticas, Física, Química y materias con componente cuantitativo. Necesita apoyo especializado y estrategias de enseñanza adaptadas.',
        vocacional: 'Se beneficiaría de profesiones que no requieran habilidades matemáticas complejas. Puede destacar en áreas verbales, artísticas o sociales donde las demandas numéricas sean mínimas.'
      },
      2: { // Bajo
        rendimiento: 'Muestra un rendimiento por debajo del promedio en tareas numéricas. Puede manejar operaciones básicas pero tiene dificultades con problemas matemáticos más complejos.',
        academico: 'Requiere apoyo adicional en materias matemáticas. Se beneficia de explicaciones paso a paso, material manipulativo y práctica adicional en conceptos fundamentales.',
        vocacional: 'Puede desenvolverse en profesiones que requieran habilidades numéricas básicas, especialmente si se combinan con otras competencias. Las áreas administrativas simples pueden ser adecuadas.'
      },
      3: { // Medio-Bajo
        rendimiento: 'Presenta un rendimiento ligeramente por debajo del promedio. Puede manejar operaciones numéricas simples pero experimenta dificultades con matemáticas más avanzadas.',
        academico: 'Con esfuerzo adicional puede alcanzar un rendimiento satisfactorio en matemáticas básicas. Se beneficia de técnicas de estudio estructuradas y apoyo en conceptos fundamentales.',
        vocacional: 'Tiene potencial para desarrollarse en diversas áreas, especialmente aquellas que no dependan exclusivamente de habilidades matemáticas avanzadas. Con formación puede compensar esta limitación.'
      },
      4: { // Medio
        rendimiento: 'Demuestra una capacidad numérica dentro del rango promedio. Puede realizar cálculos de complejidad moderada y comprender conceptos matemáticos básicos.',
        academico: 'Presenta un rendimiento satisfactorio en matemáticas de nivel medio. Puede abordar problemas cuantitativos estándar con estrategias convencionales de estudio.',
        vocacional: 'Posee las competencias numéricas necesarias para una amplia gama de profesiones. Puede desarrollarse tanto en áreas técnicas como administrativas que requieran matemáticas básicas.'
      },
      5: { // Medio-Alto
        rendimiento: 'Muestra una capacidad numérica por encima del promedio. Realiza cálculos complejos con facilidad y demuestra una buena comprensión de conceptos matemáticos.',
        academico: 'Presenta fortalezas en Matemáticas, Física, Química y materias cuantitativas. Puede abordar problemas matemáticos avanzados y desarrollar estrategias de cálculo eficientes.',
        vocacional: 'Tiene potencial para destacar en profesiones que requieren habilidades matemáticas desarrolladas: contabilidad, ingeniería, estadística, economía y áreas técnicas especializadas.'
      },
      6: { // Alto
        rendimiento: 'Demuestra una capacidad numérica superior. Maneja operaciones matemáticas complejas con facilidad y muestra una comprensión avanzada de conceptos cuantitativos.',
        academico: 'Destaca en materias matemáticas y puede abordar problemas de alta complejidad. Tiene capacidad para el análisis cuantitativo avanzado y la modelización matemática.',
        vocacional: 'Posee las competencias para destacar en profesiones altamente cuantitativas: ingeniería matemática, investigación estadística, análisis financiero avanzado y campos que requieren modelización numérica.'
      },
      7: { // Muy Alto
        rendimiento: 'Presenta una capacidad numérica excepcional. Demuestra un dominio superior de las matemáticas y puede resolver los problemas cuantitativos más complejos.',
        academico: 'Puede destacar significativamente en todas las materias matemáticas. Tiene potencial para el trabajo académico avanzado en matemáticas, física teórica y disciplinas cuantitativas especializadas.',
        vocacional: 'Posee el potencial para sobresalir en las profesiones más exigentes matemáticamente: investigación matemática, física teórica, ingeniería de vanguardia y liderazgo en campos cuantitativos avanzados.'
      }
    }
  },

  A: { // Atención y Concentración
    nombre: 'Atención y Concentración',
    descripcion: 'La aptitud de atención y concentración evalúa la capacidad para mantener el foco atencional, resistir distracciones y procesar información de manera sostenida y selectiva.',
    interpretaciones: {
      1: { // Muy Bajo
        rendimiento: 'Presenta dificultades significativas para mantener la atención y concentrarse en tareas. Puede distraerse fácilmente y tener problemas para procesar información de manera sostenida.',
        academico: 'Puede experimentar dificultades en todas las materias debido a problemas atencionales. Necesita estrategias específicas de manejo atencional, descansos frecuentes y ambiente estructurado.',
        vocacional: 'Se beneficiaría de profesiones que permitan variedad en las tareas y no requieran períodos prolongados de concentración intensa. Puede destacar en actividades dinámicas y variadas.'
      },
      2: { // Bajo
        rendimiento: 'Muestra un rendimiento por debajo del promedio en tareas que requieren atención sostenida. Puede mantener la concentración por períodos cortos pero se fatiga rápidamente.',
        academico: 'Requiere apoyo en estrategias de atención y organización del estudio. Se beneficia de técnicas de fragmentación de tareas, recordatorios visuales y ambiente de estudio controlado.',
        vocacional: 'Puede desenvolverse en profesiones que ofrezcan variedad y cambios de actividad. Las áreas que requieran períodos cortos de concentración intensa pueden ser más adecuadas.'
      },
      3: { // Medio-Bajo
        rendimiento: 'Presenta un rendimiento ligeramente por debajo del promedio en atención sostenida. Puede concentrarse en tareas de interés pero tiene dificultades con material menos motivador.',
        academico: 'Con estrategias apropiadas puede mejorar su rendimiento atencional. Se beneficia de técnicas de autorregulación, establecimiento de metas a corto plazo y refuerzo positivo.',
        vocacional: 'Tiene potencial para desarrollarse en diversas áreas, especialmente aquellas que coincidan con sus intereses personales. La motivación intrínseca puede compensar las limitaciones atencionales.'
      },
      4: { // Medio
        rendimiento: 'Demuestra una capacidad atencional dentro del rango promedio. Puede mantener la concentración en tareas de duración moderada sin dificultades significativas.',
        academico: 'Presenta un rendimiento satisfactorio en tareas que requieren atención. Puede beneficiarse de técnicas de estudio convencionales y manejo básico del tiempo.',
        vocacional: 'Posee las competencias atencionales necesarias para una amplia gama de profesiones. Puede adaptarse tanto a trabajos que requieran concentración como a actividades más dinámicas.'
      },
      5: { // Medio-Alto
        rendimiento: 'Muestra una capacidad atencional por encima del promedio. Mantiene la concentración con facilidad y demuestra buena resistencia a las distracciones.',
        academico: 'Presenta fortalezas en tareas que requieren atención sostenida. Puede abordar estudios prolongados y mantener el foco en material complejo o detallado.',
        vocacional: 'Tiene potencial para destacar en profesiones que requieren concentración intensa: investigación, análisis detallado, programación, contabilidad y áreas que demanden precisión.'
      },
      6: { // Alto
        rendimiento: 'Demuestra una capacidad atencional superior. Mantiene la concentración por períodos prolongados y muestra excelente control atencional selectivo.',
        academico: 'Destaca en tareas que requieren atención detallada y puede abordar estudios intensivos. Tiene capacidad para el trabajo académico que demande concentración prolongada.',
        vocacional: 'Posee las competencias para destacar en profesiones que requieren atención excepcional: cirugía, investigación de precisión, control de calidad, auditoría y campos que demanden concentración extrema.'
      },
      7: { // Muy Alto
        rendimiento: 'Presenta una capacidad atencional excepcional. Demuestra un control atencional superior y puede mantener la concentración en las condiciones más desafiantes.',
        academico: 'Puede destacar significativamente en todas las áreas académicas que requieran atención intensa. Tiene potencial para el trabajo académico más exigente y la investigación de precisión.',
        vocacional: 'Posee el potencial para sobresalir en las profesiones más exigentes atencional mente: neurocirugía, investigación de alta precisión, control de sistemas críticos y liderazgo en campos que requieren concentración excepcional.'
      }
    }
  },

  M: { // Aptitud Mecánica
    nombre: 'Aptitud Mecánica',
    descripcion: 'La aptitud mecánica evalúa la capacidad para comprender principios físicos básicos, visualizar el funcionamiento de mecanismos y resolver problemas relacionados con objetos y sistemas mecánicos.',
    interpretaciones: {
      1: { // Muy Bajo
        rendimiento: 'Presenta dificultades significativas para comprender principios mecánicos y físicos básicos. Puede tener problemas para visualizar el funcionamiento de mecanismos simples.',
        academico: 'Puede experimentar dificultades en Física, Tecnología y materias técnicas. Necesita apoyo con material concreto, demostraciones prácticas y explicaciones paso a paso.',
        vocacional: 'Se beneficiaría de profesiones que no requieran comprensión mecánica compleja. Puede destacar en áreas verbales, administrativas o sociales donde las demandas técnicas sean mínimas.'
      },
      2: { // Bajo
        rendimiento: 'Muestra un rendimiento por debajo del promedio en tareas mecánicas. Puede comprender principios básicos pero tiene dificultades con sistemas más complejos.',
        academico: 'Requiere apoyo adicional en materias técnicas. Se beneficia de demostraciones prácticas, material manipulativo y explicaciones visuales de conceptos mecánicos.',
        vocacional: 'Puede desenvolverse en profesiones que requieran habilidades mecánicas básicas, especialmente si se combinan con otras competencias. Las áreas de mantenimiento simple pueden ser adecuadas.'
      },
      3: { // Medio-Bajo
        rendimiento: 'Presenta un rendimiento ligeramente por debajo del promedio. Puede manejar conceptos mecánicos simples pero experimenta dificultades con sistemas más sofisticados.',
        academico: 'Con esfuerzo adicional puede alcanzar un rendimiento satisfactorio en materias técnicas básicas. Se beneficia de práctica hands-on y apoyo en conceptos fundamentales.',
        vocacional: 'Tiene potencial para desarrollarse en diversas áreas técnicas, especialmente aquellas que no dependan exclusivamente de habilidades mecánicas avanzadas. Con formación puede compensar esta limitación.'
      },
      4: { // Medio
        rendimiento: 'Demuestra una comprensión mecánica dentro del rango promedio. Puede entender principios físicos básicos y el funcionamiento de mecanismos simples.',
        academico: 'Presenta un rendimiento satisfactorio en materias técnicas de nivel medio. Puede abordar conceptos de física aplicada y tecnología con estrategias convencionales.',
        vocacional: 'Posee las competencias mecánicas necesarias para una amplia gama de profesiones técnicas. Puede desarrollarse en áreas de mantenimiento, operación de equipos y tecnología básica.'
      },
      5: { // Medio-Alto
        rendimiento: 'Muestra una comprensión mecánica por encima del promedio. Visualiza el funcionamiento de sistemas complejos con facilidad y comprende principios físicos avanzados.',
        academico: 'Presenta fortalezas en Física, Tecnología y materias técnicas. Puede abordar problemas mecánicos complejos y comprender sistemas tecnológicos avanzados.',
        vocacional: 'Tiene potencial para destacar en profesiones técnicas especializadas: mecánica automotriz, ingeniería técnica, mantenimiento industrial, operación de maquinaria compleja y áreas tecnológicas.'
      },
      6: { // Alto
        rendimiento: 'Demuestra una comprensión mecánica superior. Maneja principios físicos complejos con facilidad y muestra una intuición excepcional para el funcionamiento de sistemas mecánicos.',
        academico: 'Destaca en materias técnicas y puede abordar problemas de ingeniería básica. Tiene capacidad para el análisis de sistemas complejos y el diseño mecánico.',
        vocacional: 'Posee las competencias para destacar en profesiones técnicas avanzadas: ingeniería mecánica, diseño industrial, automatización, robótica y campos que requieren comprensión técnica sofisticada.'
      },
      7: { // Muy Alto
        rendimiento: 'Presenta una comprensión mecánica excepcional. Demuestra una intuición superior para los principios físicos y puede analizar los sistemas mecánicos más complejos.',
        academico: 'Puede destacar significativamente en todas las materias técnicas. Tiene potencial para el trabajo académico avanzado en ingeniería, física aplicada y disciplinas técnicas especializadas.',
        vocacional: 'Posee el potencial para sobresalir en las profesiones técnicas más exigentes: ingeniería de vanguardia, investigación en mecánica aplicada, diseño de sistemas complejos y liderazgo en innovación tecnológica.'
      }
    }
  },

  O: { // Ortografía
    nombre: 'Ortografía',
    descripcion: 'La aptitud ortográfica evalúa el dominio de las reglas de escritura, la precisión en el uso de la lengua escrita y la capacidad para detectar y corregir errores ortográficos.',
    interpretaciones: {
      1: { // Muy Bajo
        rendimiento: 'Presenta dificultades significativas en el dominio de las reglas ortográficas. Puede cometer errores frecuentes en la escritura y tener problemas para detectar incorrecciones.',
        academico: 'Puede experimentar dificultades en Lengua y Literatura, y en la expresión escrita en general. Necesita apoyo especializado en reglas ortográficas y estrategias de revisión textual.',
        vocacional: 'Se beneficiaría de profesiones que no requieran escritura formal extensa. Puede destacar en áreas orales, técnicas o prácticas donde la escritura no sea el componente principal.'
      },
      2: { // Bajo
        rendimiento: 'Muestra un rendimiento por debajo del promedio en ortografía. Puede manejar reglas básicas pero tiene dificultades con palabras complejas o excepciones ortográficas.',
        academico: 'Requiere apoyo adicional en competencias de escritura. Se beneficia de práctica sistemática, uso de correctores ortográficos y estrategias de memorización de reglas.',
        vocacional: 'Puede desenvolverse en profesiones que requieran escritura básica, especialmente si cuenta con herramientas de apoyo tecnológico. Las áreas técnicas o prácticas pueden ser más adecuadas.'
      },
      3: { // Medio-Bajo
        rendimiento: 'Presenta un rendimiento ligeramente por debajo del promedio. Puede manejar la ortografía cotidiana pero experimenta dificultades con vocabulario técnico o especializado.',
        academico: 'Con esfuerzo adicional puede alcanzar un rendimiento satisfactorio en escritura. Se beneficia de técnicas de estudio que incluyan práctica ortográfica sistemática y uso de recursos de apoyo.',
        vocacional: 'Tiene potencial para desarrollarse en diversas áreas, especialmente aquellas que no dependan exclusivamente de escritura formal compleja. Con herramientas puede compensar esta limitación.'
      },
      4: { // Medio
        rendimiento: 'Demuestra un dominio ortográfico dentro del rango promedio. Puede escribir correctamente la mayoría de palabras comunes y aplicar reglas ortográficas básicas.',
        academico: 'Presenta un rendimiento satisfactorio en tareas de escritura. Puede abordar trabajos académicos con un nivel ortográfico adecuado para su nivel educativo.',
        vocacional: 'Posee las competencias ortográficas necesarias para una amplia gama de profesiones. Puede desarrollarse tanto en áreas que requieran escritura como en campos más técnicos.'
      },
      5: { // Medio-Alto
        rendimiento: 'Muestra un dominio ortográfico por encima del promedio. Escribe con precisión y demuestra un buen conocimiento de reglas ortográficas complejas.',
        academico: 'Presenta fortalezas en Lengua y Literatura y en la expresión escrita en general. Puede abordar textos académicos complejos con alta precisión ortográfica.',
        vocacional: 'Tiene potencial para destacar en profesiones que requieren escritura de calidad: periodismo, educación, comunicación, redacción técnica y áreas que demanden precisión lingüística.'
      },
      6: { // Alto
        rendimiento: 'Demuestra un dominio ortográfico superior. Maneja reglas complejas con facilidad y muestra una precisión excepcional en la escritura formal.',
        academico: 'Destaca en materias lingüísticas y puede abordar textos académicos de alta complejidad. Tiene capacidad para la escritura académica avanzada y la corrección de textos.',
        vocacional: 'Posee las competencias para destacar en profesiones altamente especializadas en escritura: corrección de estilo, traducción, escritura profesional, crítica literaria y campos que requieren dominio lingüístico excepcional.'
      },
      7: { // Muy Alto
        rendimiento: 'Presenta un dominio ortográfico excepcional. Demuestra una precisión superior en la escritura y puede detectar las incorrecciones más sutiles.',
        academico: 'Puede destacar significativamente en todas las materias que requieran escritura formal. Tiene potencial para el trabajo académico avanzado en lingüística, literatura y disciplinas afines.',
        vocacional: 'Posee el potencial para sobresalir en las profesiones más exigentes lingüísticamente: investigación filológica, edición académica, escritura literaria profesional y liderazgo en campos que requieren dominio excepcional del lenguaje escrito.'
      }
    }
  }
};
