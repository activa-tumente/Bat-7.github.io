// Instrucciones para el Test de Aptitud Verbal
const verbalInstructions = {
  id: "verbal",
  name: 'Test de Aptitud Verbal',
  type: 'verbal',
  description: 'Test V - Evaluación de analogías verbales. Este test evalúa la capacidad para identificar relaciones entre palabras y conceptos, midiendo el razonamiento verbal y la comprensión de relaciones lógicas.',
  duration: 12,
  numberOfQuestions: 32,
  instructions: [
    'Lee cada pregunta detenidamente antes de responder.',
    'En cada ejercicio, debes encontrar la palabra que completa la frase dotándola de sentido.',
    'Para las analogías verbales, identifica la relación exacta entre el primer par de palabras.',
    'Entre las cuatro opciones, solo UNA es la correcta.',
    'Marca la letra correspondiente (A, B, C o D) en la hoja de respuestas.',
    'Trabaja rápidamente, ya que el tiempo es limitado.',
    'Si no estás completamente seguro de una respuesta, elige la opción que creas más correcta; no se penalizan los errores.',
  ],
  additionalInfo: 'Este test evalúa tu capacidad para comprender relaciones entre conceptos expresados a través de palabras. Implica el dominio del lenguaje y la habilidad para entender relaciones lógicas entre conceptos verbales.',
  components: [
    { name: 'Analogías Verbales', description: 'Mide tu capacidad para identificar relaciones entre conceptos' },
    { name: 'Razonamiento Verbal', description: 'Evalúa tu habilidad para entender relaciones lógicas' },
    { name: 'Comprensión Lingüística', description: 'Mide tu dominio del lenguaje y vocabulario' },
    { name: 'Pensamiento Abstracto', description: 'Evalúa tu capacidad para identificar patrones conceptuales' },
  ],
  recommendations: [
    'Fíjate bien en la relación entre el primer par de palabras para identificar el patrón que debes aplicar.',
    'Si no encuentras la respuesta inmediatamente, analiza cada opción eliminando las que claramente no cumplen con la relación buscada.',
    'Recuerda que las relaciones pueden ser de diversos tipos: causa-efecto, parte-todo, función, oposición, etc.',
    'Si terminas antes del tiempo concedido, aprovecha para revisar tus respuestas.',
  ]
};

export default verbalInstructions;
