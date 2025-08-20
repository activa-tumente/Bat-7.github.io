import React from 'react';
import PropTypes from 'prop-types';
import { FaMale, FaFemale, FaUser } from 'react-icons/fa';
import './PatientCard.css';

/**
 * Componente de tarjeta para mostrar información de un paciente
 * @param {Object} patient - Datos del paciente
 */
const PatientCard = ({ patient }) => {
  // Función para obtener las iniciales del nombre
  const getInitials = (name, lastName) => {
    if (!name) return '';

    const firstInitial = name.charAt(0).toUpperCase();
    const secondInitial = lastName ? lastName.charAt(0).toUpperCase() : '';

    return secondInitial ? `${firstInitial}${secondInitial}` : firstInitial;
  };

  // Función para calcular edad a partir de la fecha de nacimiento
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;

    const today = new Date();
    const birth = new Date(birthDate);

    // Validación básica de fecha
    if (isNaN(birth.getTime())) {
      return null;
    }

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age >= 0 ? age : null;
  };

  // Obtener el icono según el género
  const getGenderIcon = () => {
    const gender = patient.genero ? patient.genero.toLowerCase() : '';

    if (gender === 'masculino') {
      return <FaMale className="text-blue-600" />;
    } else if (gender === 'femenino') {
      return <FaFemale className="text-pink-600" />;
    } else {
      return <FaUser className="text-gray-600" />;
    }
  };

  // Obtener el color de fondo del avatar según el género
  const getAvatarBgColor = () => {
    const gender = patient.genero ? patient.genero.toLowerCase() : '';

    if (gender === 'masculino') {
      return 'bg-blue-500';
    } else if (gender === 'femenino') {
      return 'bg-pink-500';
    } else {
      return 'bg-gray-500';
    }
  };

  // Obtener el nombre completo del paciente
  const getFullName = () => {
    const nombre = patient.nombre || '';
    const apellido = patient.apellido || patient.apellidos || '';

    return `${nombre} ${apellido}`.trim();
  };

  // Obtener el nivel educativo formateado
  const getEducationLevel = () => {
    if (patient.nivel_educativo) {
      return patient.nivel_educativo;
    } else {
      // Si no hay nivel educativo, intentar usar otros campos
      return patient.grado || '4° Medio';
    }
  };

  // Calcular la edad del paciente
  const edad = patient.edad || calculateAge(patient.fecha_nacimiento);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden patient-card">
      <div className="p-4">
        {/* Avatar y nombre */}
        <div className="flex items-center mb-4">
          <div className={`patient-avatar ${
            patient.genero?.toLowerCase() === 'masculino' ? 'patient-avatar-male' :
            patient.genero?.toLowerCase() === 'femenino' ? 'patient-avatar-female' :
            'patient-avatar-other'
          }`}>
            {getInitials(patient.nombre, patient.apellido || patient.apellidos)}
          </div>
          <div className="ml-3">
            <h3 className="patient-name">{getFullName()}</h3>
            <p className="patient-education">{getEducationLevel()}</p>
          </div>
        </div>

        {/* Información del paciente */}
        <div className="patient-info-grid">
          <div>
            <span className="patient-info-label">Edad:</span> {edad ? `${edad} años` : 'No disponible'}
          </div>
          <div className="flex items-center">
            <span className="patient-info-label">Sexo:</span>
            <span className="flex items-center">
              {getGenderIcon()}
              <span className="ml-1">{patient.genero || 'No especificado'}</span>
            </span>
          </div>
        </div>

        {/* Psicólogo asignado */}
        <div className="patient-psychologist">
          {patient.psicologo_id ? (
            <span>Psicólogo: {patient.psicologo?.nombre || 'Asignado'}</span>
          ) : (
            <span>Sin psicólogo asignado</span>
          )}
        </div>
      </div>
    </div>
  );
};

PatientCard.propTypes = {
  patient: PropTypes.shape({
    id: PropTypes.string,
    nombre: PropTypes.string.isRequired,
    apellido: PropTypes.string,
    apellidos: PropTypes.string,
    fecha_nacimiento: PropTypes.string,
    genero: PropTypes.string,
    edad: PropTypes.number,
    nivel_educativo: PropTypes.string,
    grado: PropTypes.string,
    psicologo_id: PropTypes.string,
    psicologo: PropTypes.object
  }).isRequired
};

export default PatientCard;
