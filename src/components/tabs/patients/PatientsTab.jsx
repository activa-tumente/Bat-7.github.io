import React, { useState, useEffect } from 'react';
import EntityTab from '../common/EntityTab';
import enhancedSupabaseService from '../../../services/enhancedSupabaseService';
import { 
  getColumns, 
  getFormFields, 
  getFilters, 
  getInitialFormValues, 
  getFormValues, 
  filterPatients,
  patientServices
} from './PatientsConfig';

/**
 * Componente mejorado para la gestión de pacientes
 * Utiliza el componente genérico EntityTab con la configuración específica
 */
const PatientsTab = ({ isAdmin }) => {
  // Estados específicos para este componente
  const [institutions, setInstitutions] = useState([]);
  const [psychologists, setPsychologists] = useState([]);

  // Cargar datos relacionados (instituciones y psicólogos)
  useEffect(() => {
    const loadRelatedData = async () => {
      try {
        const [institutionsResult, psychologistsResult] = await Promise.all([
          enhancedSupabaseService.getInstitutions(),
          enhancedSupabaseService.getPsychologists()
        ]);

        setInstitutions(Array.isArray(institutionsResult.data) ? institutionsResult.data : []);
        setPsychologists(Array.isArray(psychologistsResult.data) ? psychologistsResult.data : []);
      } catch (error) {
        console.error('Error al cargar datos relacionados:', error);
      }
    };

    loadRelatedData();
  }, []);

  return (
    <EntityTab
      entityName="Paciente"
      entityNamePlural="pacientes"
      fetchEntities={patientServices.fetchEntities}
      createEntity={patientServices.createEntity}
      updateEntity={patientServices.updateEntity}
      deleteEntity={patientServices.deleteEntity}
      columns={getColumns(institutions, psychologists)}
      formFields={getFormFields(institutions, psychologists)}
      filters={getFilters(institutions, psychologists)}
      getInitialFormValues={() => getInitialFormValues(institutions)}
      getFormValues={getFormValues}
      filterEntities={(patients, searchTerm, filterValues) => 
        filterPatients(patients, searchTerm, filterValues)}
      isAdmin={isAdmin}
    />
  );
};

export default PatientsTab;