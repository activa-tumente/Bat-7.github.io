import { useState, useEffect } from 'react';
import EntityTab from '../common/EntityTab';
import {
  getColumns,
  getFormFields,
  getFilters,
  getInitialFormValues,
  getFormValues,
  filterEntities,
  services
} from './CandidatesConfig';
import useRelatedData from '../../../hooks/useRelatedData';
import LoadingFallback from '../../ui/LoadingFallback';

/**
 * Componente para la gestión de Candidatos usando la nueva arquitectura
 * Migrado del modelo "pacientes" al modelo "candidatos" del esquema robusto
 */
const CandidatesTab = ({ isAdmin }) => {
  // Cargar datos relacionados (instituciones, psicólogos)
  const { data: institutions, loading: loadingInstitutions } = useRelatedData('getInstitutions');
  const { data: psychologists, loading: loadingPsychologists } = useRelatedData('getPsychologists');

  const isLoading = loadingInstitutions || loadingPsychologists;

  // Mostrar loading mientras se cargan los datos de configuración
  if (isLoading) {
    return <LoadingFallback message="Cargando datos de configuración..." />;
  }

  // Configurar el EntityTab con los datos cargados
  return (
    <EntityTab
      entityName="Candidato"
      entityNamePlural="Candidatos"
      fetchEntities={services.get}
      createEntity={services.create}
      updateEntity={services.update}
      deleteEntity={services.delete}
      columns={getColumns(institutions, psychologists)}
      formFields={getFormFields(institutions, psychologists)}
      filters={getFilters(institutions, psychologists)}
      getInitialFormValues={() => getInitialFormValues(institutions)}
      getFormValues={getFormValues}
      filterEntities={filterEntities}
      isAdmin={isAdmin}
    />
  );
};

export default CandidatesTab;
