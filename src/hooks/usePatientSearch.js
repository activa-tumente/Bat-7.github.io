import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-toastify';
import supabase from '../api/supabaseClient';

/**
 * Custom hook for patient search and filtering functionality
 */
export const usePatientSearch = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    genero: '',
    nivel_educativo: '',
    edad_min: '',
    edad_max: ''
  });

  // Memoized age calculation
  const calculateAge = useCallback((birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }, []);

  // Memoized filtered patients
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      // Search term filter
      const searchMatch = !searchTerm || (
        patient.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.documento && patient.documento.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      // Advanced filters
      const genderMatch = !filters.genero || patient.genero === filters.genero;
      const educationMatch = !filters.nivel_educativo || patient.nivel_educativo === filters.nivel_educativo;
      
      const age = calculateAge(patient.fecha_nacimiento);
      const ageMinMatch = !filters.edad_min || (age !== null && age >= parseInt(filters.edad_min));
      const ageMaxMatch = !filters.edad_max || (age !== null && age <= parseInt(filters.edad_max));

      return searchMatch && genderMatch && educationMatch && ageMinMatch && ageMaxMatch;
    });
  }, [patients, searchTerm, filters, calculateAge]);

  // Fetch patients
  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pacientes')
        .select(`
          id, nombre, apellido, documento, email, genero,
          fecha_nacimiento, nivel_educativo, ocupacion
        `)
        .order('nombre', { ascending: true });

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error al cargar pacientes:', error.message);
      toast.error('Error al cargar la lista de pacientes');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle patient selection
  const handleSelectPatient = useCallback((patient) => {
    setSelectedPatient(patient);
    setSearchTerm(`${patient.nombre} ${patient.apellido}`);
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  }, []);

  // Clear all filters and selection
  const handleClearFilters = useCallback(() => {
    setFilters({
      genero: '',
      nivel_educativo: '',
      edad_min: '',
      edad_max: ''
    });
    setSearchTerm('');
    setSelectedPatient(null);
  }, []);

  // Load patients on mount
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  return {
    // State
    patients,
    selectedPatient,
    searchTerm,
    loading,
    showFilters,
    filters,
    filteredPatients,
    
    // Actions
    setSearchTerm,
    setShowFilters,
    handleSelectPatient,
    handleFilterChange,
    handleClearFilters,
    fetchPatients,
    calculateAge
  };
};