/**
 * Utilidades compartidas para los componentes de entidades
 */

// Calcular edad a partir de la fecha de nacimiento
export const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  try {
    const today = new Date();
    const birth = new Date(birthDate);

    // Validación básica de fecha
    if (isNaN(birth.getTime())) {
      console.warn(`Fecha de nacimiento inválida: ${birthDate}`);
      return null;
    }

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age >= 0 ? age : null; // Asegurarse de que la edad no sea negativa
  } catch (e) {
    console.error(`Error calculando edad para ${birthDate}:`, e);
    return null;
  }
};

// Función para determinar el icono de género con colores consistentes
export const getGenderIcon = (gender, icons) => {
  const { FaMale, FaFemale, FaUser } = icons;
  
  // Normaliza el valor de género (quita espacios, convierte a minúsculas)
  const genderNormalized = gender?.trim().toLowerCase();

  // Compara con los valores normalizados
  if (genderNormalized === 'masculino') {
    return <FaMale style={{ color: '#1e40af', marginRight: '0.5rem', fontSize: '1.2rem' }} />; // Azul
  } else if (genderNormalized === 'femenino') {
    return <FaFemale style={{ color: '#db2777', marginRight: '0.5rem', fontSize: '1.2rem' }} />; // Rosa
  } else {
    return <FaUser style={{ color: '#6b7280', marginRight: '0.5rem', fontSize: '1.2rem' }} />; // Gris por defecto
  }
};

// Función para determinar el icono según el tipo de institución
export const getInstitutionIcon = (nombre, tipo = '', icons) => {
  const { FaUniversity, FaBuilding, FaHospital, FaSchool } = icons;
  
  // Si existe un tipo explícito, usarlo primero
  if (tipo) {
    if (tipo.toLowerCase().includes('universidad')) return <FaUniversity style={{ color: '#1e40af', marginRight: '0.5rem', fontSize: '1.2rem' }} />;
    if (tipo.toLowerCase().includes('hospital') || tipo.toLowerCase().includes('clínica')) return <FaHospital style={{ color: '#1e40af', marginRight: '0.5rem', fontSize: '1.2rem' }} />;
    if (tipo.toLowerCase().includes('colegio') || tipo.toLowerCase().includes('escuela')) return <FaSchool style={{ color: '#1e40af', marginRight: '0.5rem', fontSize: '1.2rem' }} />;
    return <FaBuilding style={{ color: '#1e40af', marginRight: '0.5rem', fontSize: '1.2rem' }} />;
  }

  // De lo contrario, intentar inferir del nombre
  const nombreLower = nombre.toLowerCase();
  if (nombreLower.includes('universidad') || nombreLower.includes('faculty')) return <FaUniversity style={{ color: '#1e40af', marginRight: '0.5rem', fontSize: '1.2rem' }} />;
  if (nombreLower.includes('hospital') || nombreLower.includes('clínica') || nombreLower.includes('salud')) return <FaHospital style={{ color: '#1e40af', marginRight: '0.5rem', fontSize: '1.2rem' }} />;
  if (nombreLower.includes('colegio') || nombreLower.includes('escuela') || nombreLower.includes('school')) return <FaSchool style={{ color: '#1e40af', marginRight: '0.5rem', fontSize: '1.2rem' }} />;

  // Valor por defecto
  return <FaBuilding style={{ color: '#1e40af', marginRight: '0.5rem', fontSize: '1.2rem' }} />;
};

// Renderizado para chips de visualización (etiquetas con fondo coloreado)
export const renderChip = (value, color = '#e6f0ff') => {
  if (!value) return '-';
  
  return (
    <div style={{
      backgroundColor: color,
      padding: '2px 8px',
      borderRadius: '4px',
      display: 'inline-block',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: '150px'
    }}>
      {value}
    </div>
  );
};

// Renderizado para indicador de género
export const renderGenderChip = (gender) => {
  // Muestra M o F con fondo de color según el género
  const displayValue = gender === 'Masculino' ? 'M' : (gender === 'Femenino' ? 'F' : gender);
  let bgColor = '#e5e7eb'; // Gris claro por defecto
  
  const genderLower = gender?.toLowerCase();
  if (genderLower === 'masculino') {
    bgColor = '#dbeafe'; // Azul claro
  } else if (genderLower === 'femenino') {
    bgColor = '#fce7f3'; // Rosa claro
  }

  return (
    <div style={{
      backgroundColor: bgColor,
      padding: '2px 8px',
      borderRadius: '4px',
      display: 'inline-block',
      minWidth: '30px',
      textAlign: 'center',
      fontWeight: 500
    }}>
      {displayValue || '-'}
    </div>
  );
};
