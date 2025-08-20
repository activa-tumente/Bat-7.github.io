// Instrucciones para el Test de Atención
const atencionInstructions = {
  id: "atencion",
  name: 'Test de Atención',
  type: 'atencion',
  description: 'Test A - Evaluación de la rapidez y precisión en la localización de símbolos.',
  duration: 8,
  numberOfQuestions: 80,
  instructions: [
    'En cada ejercicio aparece una fila con diferentes símbolos y tu tarea consistirá en localizar cuántas veces aparece uno determinado.',
    'El símbolo que tienes que localizar es siempre el mismo y se presenta en la parte superior de la página.',
    'El símbolo puede aparecer 0, 1, 2 o 3 veces en cada fila, pero nunca más de 3.',
    'Deberás marcar cuántas veces aparece el símbolo en cada fila (0, 1, 2 o 3).',
    'Trabaja con rapidez y precisión, asegurándote de que tu respuesta se corresponda con el número del ejercicio que estás contestando.',
    'Avanza sistemáticamente por cada fila, de izquierda a derecha.',
    'Presta especial atención a símbolos muy similares al modelo pero que no son idénticos.',
  ],
  additionalInfo: 'Esta prueba trata de evaluar tu rapidez y tu precisión trabajando con símbolos. Es una medida de la atención selectiva y sostenida, así como de la velocidad y precisión en el procesamiento de información visual.',
  components: [
    { name: 'Atención Selectiva', description: 'Mide tu capacidad para enfocarte en elementos específicos' },
    { name: 'Velocidad Perceptiva', description: 'Evalúa tu rapidez para procesar información visual' },
    { name: 'Discriminación Visual', description: 'Mide tu habilidad para distinguir detalles visuales' },
    { name: 'Concentración', description: 'Evalúa tu capacidad para mantener el foco durante una tarea repetitiva' },
  ],
  recommendations: [
    'Mantén un ritmo constante, sin detenerte demasiado en ningún elemento.',
    'Si en algún ejercicio no estás completamente seguro de cuál puede ser, elige la opción que creas que es más correcta; no se penalizará el error.',
    'Si terminas antes del tiempo concedido, repasa tus respuestas.',
    'Utiliza el dedo o un marcador para seguir las filas si te ayuda a mantener el enfoque.',
    'Evita distracciones y mantén la concentración en la tarea.',
  ]
};

export default atencionInstructions;
