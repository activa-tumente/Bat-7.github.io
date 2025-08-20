import React from 'react';
import { FaUniversity, FaBuilding, FaHospital, FaSchool } from 'react-icons/fa';
import enhancedSupabaseService from '../../../services/enhancedSupabaseService';
import { getInstitutionIcon, renderChip } from '../common/entityUtils';

/**
 * Configuración para el componente de instituciones
 */

// Configuración de columnas para la tabla
export const getColumns = () => [
  {
    field: 'nombre',
    header: 'Nombre',
    sortable: true,
    highlight: true,
    render: (value, row) => {
      // Mostrar icono según el tipo de institución
      const icon = getInstitutionIcon(value, row.tipo, { FaUniversity, FaBuilding, FaHospital, FaSchool });

      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{
            color: '#1e40af',
            marginRight: '0.5rem',
            fontSize: '1.2rem'
          }}>
            {icon}
          </span>
          <span>{value}</span>
        </div>
      );
    }
  },
  {
    field: 'tipo',
    header: 'Tipo',
    sortable: true,
    emptyValue: '-',
    render: (value) => renderChip(value, '#e6f0ff')
  },
  {
    field: 'direccion',
    header: 'Dirección',
    sortable: true,
    emptyValue: '-',
    render: (value) => renderChip(value, '#e6f0ff')
  },
  {
    field: 'telefono',
    header: 'Teléfono',
    sortable: true,
    emptyValue: '-',
    render: (value) => renderChip(value, '#e6f0ff')
  }
];

// Configuración de campos para el formulario
export const getFormFields = () => [
  {
    id: 'section_datos',
    type: 'section',
    label: 'Datos de la Institución',
    width: 'full'
  },
  {
    id: 'nombre',
    type: 'text',
    label: 'Nombre',
    placeholder: 'Ej. Universidad Nacional',
    width: 'full',
    validation: {
      required: false
    }
  },
  {
    id: 'tipo',
    type: 'select',
    label: 'Tipo de Institución',
    placeholder: 'Seleccione un tipo',
    width: 'full',
    options: [
      { value: 'Universidad', label: 'Universidad' },
      { value: 'Colegio', label: 'Colegio' },
      { value: 'Hospital', label: 'Hospital/Clínica' },
      { value: 'Centro Comunitario', label: 'Centro Comunitario' },
      { value: 'Otra', label: 'Otra' }
    ],
    validation: {
      required: false
    }
  },
  {
    id: 'section_contacto',
    type: 'section',
    label: 'Información de Contacto',
    width: 'full'
  },
  {
    id: 'direccion',
    type: 'text',
    label: 'Dirección',
    placeholder: 'Ej. Calle 45 #12-34',
    width: 'half',
    info: 'Dirección física de la institución',
    validation: {
      required: false
    }
  },
  {
    id: 'telefono',
    type: 'tel',
    label: 'Teléfono',
    placeholder: 'Ej. 601 234 5678',
    width: 'half',
    validation: {
      required: false
    }
  }
];

// Configuración de filtros
export const getFilters = () => [
  {
    id: 'tipo',
    type: 'select',
    label: 'Tipo de Institución',
    placeholder: 'Todos los tipos',
    options: [
      { value: '', label: 'Todos los tipos' },
      { value: 'Universidad', label: 'Universidad' },
      { value: 'Colegio', label: 'Colegio' },
      { value: 'Hospital', label: 'Hospital/Clínica' },
      { value: 'Centro Comunitario', label: 'Centro Comunitario' },
      { value: 'Otra', label: 'Otra' }
    ]
  }
];

// Valores iniciales del formulario
export const getInitialFormValues = () => ({
  nombre: '',
  direccion: '',
  telefono: '',
  tipo: 'Universidad'
});

// Obtener valores del formulario para una institución existente
export const getFormValues = (institution) => ({
  nombre: institution.nombre || '',
  tipo: institution.tipo || 'Universidad',
  direccion: institution.direccion || '',
  telefono: institution.telefono || ''
});

// Función para filtrar instituciones
export const filterInstitutions = (institutions, searchTerm, filterValues) => {
  return institutions.filter(institution => {
    // Filtro por término de búsqueda
    const matchesSearch = !searchTerm ? true :
      institution.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (institution.direccion && institution.direccion.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (institution.telefono && institution.telefono.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filtro por tipo de institución
    const matchesTipo =
      !filterValues.tipo ||
      (institution.tipo && institution.tipo === filterValues.tipo);

    return matchesSearch && matchesTipo;
  });
};

// Funciones de servicio para instituciones
export const institutionServices = {
  fetchEntities: async (sortField, sortDirection) => {
    return await enhancedSupabaseService.getInstitutions(sortField, sortDirection);
  },
  createEntity: async (data) => {
    return await enhancedSupabaseService.createInstitution(data);
  },
  updateEntity: async (id, data) => {
    return await enhancedSupabaseService.updateInstitution(id, data);
  },
  deleteEntity: async (id) => {
    return await enhancedSupabaseService.deleteInstitution(id);
  }
};
