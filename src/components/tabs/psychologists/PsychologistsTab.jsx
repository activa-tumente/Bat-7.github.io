import React, { useState, useEffect } from 'react';
import EntityTab from '../common/EntityTab';
import enhancedSupabaseService from '../../../services/enhancedSupabaseService';
import { 
  getColumns, 
  getFormFields, 
  getFilters, 
  getInitialFormValues, 
  getFormValues, 
  filterPsychologists,
  psychologistServices
} from './PsychologistsConfig';

/**
 * Componente mejorado para la gestión de psicólogos
 * Utiliza el componente genérico EntityTab con la configuración específica
 */
const PsychologistsTab = ({ isAdmin }) => {
  // Estados específicos para este componente
  const [institutions, setInstitutions] = useState([]);
  const [currentPsychologist, setCurrentPsychologist] = useState(null);

  // Cargar instituciones
  useEffect(() => {
    const loadInstitutions = async () => {
      try {
        const result = await enhancedSupabaseService.getInstitutions();
        setInstitutions(Array.isArray(result.data) ? result.data : []);
      } catch (error) {
        console.error('Error al cargar instituciones:', error);
      }
    };

    loadInstitutions();
  }, []);

  return (
    <EntityTab
      entityName="Psicólogo"
      entityNamePlural="psicólogos"
      fetchEntities={psychologistServices.fetchEntities}
      createEntity={psychologistServices.createEntity}
      updateEntity={psychologistServices.updateEntity}
      deleteEntity={psychologistServices.deleteEntity}
      columns={getColumns(institutions)}
      formFields={getFormFields(institutions, currentPsychologist)}
      filters={getFilters(institutions)}
      getInitialFormValues={() => getInitialFormValues(institutions)}
      getFormValues={getFormValues}
      filterEntities={(psychologists, searchTerm, filterValues) => 
        filterPsychologists(psychologists, searchTerm, filterValues, institutions)}
      isAdmin={isAdmin}
      // Escuchar eventos del EntityTab para actualizar el estado local
      onBeforeModalOpen={(entity) => setCurrentPsychologist(entity)}
      onAfterModalClose={() => setCurrentPsychologist(null)}
    />
  );
};

export default PsychologistsTab;