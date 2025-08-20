import React from 'react';
import { FaMale, FaFemale, FaUser } from 'react-icons/fa';
import enhancedSupabaseService from '../../../services/enhancedSupabaseService';
import { getGenderIcon, renderChip, renderGenderChip } from '../common/entityUtils';

/**
 * Configuración para el componente de psicólogos
 */

// Configuración de columnas para la tabla
export const getColumns = (institutions) => [
  {
    field: 'nombre',
    header: 'Nombre',
    sortable: true,
    highlight: true,
    render: (value, row) => {
      // Obtener icono de género
      const icon = getGenderIcon(row.genero, { FaMale, FaFemale, FaUser });

      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {icon}
          <span>{value}</span>
        </div>
      );
    }
  },
  {
    field: 'apellidos',
    header: 'Apellidos',
    sortable: true,
  },
  {
    field: 'genero',
    header: 'Género',
    sortable: true,
    emptyValue: '-',
    render: (value) => renderGenderChip(value)
  },
  {
    field: 'email',
    header: 'Email',
    sortable: true,
    emptyValue: '-',
  },
  {
    field: 'documento_identidad',
    header: 'Documento',
    sortable: true,
    emptyValue: '-',
    render: (value) => value || '-'
  },
  {
    field: 'telefono',
    header: 'Teléfono',
    sortable: true,
    emptyValue: '-',
  },
  {
    field: 'institucion',
    header: 'Institución',
    sortable: false,
    render: (_, row) => {
      const institucion = row.instituciones?.nombre ||
        institutions.find(inst => inst.id === row.institucion_id)?.nombre || '-';

      return institucion !== '-' ? renderChip(institucion, '#e0e7ff') : '-';
    }
  }
];

// Configuración de campos para el formulario
export const getFormFields = (institutions, currentPsychologist) => [
  // --- Datos Personales ---
  { id: 'section_datos_personales', type: 'section', label: 'Datos Personales', width: 'full' },
  {
    id: 'nombre', type: 'text', label: 'Nombre', placeholder: 'Ej. Ana', width: 'half',
    validation: { required: false }
  },
  {
    id: 'apellidos', type: 'text', label: 'Apellidos', placeholder: 'Ej. García López', width: 'half',
    validation: { required: false }
  },
  {
    id: 'genero', type: 'select', label: 'Género', placeholder: 'Seleccionar...', width: 'half',
    options: [ { value: '', label: 'Seleccionar...' }, { value: 'Masculino', label: 'Masculino' }, { value: 'Femenino', label: 'Femenino' } ],
    validation: { required: false }
  },
  {
    id: 'documento_identidad', type: 'text', label: 'Documento ID', placeholder: 'Ej. 987654321', width: 'half',
    validation: { required: false }
  },

  // --- Información de Contacto ---
  { id: 'section_contacto', type: 'section', label: 'Contacto y Acceso', width: 'full' },
  {
    id: 'email', type: 'email', label: 'Email (Usuario)', placeholder: 'ana.garcia@ejemplo.com', width: 'half',
    disabled: !!currentPsychologist, // Deshabilitado si estamos editando
    info: currentPsychologist ? 'El email no se puede modificar.' : 'Se creará una cuenta con este email.',
    validation: { required: false }
  },
  {
    id: 'telefono', type: 'tel', label: 'Teléfono', placeholder: 'Ej. 600 11 22 33', width: 'half',
    validation: { required: false }
  },

  // --- Institución ---
  { id: 'section_institucion', type: 'section', label: 'Institución Asignada', width: 'full' },
  {
    id: 'institucion_id', type: 'select', label: 'Institución', placeholder: 'Seleccionar...', width: 'full',
    options: [ { value: '', label: 'Seleccionar...' }, ...institutions.map(inst => ({ value: inst.id, label: inst.nombre })) ],
    validation: { required: false }
  }
];

// Configuración de filtros
export const getFilters = (institutions) => [
  {
    id: 'institucion_id',
    type: 'select',
    label: 'Institución',
    placeholder: 'Todas las instituciones',
    options: [
      { value: '', label: 'Todas las instituciones' },
      ...institutions.map(inst => ({
        value: inst.id,
        label: inst.nombre
      }))
    ]
  }
];

// Valores iniciales del formulario
export const getInitialFormValues = (institutions) => ({
  nombre: '',
  apellidos: '',
  genero: '',
  email: '',
  documento_identidad: '',
  telefono: '',
  institucion_id: institutions.length > 0 ? institutions[0].id : ''
});

// Obtener valores del formulario para un psicólogo existente
export const getFormValues = (psychologist) => ({
  nombre: psychologist.nombre || '',
  apellidos: psychologist.apellidos || '',
  genero: psychologist.genero || '',
  email: psychologist.email || '',
  documento_identidad: psychologist.documento_identidad || '',
  telefono: psychologist.telefono || '',
  institucion_id: psychologist.institucion_id || ''
});

// Función para filtrar psicólogos
export const filterPsychologists = (psychologists, searchTerm, filterValues, institutions) => {
  return psychologists.filter(psychologist => {
    const searchTermLower = searchTerm.toLowerCase();
    // Filtro por búsqueda general
    const matchesSearch = !searchTerm || (
      psychologist.nombre?.toLowerCase().includes(searchTermLower) ||
      psychologist.apellidos?.toLowerCase().includes(searchTermLower) ||
      psychologist.genero?.toLowerCase().includes(searchTermLower) ||
      psychologist.email?.toLowerCase().includes(searchTermLower) ||
      psychologist.documento_identidad?.toLowerCase().includes(searchTermLower) ||
      psychologist.telefono?.toLowerCase().includes(searchTermLower) ||
      (institutions.find(inst => inst.id === psychologist.institucion_id)?.nombre || '').toLowerCase().includes(searchTermLower)
    );

    // Filtro por institución específica
    const matchesInstitution =
      !filterValues.institucion_id ||
      psychologist.institucion_id === filterValues.institucion_id;

    return matchesSearch && matchesInstitution;
  });
};

// Funciones de servicio para psicólogos
export const psychologistServices = {
  fetchEntities: async (sortField, sortDirection) => {
    return await enhancedSupabaseService.getPsychologists(sortField, sortDirection);
  },
  createEntity: async (data) => {
    // Para crear, manejar la generación del usuario_id si es necesario
    const authUserId = crypto.randomUUID();
    
    // Preparar datos para la creación
    const psychologistData = {
      ...data,
      email: data.email || `psicologo_${Date.now()}@example.com`,
      usuario_id: authUserId
    };
    
    return await enhancedSupabaseService.createPsychologist(psychologistData);
  },
  updateEntity: async (id, data) => {
    return await enhancedSupabaseService.updatePsychologist(id, data);
  },
  deleteEntity: async (id) => {
    return await enhancedSupabaseService.deletePsychologist(id);
  }
};
