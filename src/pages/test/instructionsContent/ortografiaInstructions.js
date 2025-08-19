// Instrucciones para el Test de Ortografía
const ortografiaInstructions = {
  id: "ortografia",
  name: 'Test de Ortografía',
  type: 'ortografia',
  description: 'Test O - Evaluación de la capacidad para identificar errores ortográficos en palabras.',
  duration: 10,
  numberOfQuestions: 32,
  instructions: [
    'En cada grupo de cuatro palabras, identificar la única palabra que está mal escrita (intencionadamente).',
    'La falta de ortografía puede ser de cualquier tipo, incluyendo errores en letras o la ausencia/presencia incorrecta de una tilde.',
    'Marcar la letra correspondiente (A, B, C o D) a la palabra mal escrita.',
    'Trabajar rápidamente. Si no se está seguro, elegir la opción que parezca más correcta (no se penaliza el error).',
    'Si se termina antes, repasar las respuestas.',
  ],
  additionalInfo: 'Este test evalúa tu dominio de las reglas ortográficas del español, incluyendo acentuación, uso de letras específicas y formación de palabras.',
  components: [
    { name: 'Ortografía General', description: 'Mide tu conocimiento de las reglas básicas de escritura' },
    { name: 'Acentuación', description: 'Evalúa tu dominio de las reglas de acentuación' },
    { name: 'Uso de Letras', description: 'Mide tu conocimiento del uso correcto de letras que pueden confundirse' },
    { name: 'Atención al Detalle', description: 'Evalúa tu capacidad para detectar errores sutiles' },
  ],
  recommendations: [
    'Revisa visualmente cada palabra con atención.',
    'Recuerda las reglas de acentuación de palabras agudas, llanas y esdrújulas.',
    'Presta especial atención a las letras que suelen causar confusión: b/v, g/j, h, etc.',
    'Observa la presencia o ausencia de tildes en las palabras.',
  ],
  examples: [
    {
      question: 'A. año, B. berso, C. vuelo, D. campana',
      answer: 'B',
      explanation: 'La grafía correcta es "verso".'
    },
    {
      question: 'A. bosque, B. armario, C. telon, D. libro',
      answer: 'C',
      explanation: 'La palabra correcta es "telón", lleva tilde en la "o".'
    }
  ]
};

export default ortografiaInstructions;