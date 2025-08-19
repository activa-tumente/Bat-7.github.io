/**
 * Utilidades para el manejo de entidades
 */

/**
 * Calcula la edad basada en la fecha de nacimiento
 */
export const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Renderiza un chip con estilo
 */
export const renderChip = (value, color = 'gray') => {
  if (!value) return '-';
  
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    indigo: 'bg-indigo-100 text-indigo-800',
    purple: 'bg-purple-100 text-purple-800',
    pink: 'bg-pink-100 text-pink-800',
    cyan: 'bg-cyan-100 text-cyan-800',
    gray: 'bg-gray-100 text-gray-800'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[color] || colorClasses.gray}`}>
      {value}
    </span>
  );
};

/**
 * Renderiza un chip específico para género
 */
export const renderGenderChip = (gender) => {
  const genderConfig = {
    'Masculino': { color: 'blue', label: 'Masculino' },
    'Femenino': { color: 'pink', label: 'Femenino' },
    'Otro': { color: 'purple', label: 'Otro' }
  };
  
  const config = genderConfig[gender] || { color: 'gray', label: gender || '-' };
  return renderChip(config.label, config.color);
};

/**
 * Renderiza un chip para estado activo/inactivo
 */
export const renderStatusChip = (isActive) => {
  return renderChip(
    isActive ? 'Activo' : 'Inactivo',
    isActive ? 'green' : 'red'
  );
};

/**
 * Formatea una fecha para mostrar
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '-';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  return new Date(date).toLocaleDateString('es-ES', { ...defaultOptions, ...options });
};

/**
 * Formatea un nombre completo
 */
export const formatFullName = (firstName, lastName) => {
  const parts = [firstName, lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : '-';
};

/**
 * Valida un email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida un documento de identidad (básico)
 */
export const isValidDocument = (document) => {
  if (!document) return false;
  // Remover espacios y caracteres especiales
  const cleanDoc = document.replace(/[^0-9]/g, '');
  // Debe tener entre 6 y 12 dígitos
  return cleanDoc.length >= 6 && cleanDoc.length <= 12;
};

/**
 * Genera un color aleatorio para avatares
 */
export const getAvatarColor = (name) => {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-cyan-500'
  ];
  
  if (!name) return colors[0];
  
  const hash = name.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Obtiene las iniciales de un nombre
 */
export const getInitials = (firstName, lastName) => {
  const first = firstName ? firstName.charAt(0).toUpperCase() : '';
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  return first + last || '?';
};

/**
 * Filtra una lista de entidades basado en un término de búsqueda
 */
export const filterBySearchTerm = (entities, searchTerm, searchFields = []) => {
  if (!searchTerm) return entities;
  
  const term = searchTerm.toLowerCase();
  
  return entities.filter(entity => {
    // Si no se especifican campos, buscar en todos los valores
    if (searchFields.length === 0) {
      return Object.values(entity).some(value => 
        String(value).toLowerCase().includes(term)
      );
    }
    
    // Buscar solo en los campos especificados
    return searchFields.some(field => {
      const value = entity[field];
      return value && String(value).toLowerCase().includes(term);
    });
  });
};

/**
 * Ordena una lista de entidades
 */
export const sortEntities = (entities, sortField, sortDirection = 'asc') => {
  if (!sortField) return entities;
  
  return [...entities].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Manejar valores nulos/undefined
    if (aValue == null) aValue = '';
    if (bValue == null) bValue = '';
    
    // Convertir a string para comparación
    aValue = String(aValue).toLowerCase();
    bValue = String(bValue).toLowerCase();
    
    if (sortDirection === 'asc') {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });
};

/**
 * Pagina una lista de entidades
 */
export const paginateEntities = (entities, page = 1, pageSize = 10) => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    data: entities.slice(startIndex, endIndex),
    totalItems: entities.length,
    totalPages: Math.ceil(entities.length / pageSize),
    currentPage: page,
    pageSize
  };
};
