import React from 'react';
import EntityTab from '../common/EntityTab';
import { 
  getColumns, 
  getFormFields, 
  getFilters, 
  getInitialFormValues, 
  getFormValues, 
  filterInstitutions,
  institutionServices
} from './InstitutionsConfig';

/**
 * Componente mejorado para la gestión de instituciones
 * Utiliza el componente genérico EntityTab con la configuración específica
 */
const InstitutionsTab = ({ isAdmin }) => {
  return (
    <EntityTab
      entityName="Institución"
      entityNamePlural="instituciones"
      fetchEntities={institutionServices.fetchEntities}
      createEntity={institutionServices.createEntity}
      updateEntity={institutionServices.updateEntity}
      deleteEntity={institutionServices.deleteEntity}
      columns={getColumns()}
      formFields={getFormFields()}
      filters={getFilters()}
      getInitialFormValues={getInitialFormValues}
      getFormValues={getFormValues}
      filterEntities={filterInstitutions}
      isAdmin={isAdmin}
    />
  );
};

export default InstitutionsTab;