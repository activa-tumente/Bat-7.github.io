export const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDifference = today.getMonth() - birth.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

export const formatDateLong = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatTime = (dateOrSeconds) => {
  // Si es un número, asumimos que son segundos
  if (typeof dateOrSeconds === 'number') {
    if (dateOrSeconds < 0) return 'N/A';
    
    const hours = Math.floor(dateOrSeconds / 3600);
    const minutes = Math.floor((dateOrSeconds % 3600) / 60);
    const seconds = Math.floor(dateOrSeconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  
  // Si es una fecha
  if (!dateOrSeconds) return '';
  const d = new Date(dateOrSeconds);
  return d.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return `${formatDate(date)} ${formatTime(date)}`;
};

/**
 * Obtiene una fecha relativa (ej: "hace 2 días")
 */
export const getRelativeTime = (date, baseDate = new Date()) => {
  try {
    const targetDate = typeof date === 'string' ? new Date(date) : date;
    const base = typeof baseDate === 'string' ? new Date(baseDate) : baseDate;
    
    if (isNaN(targetDate.getTime()) || isNaN(base.getTime())) {
      return 'Fecha inválida';
    }

    const diffMs = targetDate.getTime() - base.getTime();
    const isPast = diffMs < 0;
    const absDiffMs = Math.abs(diffMs);
    
    const units = [
      { name: 'año', ms: 1000 * 60 * 60 * 24 * 365.25 },
      { name: 'mes', ms: 1000 * 60 * 60 * 24 * 30.44 },
      { name: 'semana', ms: 1000 * 60 * 60 * 24 * 7 },
      { name: 'día', ms: 1000 * 60 * 60 * 24 },
      { name: 'hora', ms: 1000 * 60 * 60 },
      { name: 'minuto', ms: 1000 * 60 }
    ];

    for (const unit of units) {
      const value = Math.floor(absDiffMs / unit.ms);
      if (value >= 1) {
        const unitName = value === 1 ? unit.name : `${unit.name}s`;
        return isPast ? `hace ${value} ${unitName}` : `en ${value} ${unitName}`;
      }
    }

    return 'ahora';
  } catch (error) {
    console.error('Error al calcular tiempo relativo:', error);
    return 'Error en fecha';
  }
};

/**
 * Valida si una cadena es una fecha válida
 */
export const isValidDate = (dateString) => {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && date.getFullYear() > 1900;
  } catch (error) {
    return false;
  }
};