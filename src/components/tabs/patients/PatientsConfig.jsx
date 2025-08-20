import React from 'react';
import { FaMale, FaFemale, FaUser } from 'react-icons/fa';
import enhancedSupabaseService from '../../../services/enhancedSupabaseService';
import { calculateAge, getGenderIcon, renderChip, renderGenderChip } from '../common/entityUtils';

/**
 * Configuración para el componente de pacientes
 */

// Configuración de columnas para la tabla
export const getColumns = (institutions, psychologists) => [
  {
    field: 'nombre',
    header: 'Nombre',
    sortable: true,
    highlight: true,
    render: (value, row) => {
      // Obtener icono de género con color
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
    field: 'edad',
    header: 'Edad',
    sortable: true,
    emptyValue: '-',
    type: 'numeric',
    render: (value) => {
      // Estilo de "chip" para la edad
      return renderChip(value, '#e6f0ff');
    }
  },
  {
    field: 'genero',
    header: 'Género',
    sortable: true,
    render: (value) => renderGenderChip(value)
  },
  {
    field: 'documento_identidad',
    header: 'Documento',
    sortable: true,
    emptyValue: '-',
    render: (value) => value || '-'
  },
  {
    field: 'email',
    header: 'Email',
    sortable: true,
    emptyValue: '-',
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
  },
  {
    field: 'psicologo',
    header: 'Psicólogo',
    sortable: false,
    render: (_, row) => {
      if (!row.psicologo_id) return '-';
      
      const psico = psychologists.find(p => p.id === row.psicologo_id);
      const nombreCompleto = psico ? `${psico.nombre} ${psico.apellidos}` : '-';

      return nombreCompleto !== '-' ? renderChip(nombreCompleto, '#e0f2fe') : '-';
    }
  }
];

// Configuración de campos para el formulario
export const getFormFields = (institutions, psychologists) => [
  // --- Datos Personales ---
  { id: 'section_datos_personales', type: 'section', label: 'Datos Personales', width: 'full' },
  {
    id: 'nombre', type: 'text', label: 'Nombre', placeholder: 'Ej. Juan', width: 'half',
    validation: { required: false }
  },
  {
    id: 'apellidos', type: 'text', label: 'Apellidos', placeholder: 'Ej. Pérez Gómez', width: 'half',
    validation: { required: false }
  },
  {
    id: 'fecha_nacimiento', type: 'date', label: 'Fecha de Nacimiento', width: 'half',
    validation: { required: false }
  },
  {
    id: 'genero', type: 'select', label: 'Género', placeholder: 'Seleccionar género', width: 'half',
    options: [ { value: '', label: 'Seleccionar...' }, { value: 'Masculino', label: 'Masculino' }, { value: 'Femenino', label: 'Femenino' }],
    validation: { required: false }
  },
  {
    id: 'documento_identidad', type: 'text', label: 'Documento de Identidad', placeholder: 'Ej. 1234567890', width: 'half',
    validation: { required: false }
  },

  // --- Información de Contacto ---
  { id: 'section_contacto', type: 'section', label: 'Información de Contacto', width: 'full' },
  {
    id: 'email', type: 'email', label: 'Email', placeholder: 'juan.perez@ejemplo.com', width: 'half',
    validation: { required: false }
  },
  {
    id: 'telefono', type: 'tel', label: 'Teléfono', placeholder: 'Ej. 601 234 5678', width: 'half',
    validation: { required: false }
  },

  // --- Institución y Asignación ---
  { id: 'section_institucion', type: 'section', label: 'Institución y Asignación', width: 'full' },
  {
    id: 'institucion_id', type: 'select', label: 'Institución', placeholder: 'Seleccionar institución', width: 'half',
    options: [ 
      { value: '', label: 'Seleccionar...' }, 
      ...institutions.map(inst => ({ value: inst.id, label: inst.nombre })) 
    ],
    validation: { required: false }
  },
  {
    id: 'psicologo_id', type: 'select', label: 'Psicólogo Asignado', placeholder: 'Sin asignar', width: 'half',
    options: [ 
      { value: '', label: 'Sin asignar' }, 
      ...psychologists.map(psico => ({ value: psico.id, label: `${psico.nombre} ${psico.apellidos}` })) 
    ]
  },

  // --- Notas Adicionales ---
  { id: 'section_notas', type: 'section', label: 'Notas Adicionales', width: 'full' },
  {
    id: 'notas', type: 'textarea', label: 'Notas', placeholder: 'Información adicional...', width: 'full', rows: 3
  }
];

// Configuración de filtros
export const getFilters = (institutions, psychologists) => [
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
  },
  {
    id: 'genero',
    type: 'select',
    label: 'Género',
    placeholder: 'Todos los géneros',
    options: [
      { value: '', label: 'Todos los géneros' },
      { value: 'Masculino', label: 'Masculino' },
      { value: 'Femenino', label: 'Femenino' }
    ]
  },
  {
    id: 'psicologo_id',
    type: 'select',
    label: 'Psicólogo',
    placeholder: 'Todos los psicólogos',
    options: [
      { value: '', label: 'Todos' },
      { value: 'null', label: 'Sin asignar' },
      ...psychologists.map(psico => ({
        value: psico.id,
        label: `${psico.nombre} ${psico.apellidos}`
      }))
    ]
  },
  {
    id: 'edad_min',
    type: 'number',
    label: 'Edad Mín.',
    placeholder: 'Mín',
    min: 0,
    max: 120,
    style: { width: '80px' }
  },
  {
    id: 'edad_max',
    type: 'number',
    label: 'Edad Máx.',
    placeholder: 'Máx',
    min: 0,
    max: 120,
    style: { width: '80px' }
  }
];

// Valores iniciales del formulario
export const getInitialFormValues = (institutions) => ({
  nombre: '',
  apellidos: '',
  fecha_nacimiento: '',
  genero: '',
  documento_identidad: '',
  email: '',
  telefono: '',
  institucion_id: institutions.length > 0 ? institutions[0].id : '',
  psicologo_id: '',
  notas: ''
});

// Obtener valores del formulario para un paciente existente
export const getFormValues = (patient) => ({
  nombre: patient.nombre || '',
  apellidos: patient.apellidos || '',
  // Asegurarse de que la fecha esté en formato YYYY-MM-DD para el input type="date"
  fecha_nacimiento: patient.fecha_nacimiento ? new Date(patient.fecha_nacimiento).toISOString().split('T')[0] : '',
  genero: patient.genero || '',
  documento_identidad: patient.documento_identidad || '',
  email: patient.email || '',
  telefono: patient.telefono || '',
  institucion_id: patient.institucion_id || '',
  psicologo_id: patient.psicologo_id || '',
  notas: patient.notas || ''
});

// Función para filtrar pacientes
export const filterPatients = (patients, searchTerm, filterValues) => {
  return patients.filter(patient => {
    // Filtro por término de búsqueda general
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || (
      patient.nombre?.toLowerCase().includes(searchTermLower) ||
      patient.apellidos?.toLowerCase().includes(searchTermLower) ||
      patient.documento_identidad?.toLowerCase().includes(searchTermLower) ||
      patient.email?.toLowerCase().includes(searchTermLower) ||
      patient.telefono?.toLowerCase().includes(searchTermLower) ||
      patient.notas?.toLowerCase().includes(searchTermLower)
    );

    // Filtro por institución
    const matchesInstitution =
      !filterValues.institucion_id || patient.institucion_id === filterValues.institucion_id;

    // Filtro por género
    const matchesGender =
      !filterValues.genero || patient.genero === filterValues.genero;

    // Filtro por psicólogo (maneja 'null' para 'sin asignar')
    const matchesPsychologist =
      !filterValues.psicologo_id ||
      (filterValues.psicologo_id === 'null' ? !patient.psicologo_id : patient.psicologo_id === filterValues.psicologo_id);

    // Filtro por edad mínima (asegurarse de que patient.edad existe y es número)
    const patientAge = typeof patient.edad === 'number' ? patient.edad : -1; // Usar -1 si no hay edad
    const minAgeFilter = parseInt(filterValues.edad_min);
    const matchesMinAge = isNaN(minAgeFilter) || patientAge === -1 || patientAge >= minAgeFilter;

    // Filtro por edad máxima (asegurarse de que patient.edad existe y es número)
    const maxAgeFilter = parseInt(filterValues.edad_max);
    const matchesMaxAge = isNaN(maxAgeFilter) || patientAge === -1 || patientAge <= maxAgeFilter;

    // Debe cumplir con todos los filtros
    return matchesSearch && matchesInstitution && matchesGender &&
           matchesPsychologist && matchesMinAge && matchesMaxAge;
  });
};

// Procesador de datos
export const processPatientData = (patients) => {
  return patients.map(patient => ({
    ...patient,
    edad: calculateAge(patient.fecha_nacimiento)
  }));
};

// Funciones de servicio para pacientes
export const patientServices = {
  fetchEntities: async (sortField, sortDirection) => {
    const result = await enhancedSupabaseService.getPatients(sortField, sortDirection);
    result.data = result.data ? processPatientData(result.data) : [];
    return result;
  },
  createEntity: async (data) => {
    return await enhancedSupabaseService.createPatient(data);
  },
  updateEntity: async (id, data) => {
    return await enhancedSupabaseService.updatePatient(id, data);
  },
  deleteEntity: async (id) => {
    return await enhancedSupabaseService.deletePatient(id);
  }
};
