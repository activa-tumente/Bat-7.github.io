import { FaMale, FaFemale, FaUser } from 'react-icons/fa';
import { calculateAge, renderChip, renderGenderChip, formatDate } from '../../../utils/entityUtils';
import candidateService from '../../../services/candidateService';

/**
 * Configuración para la gestión de candidatos
 * Define columnas, campos de formulario, filtros y servicios
 */

/**
 * Define las columnas para la tabla de candidatos
 */
export const getColumns = (institutions = [], psychologists = []) => [
  {
    field: 'nombre',
    header: 'Nombre',
    sortable: true,
    highlight: true,
    render: (value, row) => {
      const iconMap = {
        Masculino: <FaMale className="text-blue-600 mr-2 text-lg" />,
        Femenino: <FaFemale className="text-pink-600 mr-2 text-lg" />,
      };
      const icon = iconMap[row.genero] || <FaUser className="text-gray-500 mr-2 text-lg" />;
      
      return (
        <div className="flex items-center">
          {icon}
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{row.apellidos}</div>
          </div>
        </div>
      );
    },
  },
  {
    field: 'edad',
    header: 'Edad',
    sortable: true,
    render: (value) => renderChip(value ? `${value} años` : '-', 'blue'),
  },
  {
    field: 'genero',
    header: 'Género',
    sortable: true,
    render: (value) => renderGenderChip(value),
  },
  {
    field: 'documento_identidad',
    header: 'Documento',
    sortable: true,
    emptyValue: '-'
  },
  {
    field: 'email',
    header: 'Email',
    sortable: true,
    emptyValue: '-',
    render: (value) => value ? (
      <a href={`mailto:${value}`} className="text-blue-600 hover:text-blue-800">
        {value}
      </a>
    ) : '-'
  },
  {
    field: 'institucion_id',
    header: 'Institución',
    render: (value, row) => {
      const institution = institutions.find(inst => inst.id === value);
      return renderChip(institution?.nombre || row.institucion_nombre, 'indigo');
    },
  },
  {
    field: 'psicologo_id',
    header: 'Psicólogo',
    render: (value, row) => {
      if (!value) return renderChip('Sin asignar', 'gray');
      
      const psychologist = psychologists.find(p => p.id === value);
      const name = psychologist ? 
        `${psychologist.nombre} ${psychologist.apellidos}` : 
        row.psicologo_nombre;
        
      return renderChip(name, 'cyan');
    }
  },
  {
    field: 'fecha_registro',
    header: 'Fecha Registro',
    sortable: true,
    render: (value) => formatDate(value)
  }
];

/**
 * Define los campos para el formulario de creación/edición
 */
export const getFormFields = (institutions = [], psychologists = []) => [
  { 
    id: 'section_datos_personales', 
    type: 'section', 
    label: 'Datos Personales' 
  },
  { 
    id: 'nombre', 
    type: 'text', 
    label: 'Nombre', 
    placeholder: 'Ej. Juan', 
    width: 'half', 
    validation: { required: true } 
  },
  { 
    id: 'apellidos', 
    type: 'text', 
    label: 'Apellidos', 
    placeholder: 'Ej. Pérez Gómez', 
    width: 'half', 
    validation: { required: true } 
  },
  { 
    id: 'fecha_nacimiento', 
    type: 'date', 
    label: 'Fecha de Nacimiento', 
    width: 'half', 
    validation: { required: true } 
  },
  {
    id: 'genero', 
    type: 'select', 
    label: 'Género', 
    width: 'half', 
    validation: { required: true },
    options: [
      { value: '', label: 'Seleccionar...' },
      { value: 'Masculino', label: 'Masculino' },
      { value: 'Femenino', label: 'Femenino' },
      { value: 'Otro', label: 'Otro' }
    ],
  },
  { 
    id: 'documento_identidad', 
    type: 'text', 
    label: 'Documento de Identidad', 
    placeholder: 'Ej. 1234567890', 
    width: 'half', 
    validation: { required: true } 
  },
  
  { 
    id: 'section_contacto', 
    type: 'section', 
    label: 'Información de Contacto' 
  },
  { 
    id: 'email', 
    type: 'email', 
    label: 'Email', 
    placeholder: 'juan.perez@ejemplo.com', 
    width: 'half', 
    validation: { isEmail: true } 
  },
  { 
    id: 'telefono', 
    type: 'tel', 
    label: 'Teléfono', 
    placeholder: 'Ej. 601 234 5678', 
    width: 'half' 
  },

  { 
    id: 'section_institucion', 
    type: 'section', 
    label: 'Institución y Asignación' 
  },
  {
    id: 'institucion_id', 
    type: 'select', 
    label: 'Institución', 
    width: 'half', 
    validation: { required: true },
    options: [
      { value: '', label: 'Seleccionar...' },
      ...institutions.map(inst => ({ value: inst.id, label: inst.nombre }))
    ],
  },
  {
    id: 'psicologo_id', 
    type: 'select', 
    label: 'Psicólogo Asignado', 
    width: 'half',
    options: [
      { value: '', label: 'Sin asignar' },
      ...psychologists.map(psico => ({ 
        value: psico.id, 
        label: `${psico.nombre} ${psico.apellidos}` 
      }))
    ]
  },
  
  { 
    id: 'section_adicional', 
    type: 'section', 
    label: 'Información Adicional' 
  },
  { 
    id: 'notas', 
    type: 'textarea', 
    label: 'Notas', 
    placeholder: 'Observaciones adicionales...', 
    width: 'full',
    rows: 3
  }
];

/**
 * Define los filtros para la tabla
 */
export const getFilters = (institutions = [], psychologists = []) => [
  {
    id: 'institucion_id', 
    type: 'select', 
    label: 'Institución',
    options: [
      { value: '', label: 'Todas' },
      ...institutions.map(inst => ({ value: inst.id, label: inst.nombre }))
    ]
  },
  {
    id: 'genero', 
    type: 'select', 
    label: 'Género',
    options: [
      { value: '', label: 'Todos' },
      { value: 'Masculino', label: 'Masculino' },
      { value: 'Femenino', label: 'Femenino' },
      { value: 'Otro', label: 'Otro' }
    ]
  },
  {
    id: 'psicologo_id', 
    type: 'select', 
    label: 'Psicólogo',
    options: [
      { value: '', label: 'Todos' },
      { value: 'null', label: 'Sin asignar' },
      ...psychologists.map(p => ({ 
        value: p.id, 
        label: `${p.nombre} ${p.apellidos}` 
      }))
    ]
  },
  { 
    id: 'edad', 
    type: 'range', 
    label: 'Rango Edad', 
    minPlaceholder: 'Mín', 
    maxPlaceholder: 'Máx' 
  }
];

/**
 * Valores iniciales para el formulario
 */
export const getInitialFormValues = (institutions = []) => ({
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

/**
 * Mapea una entidad existente a los valores del formulario
 */
export const getFormValues = (entity) => ({
  nombre: entity.nombre || '',
  apellidos: entity.apellidos || '',
  fecha_nacimiento: entity.fecha_nacimiento ? 
    new Date(entity.fecha_nacimiento).toISOString().split('T')[0] : '',
  genero: entity.genero || '',
  documento_identidad: entity.documento_identidad || '',
  email: entity.email || '',
  telefono: entity.telefono || '',
  institucion_id: entity.institucion_id || '',
  psicologo_id: entity.psicologo_id || '',
  notas: entity.notas || ''
});

/**
 * Lógica de filtrado local (para casos donde no se puede filtrar en el servidor)
 */
export const filterEntities = (entities, filters, searchTerm) => {
  let filtered = [...entities];
  
  // Aplicar filtros
  Object.entries(filters).forEach(([key, value]) => {
    if (!value) return;
    
    filtered = filtered.filter(entity => {
      switch (key) {
        case 'edad':
          const age = calculateAge(entity.fecha_nacimiento);
          const [min, max] = value.split('-').map(Number);
          return age >= (min || 0) && age <= (max || 999);
        case 'psicologo_id':
          if (value === 'null') {
            return !entity.psicologo_id;
          }
          return entity.psicologo_id === value;
        default:
          return String(entity[key]) === String(value);
      }
    });
  });
  
  // Aplicar búsqueda por término
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(entity => {
      const searchableFields = [
        entity.nombre,
        entity.apellidos,
        entity.documento_identidad,
        entity.email,
        entity.telefono
      ];
      
      return searchableFields.some(field => 
        field && String(field).toLowerCase().includes(term)
      );
    });
  }
  
  return filtered;
};

/**
 * Configuración de servicios
 */
export const services = {
  get: (options) => candidateService.getCandidates(options),
  create: (data) => candidateService.createCandidate(data),
  update: (id, data) => candidateService.updateCandidate(id, data),
  delete: (id) => candidateService.deleteCandidate(id),
  getStats: () => candidateService.getCandidateStats()
};
