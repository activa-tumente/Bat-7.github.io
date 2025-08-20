/**
 * Hook personalizado para gestión de asignaciones de pacientes
 */

import { useState, useEffect, useCallback } from 'react';
import patientAssignmentService from '../services/patientAssignmentService';
import { toast } from 'react-toastify';

export const usePatientAssignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [availableCandidates, setAvailableCandidates] = useState([]);
  const [availablePsychologists, setAvailablePsychologists] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Obtiene todas las asignaciones
   */
  const fetchAssignments = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await patientAssignmentService.getPatientAssignments(filters);
      
      if (error) {
        throw error;
      }

      setAssignments(data || []);
    } catch (err) {
      setError(err);
      console.error('Error al cargar asignaciones:', err);
      toast.error('Error al cargar asignaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtiene candidatos disponibles
   */
  const fetchAvailableCandidates = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await patientAssignmentService.getAvailableCandidates(filters);
      
      if (error) {
        throw error;
      }

      setAvailableCandidates(data || []);
    } catch (err) {
      setError(err);
      console.error('Error al cargar candidatos:', err);
      toast.error('Error al cargar candidatos');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtiene psicólogos disponibles
   */
  const fetchAvailablePsychologists = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await patientAssignmentService.getAvailablePsychologists(filters);
      
      if (error) {
        throw error;
      }

      setAvailablePsychologists(data || []);
    } catch (err) {
      setError(err);
      console.error('Error al cargar psicólogos:', err);
      toast.error('Error al cargar psicólogos');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtiene estadísticas de asignaciones
   */
  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await patientAssignmentService.getAssignmentStatistics();
      
      if (error) {
        throw error;
      }

      setStatistics(data);
    } catch (err) {
      setError(err);
      console.error('Error al cargar estadísticas:', err);
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtiene asignaciones de un psicólogo específico
   */
  const getPsychologistAssignments = useCallback(async (psicologoId) => {
    try {
      const { data, error } = await patientAssignmentService.getPsychologistAssignments(psicologoId);
      
      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (err) {
      console.error('Error al obtener asignaciones del psicólogo:', err);
      return { success: false, error: err };
    }
  }, []);

  /**
   * Asigna un paciente a un psicólogo
   */
  const assignPatient = useCallback(async (candidatoId, psicologoId, assignedBy, notes = '') => {
    setLoading(true);
    
    try {
      const { data, error } = await patientAssignmentService.assignPatientToPsychologist(
        candidatoId, 
        psicologoId, 
        assignedBy, 
        notes
      );
      
      if (error) {
        throw error;
      }

      toast.success('Paciente asignado exitosamente');
      await fetchAssignments();
      await fetchStatistics();
      await fetchAvailableCandidates();
      
      return { success: true, data };
    } catch (err) {
      console.error('Error al asignar paciente:', err);
      toast.error(`Error al asignar paciente: ${err.message}`);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [fetchAssignments, fetchStatistics, fetchAvailableCandidates]);

  /**
   * Desasigna un paciente
   */
  const unassignPatient = useCallback(async (candidatoId, unassignedBy, reason = '') => {
    setLoading(true);
    
    try {
      const { success, error } = await patientAssignmentService.unassignPatient(
        candidatoId, 
        unassignedBy, 
        reason
      );
      
      if (!success) {
        throw error;
      }

      toast.success('Paciente desasignado exitosamente');
      await fetchAssignments();
      await fetchStatistics();
      await fetchAvailableCandidates();
      
      return { success: true };
    } catch (err) {
      console.error('Error al desasignar paciente:', err);
      toast.error(`Error al desasignar paciente: ${err.message}`);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [fetchAssignments, fetchStatistics, fetchAvailableCandidates]);

  /**
   * Transfiere múltiples pacientes
   */
  const transferPatients = useCallback(async (candidateIds, fromPsychologistId, toPsychologistId, transferredBy, reason = '') => {
    setLoading(true);
    
    try {
      const result = await patientAssignmentService.transferPatients(
        candidateIds, 
        fromPsychologistId, 
        toPsychologistId, 
        transferredBy, 
        reason
      );
      
      if (result.error) {
        throw result.error;
      }

      const { successCount, totalCount } = result;
      
      if (successCount === totalCount) {
        toast.success(`${successCount} pacientes transferidos exitosamente`);
      } else {
        toast.warning(`${successCount} de ${totalCount} pacientes transferidos. Revise los detalles.`);
      }
      
      await fetchAssignments();
      await fetchStatistics();
      await fetchAvailableCandidates();
      
      return { success: true, result };
    } catch (err) {
      console.error('Error al transferir pacientes:', err);
      toast.error(`Error al transferir pacientes: ${err.message}`);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [fetchAssignments, fetchStatistics, fetchAvailableCandidates]);

  /**
   * Filtra candidatos sin asignar
   */
  const getUnassignedCandidates = useCallback(() => {
    return availableCandidates.filter(candidate => !candidate.psicologo_id);
  }, [availableCandidates]);

  /**
   * Filtra candidatos asignados
   */
  const getAssignedCandidates = useCallback(() => {
    return availableCandidates.filter(candidate => candidate.psicologo_id);
  }, [availableCandidates]);

  /**
   * Obtiene estadísticas por psicólogo
   */
  const getPsychologistStats = useCallback(() => {
    if (!statistics || !statistics.assignmentsByPsychologist) {
      return [];
    }

    return statistics.assignmentsByPsychologist.map(stat => ({
      ...stat,
      percentage: statistics.totalCandidates > 0 
        ? Math.round((stat.count / statistics.totalCandidates) * 100) 
        : 0
    }));
  }, [statistics]);

  /**
   * Busca candidatos por término
   */
  const searchCandidates = useCallback((searchTerm) => {
    if (!searchTerm) {
      return availableCandidates;
    }

    const term = searchTerm.toLowerCase();
    return availableCandidates.filter(candidate => 
      candidate.nombre?.toLowerCase().includes(term) ||
      candidate.apellidos?.toLowerCase().includes(term) ||
      candidate.documento_identidad?.toLowerCase().includes(term) ||
      candidate.email?.toLowerCase().includes(term)
    );
  }, [availableCandidates]);

  /**
   * Busca psicólogos por término
   */
  const searchPsychologists = useCallback((searchTerm) => {
    if (!searchTerm) {
      return availablePsychologists;
    }

    const term = searchTerm.toLowerCase();
    return availablePsychologists.filter(psychologist => 
      psychologist.nombre?.toLowerCase().includes(term) ||
      psychologist.apellido?.toLowerCase().includes(term) ||
      psychologist.documento?.toLowerCase().includes(term) ||
      psychologist.institucion?.nombre?.toLowerCase().includes(term)
    );
  }, [availablePsychologists]);

  /**
   * Valida si se puede hacer una asignación
   */
  const validateAssignment = useCallback((candidatoId, psicologoId) => {
    const candidate = availableCandidates.find(c => c.id === candidatoId);
    const psychologist = availablePsychologists.find(p => p.id === psicologoId);

    const errors = [];

    if (!candidate) {
      errors.push('Candidato no encontrado');
    } else if (candidate.psicologo_id) {
      errors.push('El candidato ya está asignado a otro psicólogo');
    }

    if (!psychologist) {
      errors.push('Psicólogo no encontrado');
    } else if (!psychologist.activo) {
      errors.push('El psicólogo no está activo');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [availableCandidates, availablePsychologists]);

  // Cargar datos iniciales
  useEffect(() => {
    fetchAssignments();
    fetchAvailableCandidates();
    fetchAvailablePsychologists();
    fetchStatistics();
  }, [fetchAssignments, fetchAvailableCandidates, fetchAvailablePsychologists, fetchStatistics]);

  return {
    // Estado
    assignments,
    availableCandidates,
    availablePsychologists,
    statistics,
    loading,
    error,
    
    // Acciones principales
    fetchAssignments,
    fetchAvailableCandidates,
    fetchAvailablePsychologists,
    fetchStatistics,
    getPsychologistAssignments,
    assignPatient,
    unassignPatient,
    transferPatients,
    
    // Utilidades de filtrado y búsqueda
    getUnassignedCandidates,
    getAssignedCandidates,
    getPsychologistStats,
    searchCandidates,
    searchPsychologists,
    validateAssignment,
    
    // Datos derivados
    unassignedCandidates: getUnassignedCandidates(),
    assignedCandidates: getAssignedCandidates(),
    psychologistStats: getPsychologistStats()
  };
};
