// Preguntas completas del Test de Aptitud Numérica
export const numericoQuestions = [
  // Ejercicios 1-5: Igualdades numéricas
  {
    id: 1,
    type: 'equality',
    question: '6 + 22 = 30 - ?',
    options: ['2', '8', '10', '12', '28'],
    correct: 0 // A = 2
  },
  {
    id: 2,
    type: 'equality',
    question: '18 - 6 = 16 - ?',
    options: ['2', '3', '4', '6', '10'],
    correct: 2 // C = 4
  },
  {
    id: 3,
    type: 'equality',
    question: '7² - 9 = ? x 2',
    options: ['2', '7', '10', '20', '40'],
    correct: 3 // D = 20
  },
  {
    id: 4,
    type: 'equality',
    question: '(6 + 8) x ? = 4 x 7',
    options: ['2', '3', '4', '7', '10'],
    correct: 0 // A = 2
  },
  {
    id: 5,
    type: 'equality',
    question: '(3 + 9) x 3 = (? x 2) x 6',
    options: ['1', '2', '3', '4', '6'],
    correct: 2 // C = 3
  },

  // Ejercicios 6-10: Series numéricas
  {
    id: 6,
    type: 'series',
    question: '23 • 18 • 14 • 11 • ?',
    options: ['5', '6', '7', '8', '9'],
    correct: 4 // E = 9
  },
  {
    id: 7,
    type: 'series',
    question: '9 • 11 • 10 • 12 • 11 • 13 • ?',
    options: ['11', '12', '13', '14', '15'],
    correct: 1 // B = 12
  },
  {
    id: 8,
    type: 'series',
    question: '2 • 6 • 11 • 17 • 24 • 32 • ?',
    options: ['36', '37', '40', '41', '42'],
    correct: 3 // D = 41
  },
  {
    id: 9,
    type: 'series',
    question: '21 • 23 • 20 • 24 • 19 • 25 • 18 • ?',
    options: ['16', '20', '21', '22', '26'],
    correct: 4 // E = 26
  },
  {
    id: 10,
    type: 'series',
    question: '16 • 8 • 16 • 20 • 10 • 20 • 24 • 12 • ?',
    options: ['4', '6', '14', '24', '25'],
    correct: 3 // D = 24
  },

  // Ejercicios 11-15: Tablas
  {
    id: 11,
    type: 'table',
    question: 'Tabla: "Puntos obtenidos en la compra"',
    tableData: {
      headers: ['Artículo', 'Unidades', 'Puntos/Unidad', 'Total puntos'],
      rows: [
        ['Café', '55', '15', '825'],
        ['Galletas', '?', '6', '240'],
        ['Sal', '20', '5', '100'],
        ['', '', '', '1.165']
      ]
    },
    questionText: 'El interrogante (?) está en las Unidades de Galletas.',
    options: ['4', '40', '60', '75', '234'],
    correct: 1 // B = 40
  },
  {
    id: 12,
    type: 'table',
    question: 'Tabla: "Venta de productos por meses"',
    tableData: {
      headers: ['Meses', 'Televisión', 'Altavoces', 'Auriculares', 'Total'],
      rows: [
        ['Enero', '?', '(dato borrado)', '35', '85'],
        ['Febrero', '45', '(dato borrado)', '80', '175'],
        ['Marzo', '60', '45', '(dato borrado)', '(dato borrado)'],
        ['Total', '125', '(dato borrado)', '155', '(dato borrado)']
      ]
    },
    questionText: 'El interrogante (?) está en Televisión de Enero.',
    options: ['10', '20', '25', '30', '50'],
    correct: 1 // B = 20
  },
  {
    id: 13,
    type: 'table',
    question: 'Tabla: "Venta de productos por meses"',
    tableData: {
      headers: ['Meses', 'Secadoras', 'Lavadoras', 'Frigoríficos', 'Total'],
      rows: [
        ['Enero', '(dato borrado)', '(dato borrado)', '30', '90'],
        ['Febrero', '5', '40', '25', '70'],
        ['Marzo', '(dato borrado)', '30', '35', '105'],
        ['Abril', '50', '45', '?', '(dato borrado)'],
        ['Total', '(dato borrado)', '155', '145', '(dato borrado)']
      ]
    },
    questionText: 'El interrogante (?) está en Frigoríficos de Abril.',
    options: ['30', '45', '55', '65', '90'],
    correct: 2 // C = 55
  },
  {
    id: 14,
    type: 'table',
    question: 'Tabla: "Venta de productos por meses"',
    tableData: {
      headers: ['Meses', 'Televisión', 'Altavoces', 'Auriculares', 'Total'],
      rows: [
        ['Abril', '5', '8', '(dato borrado)', '33'],
        ['Mayo', '(dato borrado)', '15', '5', '30'],
        ['Junio', '10', '(dato borrado)', '(dato borrado)', '(dato borrado)'],
        ['Total', '?', '38', '32', '(dato borrado)']
      ]
    },
    questionText: 'El interrogante (?) está en el Total de Televisión.',
    options: ['10', '15', '20', '25', '30'],
    correct: 3 // D = 25
  },
  {
    id: 15,
    type: 'table',
    question: 'Tabla: "Venta de productos por meses"',
    tableData: {
      headers: ['Meses', 'Televisión', 'Altavoces', 'Auriculares', 'Total'],
      rows: [
        ['Enero', '20', '(dato borrado)', '15', '(dato borrado)'],
        ['Febrero', '?', '(dato borrado)', '30', '70'],
        ['Marzo', '20', '(dato borrado)', '30', '(dato borrado)'],
        ['Abril', '(dato borrado)', '15', '10', '55'],
        ['Total', '85', '(dato borrado)', '80', '(dato borrado)']
      ]
    },
    questionText: 'El interrogante (?) está en Televisión de Febrero.',
    options: ['10', '15', '25', '40', '45'],
    correct: 1 // B = 15
  },

  // Ejercicios 16-20: Igualdades complejas
  {
    id: 16,
    type: 'equality',
    question: '(30 : 5) : (14 : 7) = [(? x 5) + 3] : 11',
    options: ['1', '2', '3', '4', '6'],
    correct: 4 // E = 6
  },
  {
    id: 17,
    type: 'equality',
    question: '[(23 - 9) - 4] x 2 = [(? : 6) - 3] x 5',
    options: ['7', '20', '24', '30', '42'],
    correct: 4 // E = 42
  },
  {
    id: 18,
    type: 'equality',
    question: '20 + 35 - 14 = (? x 2) - 19',
    options: ['11', '25', '30', '35', '60'],
    correct: 2 // C = 30
  },
  {
    id: 19,
    type: 'equality',
    question: '(9 x 7) : (? - 2) = 9 + 7 + 5',
    options: ['3', '4', '5', '6', '12'],
    correct: 2 // C = 5
  },
  {
    id: 20,
    type: 'equality',
    question: '[(? : 7) - 3] : 2 = 21 : 7',
    options: ['2', '9', '42', '49', '63'],
    correct: 4 // E = 63
  },

  // Ejercicios 21-26: Series complejas
  {
    id: 21,
    type: 'series',
    question: '14 • 11 • 15 • 12 • 17 • 14 • 20 • 17 • 24 • 21 • ?',
    options: ['18', '25', '26', '27', '29'],
    correct: 4 // E = 29
  },
  {
    id: 22,
    type: 'series',
    question: '2 • 8 • 4 • 16 • 8 • ?',
    options: ['4', '14', '24', '26', '32'],
    correct: 4 // E = 32
  },
  {
    id: 23,
    type: 'series',
    question: '5 • 6 • 8 • 7 • 10 • 14 • 13 • 18 • 24 • 23 • ?',
    options: ['22', '24', '26', '28', '30'],
    correct: 4 // E = 30
  },
  {
    id: 24,
    type: 'series',
    question: '11 • 13 • 16 • 15 • 19 • 24 • 22 • ?',
    options: ['23', '24', '25', '26', '28'],
    correct: 4 // E = 28
  },
  {
    id: 25,
    type: 'series',
    question: '3 • 6 • 4 • 8 • 6 • ?',
    options: ['4', '9', '10', '11', '12'],
    correct: 4 // E = 12
  },
  {
    id: 26,
    type: 'series',
    question: '3 • 2 • 6 • 4 • 12 • 8 • 24 • 16 • 48 • 32 • 96 • ?',
    options: ['64', '80', '89', '92', '95'],
    correct: 0 // A = 64
  },

  // Ejercicios 27-32: Tablas complejas
  {
    id: 27,
    type: 'table',
    question: 'Tabla: "Venta de productos por meses"',
    tableData: {
      headers: ['Meses', 'Plancha', 'Depiladora', 'Afeitadora', 'Total'],
      rows: [
        ['Mayo', '20', '5', '(dato borrado)', '40'],
        ['Junio', '(dato borrado)', '(dato borrado)', '10', '(dato borrado)'],
        ['Abril', '(dato borrado)', '5', '(dato borrado)', '25'],
        ['Total', '40', '20', '?', '(dato borrado)']
      ]
    },
    questionText: 'El interrogante (?) está en el Total de Afeitadora.',
    options: ['60', '65', '75', '90', '95'],
    correct: 3 // D = 90
  },
  {
    id: 28,
    type: 'table',
    question: 'Tabla: "Venta de productos por meses"',
    tableData: {
      headers: ['Meses', 'Hornos', 'Microondas', 'Vitrocerámica', 'Total'],
      rows: [
        ['Septiembre', '25', '40', '5', '70'],
        ['Octubre', '(dato borrado)', '45', '50', '(dato borrado)'],
        ['Noviembre', '30', '(dato borrado)', '?', '90'],
        ['Diciembre', '35', '30', '(dato borrado)', '105'],
        ['Total', '145', '155', '(dato borrado)', '(dato borrado)']
      ]
    },
    questionText: 'El interrogante (?) está en Vitrocerámica de Noviembre.',
    options: ['10', '15', '20', '30', '60'],
    correct: 2 // C = 20
  },
  {
    id: 29,
    type: 'table',
    question: 'Tabla: "Venta de productos por meses"',
    tableData: {
      headers: ['Meses', 'Cafetera', 'Tostadora', 'Freidora', 'Total'],
      rows: [
        ['Enero', '(dato borrado)', '5', '20', '35'],
        ['Febrero', '(dato borrado)', '(dato borrado)', '5', '30'],
        ['Marzo', '15', '30', '?', '(dato borrado)'],
        ['Total', '(dato borrado)', '55', '40', '(dato borrado)']
      ]
    },
    questionText: 'El interrogante (?) está en Freidora de Marzo.',
    options: ['5', '10', '15', '20', '25'],
    correct: 2 // C = 15
  },
  {
    id: 30,
    type: 'table',
    question: 'Tabla: "Puntos obtenidos en la compra"',
    tableData: {
      headers: ['Artículo', 'Unidades', 'Puntos/Unidad', 'Total puntos'],
      rows: [
        ['Chocolate', '5', '225', '1.125'],
        ['Harina', '6', '?', '(dato borrado)'],
        ['Nueces', '8', '140', '(dato borrado)'],
        ['', '', '', '3.925']
      ]
    },
    questionText: 'El interrogante (?) está en Puntos/Unidad de Harina.',
    options: ['26', '265', '270', '280', '1.680'],
    correct: 3 // D = 280
  },
  {
    id: 31,
    type: 'table',
    question: 'Tabla: "Venta de productos por meses"',
    tableData: {
      headers: ['Meses', 'Hornos', 'Microondas', 'Vitrocerámica', 'Total'],
      rows: [
        ['Mayo', '(dato borrado)', '15', '20', '45'],
        ['Junio', '15', '10', '(dato borrado)', '55'],
        ['Julio', '(dato borrado)', '5', '20', '(dato borrado)'],
        ['Agosto', '10', '(dato borrado)', '10', '25'],
        ['Total', '?', '(dato borrado)', '80', '155']
      ]
    },
    questionText: 'El interrogante (?) está en el Total de Hornos.',
    options: ['25', '35', '40', '45', '50'],
    correct: 2 // C = 40
  },
  {
    id: 32,
    type: 'table',
    question: 'Tabla: "Puntos obtenidos en la compra"',
    tableData: {
      headers: ['Artículo', 'Unidades', 'Puntos/Unidad', 'Total puntos'],
      rows: [
        ['Grapa', '2.500', '0,05', '125'],
        ['Chincheta', '3.000', '?', '(dato borrado)'],
        ['Tornillo', '1.200', '0,1', '(dato borrado)'],
        ['', '', '', '845']
      ]
    },
    questionText: 'El interrogante (?) está en Puntos/Unidad de Chincheta.',
    options: ['0,03', '0,1', '0,2', '0,5', '5'],
    correct: 2 // C = 0,2
  }
];
