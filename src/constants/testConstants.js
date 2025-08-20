/**
 * Test configuration constants for BAT-7 system
 */

// Educational levels configuration
export const EDUCATIONAL_LEVELS = {
  E: {
    code: 'E',
    name: 'Nivel E (Escolar)',
    subtitle: 'Estudiantes Básicos',
    description: 'Tests diseñados para estudiantes de educación básica y media',
    icon: 'fas fa-graduation-cap',
    color: 'green',
    bgClass: 'bg-green-50',
    borderClass: 'border-green-200',
    textClass: 'text-green-700',
    iconBg: 'bg-green-100',
    available: true
  },
  M: {
    code: 'M',
    name: 'Nivel M (Media)',
    subtitle: 'Media Vocacional',
    description: 'Tests para estudiantes de educación media vocacional y técnica',
    icon: 'fas fa-tools',
    color: 'blue',
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-200',
    textClass: 'text-blue-700',
    iconBg: 'bg-blue-100',
    available: false
  },
  S: {
    code: 'S',
    name: 'Nivel S (Superior)',
    subtitle: 'Selección Laboral',
    description: 'Tests para selección de personal y evaluación profesional',
    icon: 'fas fa-briefcase',
    color: 'purple',
    bgClass: 'bg-purple-50',
    borderClass: 'border-purple-200',
    textClass: 'text-purple-700',
    iconBg: 'bg-purple-100',
    available: false
  }
};

// Test configurations by level
export const TESTS_BY_LEVEL = {
  E: [
    {
      id: 'verbal',
      title: 'Aptitud Verbal',
      description: 'Evaluación de analogías verbales y comprensión de relaciones entre conceptos',
      time: 12,
      questions: 32,
      iconClass: 'fas fa-comments',
      bgClass: 'bg-blue-100',
      textClass: 'text-blue-600',
      buttonColor: 'blue',
      abbreviation: 'V'
    },
    {
      id: 'espacial',
      title: 'Aptitud Espacial',
      description: 'Razonamiento espacial con cubos y redes geométricas',
      time: 15,
      questions: 28,
      iconClass: 'fas fa-cube',
      bgClass: 'bg-indigo-100',
      textClass: 'text-indigo-600',
      buttonColor: 'indigo',
      abbreviation: 'E'
    },
    {
      id: 'atencion',
      title: 'Atención',
      description: 'Rapidez y precisión en la localización de símbolos específicos',
      time: 8,
      questions: 80,
      iconClass: 'fas fa-eye',
      bgClass: 'bg-red-100',
      textClass: 'text-red-600',
      buttonColor: 'red',
      abbreviation: 'A'
    },
    {
      id: 'razonamiento',
      title: 'Razonamiento',
      description: 'Continuar series lógicas de figuras y patrones',
      time: 20,
      questions: 32,
      iconClass: 'fas fa-puzzle-piece',
      bgClass: 'bg-amber-100',
      textClass: 'text-amber-600',
      buttonColor: 'amber',
      abbreviation: 'R'
    },
    {
      id: 'numerico',
      title: 'Aptitud Numérica',
      description: 'Resolución de igualdades, series numéricas y análisis de datos',
      time: 20,
      questions: 30,
      iconClass: 'fas fa-calculator',
      bgClass: 'bg-teal-100',
      textClass: 'text-teal-600',
      buttonColor: 'teal',
      abbreviation: 'N'
    },
    {
      id: 'mecanico',
      title: 'Aptitud Mecánica',
      description: 'Comprensión de principios físicos y mecánicos básicos',
      time: 12,
      questions: 28,
      iconClass: 'fas fa-cogs',
      bgClass: 'bg-slate-100',
      textClass: 'text-slate-600',
      buttonColor: 'slate',
      abbreviation: 'M'
    },
    {
      id: 'ortografia',
      title: 'Ortografía',
      description: 'Identificación de palabras con errores ortográficos',
      time: 10,
      questions: 32,
      iconClass: 'fas fa-spell-check',
      bgClass: 'bg-green-100',
      textClass: 'text-green-600',
      buttonColor: 'green',
      abbreviation: 'O'
    }
  ],
  M: [],
  S: []
};

// Test color mappings
export const TEST_COLORS = {
  'V': '#3B82F6', // Blue
  'E': '#6366F1', // Indigo
  'A': '#EF4444', // Red
  'R': '#F59E0B', // Amber
  'N': '#14B8A6', // Teal
  'M': '#64748B', // Slate
  'O': '#10B981'  // Green
};

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  EXCELLENT: 75,
  GOOD: 50,
  NEEDS_IMPROVEMENT: 25
};

// Chart colors for results
export const CHART_COLORS = {
  CORRECT: '#10B981',
  INCORRECT: '#EF4444',
  UNANSWERED: '#6B7280'
};