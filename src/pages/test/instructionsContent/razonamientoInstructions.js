// Instrucciones para el Test de Razonamiento
const razonamientoInstructions = {
  id: "razonamiento",
  name: 'Test de Razonamiento',
  type: 'razonamiento',
  description: 'Test R - Evaluación de la capacidad para identificar patrones y continuar series lógicas de figuras.',
  duration: 20,
  numberOfQuestions: 32,
  instructions: [
    'Observar una serie de figuras y determinar qué figura (A, B, C o D) debería ir a continuación, sustituyendo al interrogante, siguiendo la lógica de la serie.',
    'Analiza cuidadosamente cómo evolucionan las figuras en cada serie.',
    'Busca patrones como rotaciones, traslaciones, adiciones o sustracciones de elementos.',
    'Entre las cuatro opciones, solo UNA es la correcta.',
    'Marca la letra correspondiente (A, B, C o D) en la hoja de respuestas.',
    'Trabaja metódicamente, ya que algunas secuencias pueden tener patrones complejos.',
    'Si no estás completamente seguro de una respuesta, intenta descartar opciones que claramente no siguen el patrón.',
  ],
  additionalInfo: 'Este test evalúa tu capacidad para identificar patrones lógicos y aplicarlos para predecir el siguiente elemento en una secuencia. Es una medida del razonamiento inductivo y del pensamiento lógico-abstracto.',
  components: [
    { name: 'Razonamiento Inductivo', description: 'Mide tu capacidad para identificar reglas a partir de ejemplos' },
    { name: 'Pensamiento Lógico', description: 'Evalúa tu habilidad para aplicar reglas sistemáticamente' },
    { name: 'Visualización Espacial', description: 'Mide tu capacidad para manipular imágenes mentalmente' },
    { name: 'Atención al Detalle', description: 'Evalúa tu capacidad para detectar patrones sutiles' },
  ],
  recommendations: [
    'Intenta identificar más de un patrón en cada serie (puede haber cambios en color, forma, tamaño y posición).',
    'Observa si hay ciclos repetitivos en los patrones.',
    'Analiza cada elemento individualmente si la figura es compleja.',
    'Si encuentras dificultades, intenta verbalizar el patrón para hacerlo más claro.',
  ]
};

export default razonamientoInstructions;
