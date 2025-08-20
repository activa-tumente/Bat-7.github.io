// Instrucciones para el Test de Visualización Espacial
const espacialInstructions = {
  id: "espacial",
  name: 'Test de Aptitud Espacial',
  type: 'espacial',
  description: 'Test E - Evaluación del razonamiento espacial con cubos y redes.',
  duration: 15,
  numberOfQuestions: 28,
  instructions: [
    'En cada ejercicio encontrarás un cubo junto con su modelo desplegado, al que se le han borrado casi todos los números y letras.',
    'Tu tarea consistirá en averiguar qué número o letra debería aparecer en lugar del interrogante (?) y en qué orientación.',
    'En el cubo se han representado en color gris los números o letras que se encuentran en las caras de atrás (las que no se ven directamente).',
    'Observa cuidadosamente la orientación y posición relativa de las caras en el cubo.',
    'Considera cómo las distintas caras del cubo se conectan entre sí en el modelo desplegado.',
    'Visualiza mentalmente el proceso de plegado del modelo para formar el cubo.',
    'Entre las cuatro opciones, solo UNA es la correcta.',
    'Marca la letra correspondiente (A, B, C o D) en la hoja de respuestas.',
  ],
  additionalInfo: 'Este test evalúa tu capacidad para manipular objetos mentalmente en el espacio tridimensional. Es una medida de la visualización espacial, rotación mental y comprensión de relaciones espaciales.',
  components: [
    { name: 'Visualización Espacial', description: 'Mide tu capacidad para manipular objetos en 3D mentalmente' },
    { name: 'Rotación Mental', description: 'Evalúa tu habilidad para rotar figuras en tu mente' },
    { name: 'Relaciones Espaciales', description: 'Mide tu comprensión de cómo se conectan las partes de un objeto' },
    { name: 'Razonamiento Geométrico', description: 'Evalúa tu entendimiento de principios geométricos básicos' },
  ],
  recommendations: [
    'Utiliza marcas mentales para orientarte en la ubicación de cada cara del cubo.',
    'Fíjate en detalles específicos de los diseños en cada cara para determinar su orientación correcta.',
    'Si es necesario, utiliza tus manos para ayudarte a visualizar el plegado del modelo.',
    'Si en algún ejercicio no estás completamente seguro de cuál puede ser la respuesta, elige la opción que creas que es más correcta; no se penalizará el error.',
    'Si terminas antes del tiempo concedido, repasa tus respuestas.',
  ]
};

export default espacialInstructions;
