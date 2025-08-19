// Instrucciones para el Test de Aptitud Numérica
const numericoInstructions = {
  id: "numerico",
  name: 'Test de Aptitud Numérica',
  type: 'numerico',
  description: 'Test N - Resolución de problemas numéricos, series y tablas.',
  duration: 20,
  numberOfQuestions: 32,
  instructions: [
    'En esta prueba encontrarás distintos ejercicios numéricos que tendrás que resolver.',
    'Para ello tendrás que analizar la información que se presenta y determinar qué debe aparecer en lugar del interrogante.',
    'Cuando lo hayas decidido, deberás marcar la letra de la opción correspondiente en la hoja de respuestas.',
    'Asegúrate de que coincida con el ejercicio que estás contestando.',
    '',
    'El tiempo máximo para su realización es de 20 minutos, por lo que deberás trabajar rápidamente.',
    'Esfuérzate al máximo en encontrar la respuesta correcta.',
    'Si en algún ejercicio no estás completamente seguro de cuál puede ser, elige la opción que creas que es más correcta.',
    'No se penalizará el error.',
    'Si terminas antes del tiempo concedido, repasa tus respuestas, pero NO continúes con las demás pruebas.'
  ],
  additionalInfo: 'Este test evalúa tu capacidad para resolver problemas numéricos mediante el análisis de igualdades, series y tablas. Mide el razonamiento matemático, la identificación de patrones numéricos y la habilidad para trabajar con datos organizados.',
  components: [
    { name: 'Igualdades Numéricas', description: 'Resolver ecuaciones con elementos faltantes' },
    { name: 'Series Numéricas', description: 'Identificar patrones y continuar secuencias' },
    { name: 'Tablas de Datos', description: 'Analizar información organizada y encontrar valores faltantes' },
    { name: 'Cálculo Mental', description: 'Realizar operaciones matemáticas con rapidez y precisión' },
  ],
  recommendations: [
    'Lee cuidadosamente cada problema antes de intentar resolverlo.',
    'En las igualdades, calcula primero el lado conocido de la ecuación.',
    'En las series, busca patrones simples antes de considerar reglas más complejas.',
    'En las tablas, analiza las relaciones entre filas y columnas.',
    'Verifica tus cálculos cuando sea posible.',
    'Si no estás seguro, elige la opción que te parezca más lógica.'
  ]
};

export default numericoInstructions;
