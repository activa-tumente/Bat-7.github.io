import { useState, useEffect, useCallback } from 'react';
import { supabaseService } from '../services/supabaseService';

/**
 * Custom hook para gestionar el estado y operaciones de pacientes
 * Implementa mejores prácticas de React y separación de responsabilidades
 */
export const usePatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Función memoizada para cargar pacientes
  const loadPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await supabaseService.getPatients();
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      setPatients(result.data || []);
    } catch (err) {
      setError({
        message: 'Error al cargar pacientes',
        details: err.message,
        timestamp: new Date().toISOString()
      });
      console.error('Error loading patients:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función memoizada para crear paciente
  const createPatient = useCallback(async (patientData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Validación básica
      if (!patientData.nombre || !patientData.apellido) {
        throw new Error('Nombre y apellido son requeridos');
      }
      
      const result = await supabaseService.createPatient(patientData);
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      // Optimistic update
      setPatients(prev => [...prev, result.data[0]]);
      
      return { success: true, data: result.data[0] };
    } catch (err) {
      setError({
        message: 'Error al crear paciente',
        details: err.message,
        timestamp: new Date().toISOString()
      });
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Función memoizada para actualizar paciente
  const updatePatient = useCallback(async (id, patientData) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await supabaseService.updatePatient(id, patientData);
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      // Optimistic update
      setPatients(prev => 
        prev.map(patient => 
          patient.id === id ? { ...patient, ...result.data[0] } : patient
        )
      );
      
      return { success: true, data: result.data[0] };
    } catch (err) {
      setError({
        message: 'Error al actualizar paciente',
        details: err.message,
        timestamp: new Date().toISOString()
      });
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Función memoizada para eliminar paciente
  const deletePatient = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await supabaseService.deletePatient(id);
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      // Optimistic update
      setPatients(prev => prev.filter(patient => patient.id !== id));
      
      return { success: true };
    } catch (err) {
      setError({
        message: 'Error al eliminar paciente',
        details: err.message,
        timestamp: new Date().toISOString()
      });
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para limpiar errores
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Pacientes filtrados por término de búsqueda
  const filteredPatients = patients.filter(patient => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.nombre?.toLowerCase().includes(searchLower) ||
      patient.apellido?.toLowerCase().includes(searchLower) ||
      patient.documento?.toLowerCase().includes(searchLower) ||
      patient.email?.toLowerCase().includes(searchLower)
    );
  });

  // Cargar pacientes al montar el componente
  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  return {
    // Estado
    patients: filteredPatients,
    loading,
    error,
    searchTerm,
    
    // Acciones
    setSearchTerm,
    loadPatients,
    createPatient,
    updatePatient,
    deletePatient,
    clearError
  };
};