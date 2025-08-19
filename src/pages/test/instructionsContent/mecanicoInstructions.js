// Instrucciones para el Test de Razonamiento Mecánico
const mecanicoInstructions = {
  id: "mecanico",
  name: 'Test de Razonamiento Mecánico',
  type: 'mecanico',
  description: 'Test M - Evaluación de la comprensión de principios físicos y mecánicos básicos.',
  duration: 12,
  numberOfQuestions: 28,
  instructions: [
    'Observar dibujos que representan diversas situaciones físicas o mecánicas y responder a una pregunta sobre cada situación, eligiendo la opción más adecuada.',
    'Analiza los elementos del dibujo y cómo interactúan entre sí.',
    'Aplica principios básicos de física y mecánica como palancas, poleas, engranajes, fuerzas, etc.',
    'Ten en cuenta la dirección de las fuerzas, el movimiento o el equilibrio en cada situación.',
    'Entre las opciones presentadas, selecciona la que mejor explica el fenómeno o predice el resultado.',
    'Marca la letra correspondiente (A, B, C o D) en la hoja de respuestas.',
    'Si no estás seguro, intenta aplicar el sentido común y los principios básicos que conozcas.',
  ],
  additionalInfo: 'Este test evalúa tu comprensión intuitiva de principios físicos y mecánicos, así como tu capacidad para aplicar estos principios a situaciones prácticas. No requiere conocimientos técnicos avanzados, sino una comprensión básica de cómo funcionan los objetos en el mundo físico.',
  components: [
    { name: 'Comprensión Física', description: 'Mide tu entendimiento de principios físicos básicos' },
    { name: 'Razonamiento Mecánico', description: 'Evalúa tu capacidad para entender sistemas mecánicos' },
    { name: 'Resolución de Problemas', description: 'Mide tu habilidad para aplicar principios a situaciones nuevas' },
    { name: 'Intuición Tecnológica', description: 'Evalúa tu comprensión natural de cómo funcionan las máquinas' },
  ],
  recommendations: [
    'Recuerda principios básicos como la ley de la palanca, la transmisión de fuerzas en poleas y engranajes.',
    'Considera factores como la gravedad, la fricción y la inercia cuando analices cada situación.',
    'Visualiza el movimiento o la acción que ocurriría en la situación presentada.',
    'Si tienes dificultades, intenta simplificar el problema a sus componentes más básicos.',
  ]
};

export default mecanicoInstructions;
