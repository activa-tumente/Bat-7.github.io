import { useState, useEffect, useCallback } from 'react';

/**
 * Hook personalizado para gestionar un temporizador.
 * @param {number} initialTime - Tiempo inicial en segundos
 * @returns {Object} Objeto con el estado y funciones del temporizador
 */
export const useTimer = (initialTime) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);

  // Iniciar el temporizador
  const startTimer = useCallback(() => {
    setIsRunning(true);
  }, []);

  // Detener el temporizador
  const stopTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  // Reiniciar el temporizador
  const resetTimer = useCallback(() => {
    setTimeRemaining(initialTime);
    setIsRunning(false);
  }, [initialTime]);

  // Formatear el tiempo en minutos y segundos (mm:ss)
  const formatTime = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }, []);

  // Efecto para decrementar el tiempo
  useEffect(() => {
    let timerId;

    if (isRunning && timeRemaining > 0) {
      timerId = setInterval(() => {
        setTimeRemaining(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsRunning(false);
    }

    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [isRunning, timeRemaining]);

  return {
    timeRemaining,
    isRunning,
    startTimer,
    stopTimer,
    resetTimer,
    formatTime
  };
};
