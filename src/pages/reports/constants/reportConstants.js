// Constantes para el sistema de informes BAT-7

export const NIVEL_CONFIG = {
  'Muy Alto': { 
    color: 'bg-purple-600', 
    textColor: 'text-purple-600',
    borderColor: 'border-purple-600',
    label: 'Muy Alto (>95)', 
    range: [96, 100],
    icon: 'fa-star'
  },
  'Alto': { 
    color: 'bg-green-500', 
    textColor: 'text-green-500',
    borderColor: 'border-green-500',
    label: 'Alto (81-95)', 
    range: [81, 95],
    icon: 'fa-arrow-up'
  },
  'Medio-Alto': { 
    color: 'bg-blue-500', 
    textColor: 'text-blue-500',
    borderColor: 'border-blue-500',
    label: 'Medio-Alto (61-80)', 
    range: [61, 80],
    icon: 'fa-chevron-up'
  },
  'Medio': { 
    color: 'bg-gray-500', 
    textColor: 'text-gray-500',
    borderColor: 'border-gray-500',
    label: 'Medio (41-60)', 
    range: [41, 60],
    icon: 'fa-minus'
  },
  'Medio-Bajo': { 
    color: 'bg-yellow-500', 
    textColor: 'text-yellow-500',
    borderColor: 'border-yellow-500',
    label: 'Medio-Bajo (21-40)', 
    range: [21, 40],
    icon: 'fa-chevron-down'
  },
  'Bajo': { 
    color: 'bg-orange-500', 
    textColor: 'text-orange-500',
    borderColor: 'border-orange-500',
    label: 'Bajo (6-20)', 
    range: [6, 20],
    icon: 'fa-arrow-down'
  },
  'Muy Bajo': { 
    color: 'bg-red-500', 
    textColor: 'text-red-500',
    borderColor: 'border-red-500',
    label: 'Muy Bajo (≤5)', 
    range: [0, 5],
    icon: 'fa-exclamation-triangle'
  }
};

export const APTITUDES_CONFIG = {
  'V': {
    nombre: 'Aptitud Verbal',
    descripcion: 'Capacidad para comprender y operar con conceptos expresados verbalmente',
    icon: 'fa-comments',
    color: 'blue'
  },
  'E': {
    nombre: 'Aptitud Espacial',
    descripcion: 'Capacidad para percibir y manipular objetos en el espacio',
    icon: 'fa-cube',
    color: 'green'
  },
  'A': {
    nombre: 'Atención y Concentración',
    descripcion: 'Capacidad para mantener la atención sostenida y concentrarse',
    icon: 'fa-eye',
    color: 'purple'
  },
  'R': {
    nombre: 'Razonamiento',
    descripcion: 'Capacidad para resolver problemas mediante el pensamiento lógico',
    icon: 'fa-brain',
    color: 'indigo'
  },
  'N': {
    nombre: 'Aptitud Numérica',
    descripcion: 'Capacidad para trabajar con números y conceptos matemáticos',
    icon: 'fa-calculator',
    color: 'red'
  },
  'M': {
    nombre: 'Aptitud Mecánica',
    descripcion: 'Comprensión de principios mecánicos y físicos básicos',
    icon: 'fa-cogs',
    color: 'gray'
  },
  'O': {
    nombre: 'Ortografía',
    descripcion: 'Conocimiento de las reglas ortográficas del idioma',
    icon: 'fa-spell-check',
    color: 'yellow'
  }
};

export const INDICES_INTELIGENCIA = {
  'g': {
    nombre: 'Capacidad General',
    descripcion: 'Estimación del potencial intelectual global',
    componentes: ['V', 'E', 'A', 'R', 'N', 'M', 'O'],
    icon: 'fa-lightbulb',
    color: 'purple'
  },
  'Gf': {
    nombre: 'Inteligencia Fluida',
    descripcion: 'Capacidad para resolver problemas nuevos independientemente del conocimiento previo',
    componentes: ['R', 'N', 'E'],
    icon: 'fa-water',
    color: 'blue'
  },
  'Gc': {
    nombre: 'Inteligencia Cristalizada',
    descripcion: 'Conocimientos y habilidades adquiridas a través de la experiencia',
    componentes: ['V', 'O'],
    icon: 'fa-gem',
    color: 'green'
  }
};

export const getLevelConfigByPercentile = (percentil) => {
  if (percentil > 95) return NIVEL_CONFIG['Muy Alto'];
  if (percentil >= 81) return NIVEL_CONFIG['Alto'];
  if (percentil >= 61) return NIVEL_CONFIG['Medio-Alto'];
  if (percentil >= 41) return NIVEL_CONFIG['Medio'];
  if (percentil >= 21) return NIVEL_CONFIG['Medio-Bajo'];
  if (percentil >= 6) return NIVEL_CONFIG['Bajo'];
  return NIVEL_CONFIG['Muy Bajo'];
};

export const getLevelNameByPercentile = (percentil) => {
  if (percentil > 95) return 'Muy Alto';
  if (percentil >= 81) return 'Alto';
  if (percentil >= 61) return 'Medio-Alto';
  if (percentil >= 41) return 'Medio';
  if (percentil >= 21) return 'Medio-Bajo';
  if (percentil >= 6) return 'Bajo';
  return 'Muy Bajo';
};

export const calcularIndicesInteligencia = (resultados) => {
  if (!resultados || resultados.length === 0) return {};

  const aptitudesPorCodigo = {};
  resultados.forEach(r => {
    if (r.aptitud?.codigo) {
      aptitudesPorCodigo[r.aptitud.codigo] = r.percentil || 0;
    }
  });

  const indices = {};

  // Capacidad General (g) - promedio de todas las aptitudes
  const todasAptitudes = Object.values(aptitudesPorCodigo);
  if (todasAptitudes.length > 0) {
    indices.g = Math.round(todasAptitudes.reduce((sum, val) => sum + val, 0) / todasAptitudes.length);
  }

  // Inteligencia Fluida (Gf) - R, N, E
  const gfAptitudes = ['R', 'N', 'E'].map(codigo => aptitudesPorCodigo[codigo]).filter(val => val !== undefined);
  if (gfAptitudes.length > 0) {
    indices.Gf = Math.round(gfAptitudes.reduce((sum, val) => sum + val, 0) / gfAptitudes.length);
  }

  // Inteligencia Cristalizada (Gc) - V, O
  const gcAptitudes = ['V', 'O'].map(codigo => aptitudesPorCodigo[codigo]).filter(val => val !== undefined);
  if (gcAptitudes.length > 0) {
    indices.Gc = Math.round(gcAptitudes.reduce((sum, val) => sum + val, 0) / gcAptitudes.length);
  }

  return indices;
};