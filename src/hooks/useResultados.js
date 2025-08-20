/**
 * Custom hook para manejar la lógica de resultados de tests
 * Separa la lógica de negocio del componente UI
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import supabase from '../api/supabaseClient';
import { toast } from 'react-hot-toast';

export const useResultados = (searchTerm = '', selectedTest = 'todos') => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pacientes, setPacientes] = useState([]);
  const [resultados, setResultados] = useState([]);

  // Memoizar Map de pacientes para búsquedas O(1)
  const pacientesMap = useMemo(() => {
    return new Map(pacientes.map(p => [p.id, p]));
  }, [pacientes]);

  // Función para cargar datos con manejo de errores mejorado
  const cargarDatos = useCallback(async (retry = false) => {
    setLoading(true);
    setError(null);
    
    try {
      // Cargar resultados con información de aptitudes
      const { data: resultadosData, error: resultadosError } = await supabase
        .from('resultados')
        .select(`
          *,
          aptitudes (
            codigo,
            nombre
          )
        `)
        .order('created_at', { ascending: false });

      if (resultadosError) throw resultadosError;

      // Cargar pacientes
      const { data: pacientesData, error: pacientesError } = await supabase
        .from('pacientes')
        .select('*');

      if (pacientesError) throw pacientesError;

      setResultados(resultadosData || []);
      setPacientes(pacientesData || []);
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      setError({
        message: 'Error al cargar los datos',
        details: error.message,
        canRetry: true
      });
      
      if (!retry) {
        toast.error('Error al cargar los datos. Reintentando...');
        setTimeout(() => cargarDatos(true), 2000);
      } else {
        toast.error('Error persistente al cargar los datos');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para filtrar resultados usando parámetros recibidos
  const filteredResultados = useMemo(() => {
    let filtered = resultados;

    // Filtrar por término de búsqueda usando el parámetro searchTerm
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(resultado => {
        const paciente = pacientesMap.get(resultado.paciente_id);
        if (!paciente) return false;
        
        const nombreCompleto = `${paciente.nombre} ${paciente.apellido}`.toLowerCase();
        const documento = paciente.documento?.toLowerCase() || '';
        
        return nombreCompleto.includes(searchLower) || documento.includes(searchLower);
      });
    }

    // Filtrar por tipo de test usando el parámetro selectedTest
    if (selectedTest !== 'todos') {
      filtered = filtered.filter(resultado => resultado.tipo_test === selectedTest);
    }

    return filtered;
  }, [resultados, searchTerm, selectedTest, pacientesMap]);

  // Funciones helper memoizadas
  const obtenerNombrePaciente = useCallback((pacienteId) => {
    const paciente = pacientesMap.get(pacienteId);
    return paciente ? `${paciente.nombre} ${paciente.apellido}` : 'Paciente no encontrado';
  }, [pacientesMap]);

  const obtenerDocumentoPaciente = useCallback((pacienteId) => {
    const paciente = pacientesMap.get(pacienteId);
    return paciente ? paciente.documento : 'N/A';
  }, [pacientesMap]);

  // Estadísticas memoizadas
  const estadisticas = useMemo(() => {
    const totalResultados = filteredResultados.length;
    const pacientesUnicos = new Set(filteredResultados.map(r => r.paciente_id)).size;
    const testsDisponibles = selectedTest === 'todos' 
      ? new Set(resultados.map(r => r.tipo_test)).size 
      : 1;
    const promedioPD = totalResultados > 0 
      ? Math.round(filteredResultados.reduce((sum, r) => sum + (r.puntaje_directo || 0), 0) / totalResultados)
      : 0;
      
    return { totalResultados, pacientesUnicos, testsDisponibles, promedioPD };
  }, [filteredResultados, selectedTest, resultados]);

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  return {
    // Estados
    loading,
    error,
    
    // Datos
    resultados,
    pacientes,
    filteredResultados,
    estadisticas,
    pacientesMap,
    
    // Funciones
    cargarDatos,
    obtenerNombrePaciente,
    obtenerDocumentoPaciente
  };
};

export default useResultados;