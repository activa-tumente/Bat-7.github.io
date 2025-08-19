import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import './TestCard.css';

// Componente de tarjeta para los tests individuales
const TestCard = ({
  test,
  iconClass,
  bgClass,
  textClass,
  buttonColor,
  abbreviation,
  showButton = true,
  disabled = false,
  patientId = null,
  level = 'E',
  isCompleted = false,
  onRepeatTest = null
}) => {
  // Colores de los botones basados en los nombres de color
  const buttonColors = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    red: 'bg-red-600 hover:bg-red-700',
    amber: 'bg-amber-600 hover:bg-amber-700',
    indigo: 'bg-indigo-600 hover:bg-indigo-700',
    gray: 'bg-gray-700 hover:bg-gray-800',
    slate: 'bg-slate-600 hover:bg-slate-700',
    teal: 'bg-teal-600 hover:bg-teal-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    pink: 'bg-pink-600 hover:bg-pink-700'
  };

  // Color del círculo con la abreviatura
  const circleColors = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    amber: 'bg-amber-600',
    indigo: 'bg-indigo-600',
    gray: 'bg-gray-700',
    slate: 'bg-slate-600',
    teal: 'bg-teal-600',
    purple: 'bg-purple-600',
    pink: 'bg-pink-600'
  };

  return (
    <div className="test-card-container">
      <div className={`test-card ${isCompleted ? 'test-card-completed' : 'test-card-pending'}`}>
        {/* Círculo con abreviatura - siempre visible */}
        {abbreviation && (
          <div className={`abbreviation-circle ${circleColors[buttonColor]}`}>
            {abbreviation}
          </div>
        )}

        {/* Icono de check para tests completados */}
        {isCompleted && (
          <div className="completion-check">
            <i className="fas fa-check-circle"></i>
          </div>
        )}

        {/* Badge de estado - posicionado arriba a la izquierda */}
        <div className="test-card-status-badge">
          <span className={`status-badge ${isCompleted ? 'status-badge-completed' : 'status-badge-pending'}`}>
            <i className={`fas ${isCompleted ? 'fa-check' : 'fa-clock'} mr-1`}></i>
            {isCompleted ? 'Completado' : 'Pendiente'}
          </span>
        </div>

        {/* Badge de nivel - posicionado debajo del estado */}
        <div className="test-card-level-badge">
          <span className={`level-badge ${
            level === 'E' ? 'level-badge-green' :
            level === 'M' ? 'level-badge-blue' :
            level === 'S' ? 'level-badge-purple' :
            'level-badge-gray'
          }`}>
            📗 Nivel {level}
          </span>
        </div>

        <div className="test-card-header">
          <div className={`test-card-icon ${bgClass}`}>
            <i className={`${iconClass} ${textClass}`}></i>
          </div>
          <h3 className="test-card-title">{test.title}</h3>
        </div>

        <div className="test-card-description">
          <p>{test.description}</p>
        </div>

        <div className="test-card-info-container">
          <div className="test-card-info">
            <span className="info-label">Tiempo</span>
            <span className="info-value">{test.time}</span>
            <span className="info-unit">minutos</span>
          </div>
          <div className="test-card-info">
            <span className="info-label">Preguntas</span>
            <span className="info-value">{test.questions}</span>
          </div>
        </div>

        {/* Botón adaptativo */}
        <div className="test-card-button-container">
          {disabled ? (
            <button
              disabled
              className="test-card-button bg-gray-400 cursor-not-allowed opacity-50"
            >
              <i className="fas fa-lock mr-2"></i>
              Selecciona Paciente
            </button>
          ) : isCompleted ? (
            <button
              onClick={onRepeatTest}
              className="test-card-button bg-orange-600 hover:bg-orange-700"
            >
              <i className="fas fa-redo mr-2"></i>
              Repetir Test
            </button>
          ) : (
            <Link
              to={test.path || `/test/instructions/${test.id}`}
              state={{ patientId }}
              className={`test-card-button ${buttonColors[buttonColor]}`}
            >
              <i className="fas fa-play-circle mr-2"></i>
              Iniciar Test
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

TestCard.propTypes = {
  test: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    time: PropTypes.number.isRequired,
    questions: PropTypes.number.isRequired,
    path: PropTypes.string
  }).isRequired,
  iconClass: PropTypes.string.isRequired,
  bgClass: PropTypes.string.isRequired,
  textClass: PropTypes.string.isRequired,
  buttonColor: PropTypes.string.isRequired,
  abbreviation: PropTypes.string,
  showButton: PropTypes.bool,
  disabled: PropTypes.bool,
  patientId: PropTypes.string,
  level: PropTypes.string,
  isCompleted: PropTypes.bool,
  onRepeatTest: PropTypes.func
};

export default TestCard;