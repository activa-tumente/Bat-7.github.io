// Instrucciones para la Batería Completa BAT-7
const bat7Instructions = {
  id: "bat7",
  name: 'Batería Completa BAT-7',
  type: 'battery',
  description: 'Evaluación completa de aptitudes y habilidades cognitivas.',
  duration: 120,
  numberOfQuestions: 184,
  instructions: [
    'Lee atentamente cada pregunta antes de responder.',
    'Responde a todas las preguntas, aunque no estés seguro/a de la respuesta.',
    'Administra bien tu tiempo. Si una pregunta te resulta difícil, pasa a la siguiente y vuelve a ella más tarde.',
    'No uses calculadora ni ningún otro dispositivo o material durante el test.',
    'Una vez iniciado el test, no podrás pausarlo. Asegúrate de disponer del tiempo necesario para completarlo.',
    'Responde con honestidad. Este test está diseñado para evaluar tus habilidades actuales.',
    'Cada subtest tiene instrucciones específicas que deberás leer antes de comenzar esa sección.',
  ],
  additionalInfo: 'La batería BAT-7 está compuesta por siete pruebas independientes que evalúan diferentes aptitudes: verbal, espacial, numérica, mecánica, razonamiento, atención y ortografía. Cada prueba tiene un tiempo específico de realización y unas instrucciones particulares.',
  subtests: [
    { 
      id: 'verbal', 
      name: 'Test de Aptitud Verbal (V)', 
      duration: 12, 
      questions: 32, 
      description: 'Evaluación de analogías verbales y comprensión de relaciones entre conceptos.' 
    },
    { 
      id: 'ortografia', 
      name: 'Test de Ortografía (O)', 
      duration: 10, 
      questions: 32, 
      description: 'Identificación de palabras con errores ortográficos.' 
    },
    { 
      id: 'razonamiento', 
      name: 'Test de Razonamiento (R)', 
      duration: 20, 
      questions: 32, 
      description: 'Continuación de series lógicas de figuras.' 
    },
    { 
      id: 'atencion', 
      name: 'Test de Atención (A)', 
      duration: 8, 
      questions: 80, 
      description: 'Rapidez y precisión en la localización de símbolos.' 
    },
    { 
      id: 'espacial', 
      name: 'Test de Visualización Espacial (E)', 
      duration: 15, 
      questions: 28, 
      description: 'Razonamiento espacial con cubos y redes.' 
    },
    { 
      id: 'mecanico', 
      name: 'Test de Razonamiento Mecánico (M)', 
      duration: 12, 
      questions: 28, 
      description: 'Comprensión de principios físicos y mecánicos básicos.' 
    },
    { 
      id: 'numerico', 
      name: 'Test de Razonamiento Numérico (N)', 
      duration: 20, 
      questions: 32, 
      description: 'Resolución de problemas numéricos, series y tablas.' 
    }
  ],
  recommendations: [
    'Descansa adecuadamente antes de realizar la batería completa.',
    'Realiza los tests en un ambiente tranquilo y sin distracciones.',
    'Gestiona tu energía a lo largo de toda la batería, ya que algunos tests son más exigentes que otros.',
    'Mantén una actitud positiva y confía en tus capacidades.',
  ]
};

export default bat7Instructions;
