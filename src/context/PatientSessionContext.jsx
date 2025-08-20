import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Crear el contexto
const PatientSessionContext = createContext();

// Hook personalizado para usar el contexto
export const usePatientSession = () => {
  const context = useContext(PatientSessionContext);
  if (!context) {
    throw new Error('usePatientSession must be used within a PatientSessionProvider');
  }
  return context;
};

// Provider del contexto
export const PatientSessionProvider = ({ children }) => {
  // Estado persistente del paciente seleccionado
  const [selectedPatient, setSelectedPatient] = useLocalStorage('bat7_selected_patient', null);
  
  // Estado de la sesión activa
  const [isSessionActive, setIsSessionActive] = useState(false);
  
  // Estado del nivel educativo seleccionado
  const [selectedLevel, setSelectedLevel] = useLocalStorage('bat7_selected_level', 'E');
  
  // Tests completados en la sesión actual
  const [completedTests, setCompletedTests] = useLocalStorage('bat7_completed_tests', []);
  
  // Tiempo de inicio de la sesión
  const [sessionStartTime, setSessionStartTime] = useLocalStorage('bat7_session_start', null);

  // Verificar si hay una sesión activa al cargar
  useEffect(() => {
    if (selectedPatient && sessionStartTime) {
      setIsSessionActive(true);
    }
  }, [selectedPatient, sessionStartTime]);

  // Función para iniciar una nueva sesión con un paciente
  const startPatientSession = (patient, level = 'E') => {
    setSelectedPatient(patient);
    setSelectedLevel(level);
    setIsSessionActive(true);
    setSessionStartTime(new Date().toISOString());
    setCompletedTests([]);
    console.log('🎯 Sesión iniciada para paciente:', patient.nombre, patient.apellido);
  };

  // Función para finalizar la sesión del paciente
  const endPatientSession = () => {
    setSelectedPatient(null);
    setIsSessionActive(false);
    setSessionStartTime(null);
    setCompletedTests([]);
    console.log('🏁 Sesión finalizada');
  };

  // Función para marcar un test como completado
  const markTestCompleted = (testId) => {
    setCompletedTests(prev => {
      if (!prev.includes(testId)) {
        return [...prev, testId];
      }
      return prev;
    });
  };

  // Función para verificar si un test está completado
  const isTestCompleted = (testId) => {
    return completedTests.includes(testId);
  };

  // Función para actualizar el nivel educativo
  const updateSelectedLevel = (level) => {
    setSelectedLevel(level);
  };

  // Función para obtener información de la sesión
  const getSessionInfo = () => {
    if (!isSessionActive || !selectedPatient) {
      return null;
    }

    return {
      patient: selectedPatient,
      level: selectedLevel,
      startTime: sessionStartTime,
      completedTests: completedTests,
      duration: sessionStartTime ? 
        Math.floor((new Date() - new Date(sessionStartTime)) / 1000 / 60) : 0 // en minutos
    };
  };

  // Función para limpiar datos de sesión (útil para desarrollo/debug)
  const clearSessionData = () => {
    setSelectedPatient(null);
    setIsSessionActive(false);
    setSessionStartTime(null);
    setCompletedTests([]);
    setSelectedLevel('E');
  };

  const value = {
    // Estado
    selectedPatient,
    isSessionActive,
    selectedLevel,
    completedTests,
    sessionStartTime,
    
    // Acciones
    startPatientSession,
    endPatientSession,
    markTestCompleted,
    isTestCompleted,
    updateSelectedLevel,
    getSessionInfo,
    clearSessionData,
    
    // Información derivada
    hasActiveSession: isSessionActive && selectedPatient,
    sessionDuration: sessionStartTime ? 
      Math.floor((new Date() - new Date(sessionStartTime)) / 1000 / 60) : 0
  };

  return (
    <PatientSessionContext.Provider value={value}>
      {children}
    </PatientSessionContext.Provider>
  );
};

export default PatientSessionContext;
