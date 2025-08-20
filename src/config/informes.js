/**
 * informes.js - Configuración centralizada para el sistema de informes
 * 
 * Características:
 * - Constantes del sistema
 * - Configuración de caché
 * - Límites y validaciones
 * - Configuración de exportación
 * - Mensajes de error
 * - Configuración de paginación
 */

/**
 * Estados posibles de los informes
 */
export const ESTADOS_INFORME = {
  BORRADOR: 'borrador',
  GENERADO: 'generado',
  PROCESANDO: 'procesando',
  ERROR: 'error',
  ELIMINADO: 'eliminado',
  ARCHIVADO: 'archivado'
};

/**
 * Tipos de informes disponibles
 */
export const TIPOS_INFORME = {
  COMPLETO: 'completo',
  RESUMEN: 'resumen',
  DETALLADO: 'detallado',
  COMPARATIVO: 'comparativo'
};

/**
 * Formatos de exportación soportados
 */
export const FORMATOS_EXPORTACION = {
  PDF: 'pdf',
  EXCEL: 'xlsx',
  CSV: 'csv',
  JSON: 'json'
};

/**
 * Configuración principal del sistema de informes
 */
export const INFORMES_CONFIG = {
  // Estados
  ESTADOS: ESTADOS_INFORME,
  
  // Tipos
  TIPOS: TIPOS_INFORME,
  
  // Formatos
  FORMATOS: FORMATOS_EXPORTACION,
  
  // Configuración de caché
  CACHE: {
    TTL: 5 * 60 * 1000, // 5 minutos
    MAX_SIZE: 100,
    ENABLE_COMPRESSION: false,
    STRATEGY: 'memory' // 'memory', 'session', 'persistent'
  },
  
  // Configuración de paginación
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    MIN_PAGE_SIZE: 5
  },
  
  // Límites del sistema
  LIMITS: {
    MAX_TITLE_LENGTH: 200,
    MAX_DESCRIPTION_LENGTH: 1000,
    MAX_BATCH_SIZE: 50,
    MAX_EXPORT_SIZE: 1000,
    MAX_SEARCH_RESULTS: 500
  },
  
  // Configuración de validación
  VALIDATION: {
    REQUIRED_FIELDS: ['paciente_id', 'tipo_informe'],
    OPTIONAL_FIELDS: ['titulo', 'descripcion', 'observaciones'],
    DATE_FORMAT: 'YYYY-MM-DD HH:mm:ss',
    MIN_PATIENT_AGE: 0,
    MAX_PATIENT_AGE: 120
  },
  
  // Configuración de exportación
  EXPORT: {
    PDF: {
      FORMAT: 'A4',
      ORIENTATION: 'portrait',
      MARGIN: { top: 20, right: 20, bottom: 20, left: 20 },
      FONT_SIZE: 12,
      INCLUDE_HEADER: true,
      INCLUDE_FOOTER: true
    },
    EXCEL: {
      SHEET_NAME: 'Informes BAT-7',
      INCLUDE_CHARTS: true,
      AUTO_FILTER: true,
      FREEZE_HEADER: true
    },
    CSV: {
      DELIMITER: ',',
      ENCODING: 'UTF-8',
      INCLUDE_BOM: true
    }
  },
  
  // Configuración de búsqueda
  SEARCH: {
    MIN_QUERY_LENGTH: 2,
    MAX_QUERY_LENGTH: 100,
    SEARCHABLE_FIELDS: [
      'titulo',
      'descripcion',
      'pacientes.nombre',
      'pacientes.apellido',
      'pacientes.documento'
    ],
    FUZZY_SEARCH: true,
    HIGHLIGHT_RESULTS: true
  },
  
  // Configuración de notificaciones
  NOTIFICATIONS: {
    ENABLE_REAL_TIME: true,
    ENABLE_EMAIL: false,
    ENABLE_PUSH: false,
    BATCH_NOTIFICATIONS: true
  },
  
  // Configuración de seguridad
  SECURITY: {
    ENABLE_AUDIT_LOG: true,
    REQUIRE_CONFIRMATION_FOR_DELETE: true,
    ENABLE_SOFT_DELETE: true,
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutos
    MAX_LOGIN_ATTEMPTS: 5
  },
  
  // Configuración de rendimiento
  PERFORMANCE: {
    ENABLE_MONITORING: true,
    SLOW_QUERY_THRESHOLD: 5000, // 5 segundos
    ENABLE_QUERY_OPTIMIZATION: true,
    PREFETCH_RELATED_DATA: true,
    LAZY_LOAD_IMAGES: true
  }
};

/**
 * Mensajes del sistema
 */
export const MENSAJES = {
  SUCCESS: {
    INFORME_CREATED: 'Informe creado exitosamente',
    INFORME_UPDATED: 'Informe actualizado exitosamente',
    INFORME_DELETED: 'Informe eliminado exitosamente',
    INFORMES_EXPORTED: 'Informes exportados exitosamente',
    CACHE_CLEARED: 'Caché limpiado exitosamente'
  },
  
  ERROR: {
    INFORME_NOT_FOUND: 'Informe no encontrado',
    INVALID_INFORME_DATA: 'Datos del informe inválidos',
    PERMISSION_DENIED: 'Sin permisos para realizar esta acción',
    NETWORK_ERROR: 'Error de conexión. Verifique su conexión a internet',
    DATABASE_ERROR: 'Error en la base de datos. Inténtelo nuevamente',
    VALIDATION_ERROR: 'Error de validación en los datos proporcionados',
    EXPORT_ERROR: 'Error al exportar los informes',
    CACHE_ERROR: 'Error en el sistema de caché'
  },
  
  WARNING: {
    UNSAVED_CHANGES: 'Tiene cambios sin guardar. ¿Desea continuar?',
    DELETE_CONFIRMATION: '¿Está seguro de que desea eliminar este informe?',
    BULK_DELETE_CONFIRMATION: '¿Está seguro de que desea eliminar {count} informes?',
    LARGE_EXPORT: 'La exportación contiene muchos registros y puede tardar varios minutos',
    CACHE_FULL: 'El caché está lleno. Se eliminarán entradas antiguas automáticamente'
  },
  
  INFO: {
    LOADING: 'Cargando informes...',
    GENERATING: 'Generando informe...',
    EXPORTING: 'Exportando informes...',
    SAVING: 'Guardando cambios...',
    DELETING: 'Eliminando informe...',
    NO_RESULTS: 'No se encontraron informes que coincidan con los criterios de búsqueda',
    EMPTY_STATE: 'No hay informes disponibles. Genere su primer informe para comenzar'
  }
};

/**
 * Configuración de campos de formulario
 */
export const FORM_CONFIG = {
  TITULO: {
    label: 'Título del Informe',
    placeholder: 'Ingrese el título del informe',
    maxLength: INFORMES_CONFIG.LIMITS.MAX_TITLE_LENGTH,
    required: false,
    validation: {
      pattern: /^[a-zA-Z0-9\s\-_.,()]+$/,
      message: 'El título solo puede contener letras, números y caracteres básicos'
    }
  },
  
  DESCRIPCION: {
    label: 'Descripción',
    placeholder: 'Ingrese una descripción opcional',
    maxLength: INFORMES_CONFIG.LIMITS.MAX_DESCRIPTION_LENGTH,
    required: false,
    rows: 4
  },
  
  TIPO_INFORME: {
    label: 'Tipo de Informe',
    options: [
      { value: TIPOS_INFORME.COMPLETO, label: 'Informe Completo' },
      { value: TIPOS_INFORME.RESUMEN, label: 'Resumen Ejecutivo' },
      { value: TIPOS_INFORME.DETALLADO, label: 'Análisis Detallado' },
      { value: TIPOS_INFORME.COMPARATIVO, label: 'Estudio Comparativo' }
    ],
    required: true,
    defaultValue: TIPOS_INFORME.COMPLETO
  },
  
  ESTADO: {
    label: 'Estado',
    options: [
      { value: ESTADOS_INFORME.BORRADOR, label: 'Borrador', color: 'gray' },
      { value: ESTADOS_INFORME.GENERADO, label: 'Generado', color: 'green' },
      { value: ESTADOS_INFORME.PROCESANDO, label: 'Procesando', color: 'blue' },
      { value: ESTADOS_INFORME.ERROR, label: 'Error', color: 'red' },
      { value: ESTADOS_INFORME.ARCHIVADO, label: 'Archivado', color: 'yellow' }
    ],
    required: true,
    defaultValue: ESTADOS_INFORME.BORRADOR
  }
};

/**
 * Configuración de filtros
 */
export const FILTER_CONFIG = {
  ESTADO: {
    type: 'select',
    label: 'Estado',
    options: FORM_CONFIG.ESTADO.options,
    multiple: true
  },
  
  TIPO: {
    type: 'select',
    label: 'Tipo de Informe',
    options: FORM_CONFIG.TIPO_INFORME.options,
    multiple: true
  },
  
  FECHA_DESDE: {
    type: 'date',
    label: 'Fecha Desde',
    placeholder: 'Seleccione fecha inicial'
  },
  
  FECHA_HASTA: {
    type: 'date',
    label: 'Fecha Hasta',
    placeholder: 'Seleccione fecha final'
  },
  
  PACIENTE: {
    type: 'search',
    label: 'Paciente',
    placeholder: 'Buscar por nombre, apellido o documento',
    minLength: INFORMES_CONFIG.SEARCH.MIN_QUERY_LENGTH
  },
  
  BUSQUEDA_GENERAL: {
    type: 'text',
    label: 'Búsqueda General',
    placeholder: 'Buscar en título, descripción...',
    minLength: INFORMES_CONFIG.SEARCH.MIN_QUERY_LENGTH,
    maxLength: INFORMES_CONFIG.SEARCH.MAX_QUERY_LENGTH
  }
};

/**
 * Configuración de ordenamiento
 */
export const SORT_CONFIG = {
  options: [
    { value: 'fecha_generacion', label: 'Fecha de Generación', direction: 'desc' },
    { value: 'titulo', label: 'Título', direction: 'asc' },
    { value: 'tipo_informe', label: 'Tipo de Informe', direction: 'asc' },
    { value: 'estado', label: 'Estado', direction: 'asc' },
    { value: 'pacientes.apellido', label: 'Apellido del Paciente', direction: 'asc' },
    { value: 'pacientes.nombre', label: 'Nombre del Paciente', direction: 'asc' }
  ],
  default: {
    column: 'fecha_generacion',
    direction: 'desc'
  }
};

/**
 * Configuración de columnas para tablas
 */
export const TABLE_CONFIG = {
  columns: [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      width: '80px',
      visible: false
    },
    {
      key: 'titulo',
      label: 'Título',
      sortable: true,
      searchable: true,
      width: '300px',
      truncate: true
    },
    {
      key: 'paciente',
      label: 'Paciente',
      sortable: true,
      searchable: true,
      width: '200px',
      render: (row) => `${row.pacientes?.apellido}, ${row.pacientes?.nombre}`
    },
    {
      key: 'tipo_informe',
      label: 'Tipo',
      sortable: true,
      width: '120px',
      render: (row) => FORM_CONFIG.TIPO_INFORME.options
        .find(opt => opt.value === row.tipo_informe)?.label || row.tipo_informe
    },
    {
      key: 'estado',
      label: 'Estado',
      sortable: true,
      width: '100px',
      render: (row) => {
        const estado = FORM_CONFIG.ESTADO.options
          .find(opt => opt.value === row.estado);
        return {
          text: estado?.label || row.estado,
          color: estado?.color || 'gray'
        };
      }
    },
    {
      key: 'fecha_generacion',
      label: 'Fecha',
      sortable: true,
      width: '150px',
      render: (row) => new Date(row.fecha_generacion).toLocaleDateString('es-ES')
    },
    {
      key: 'acciones',
      label: 'Acciones',
      sortable: false,
      width: '120px',
      sticky: 'right'
    }
  ],
  
  defaultVisible: ['titulo', 'paciente', 'tipo_informe', 'estado', 'fecha_generacion', 'acciones'],
  
  responsive: {
    mobile: ['titulo', 'estado', 'acciones'],
    tablet: ['titulo', 'paciente', 'estado', 'fecha_generacion', 'acciones']
  }
};

/**
 * Configuración de acciones masivas
 */
export const BULK_ACTIONS_CONFIG = {
  actions: [
    {
      key: 'delete',
      label: 'Eliminar Seleccionados',
      icon: 'trash',
      color: 'red',
      requiresConfirmation: true,
      confirmationMessage: '¿Está seguro de que desea eliminar los informes seleccionados?'
    },
    {
      key: 'archive',
      label: 'Archivar Seleccionados',
      icon: 'archive',
      color: 'yellow',
      requiresConfirmation: true,
      confirmationMessage: '¿Está seguro de que desea archivar los informes seleccionados?'
    },
    {
      key: 'export',
      label: 'Exportar Seleccionados',
      icon: 'download',
      color: 'blue',
      requiresConfirmation: false,
      subActions: [
        { key: 'export_pdf', label: 'Exportar como PDF', format: 'pdf' },
        { key: 'export_excel', label: 'Exportar como Excel', format: 'xlsx' },
        { key: 'export_csv', label: 'Exportar como CSV', format: 'csv' }
      ]
    },
    {
      key: 'duplicate',
      label: 'Duplicar Seleccionados',
      icon: 'copy',
      color: 'green',
      requiresConfirmation: false
    }
  ]
};

/**
 * Configuración de métricas y estadísticas
 */
export const METRICS_CONFIG = {
  widgets: [
    {
      key: 'total_informes',
      title: 'Total de Informes',
      type: 'counter',
      icon: 'document',
      color: 'blue'
    },
    {
      key: 'informes_mes',
      title: 'Informes este Mes',
      type: 'counter',
      icon: 'calendar',
      color: 'green'
    },
    {
      key: 'informes_pendientes',
      title: 'Informes Pendientes',
      type: 'counter',
      icon: 'clock',
      color: 'yellow'
    },
    {
      key: 'tasa_completitud',
      title: 'Tasa de Completitud',
      type: 'percentage',
      icon: 'check-circle',
      color: 'green'
    }
  ],
  
  charts: [
    {
      key: 'informes_por_mes',
      title: 'Informes por Mes',
      type: 'line',
      timeRange: '12m'
    },
    {
      key: 'informes_por_tipo',
      title: 'Distribución por Tipo',
      type: 'pie'
    },
    {
      key: 'informes_por_estado',
      title: 'Distribución por Estado',
      type: 'doughnut'
    }
  ]
};

/**
 * Configuración de temas y estilos
 */
export const THEME_CONFIG = {
  colors: {
    primary: '#3B82F6',
    secondary: '#6B7280',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4'
  },
  
  statusColors: {
    [ESTADOS_INFORME.BORRADOR]: '#6B7280',
    [ESTADOS_INFORME.GENERADO]: '#10B981',
    [ESTADOS_INFORME.PROCESANDO]: '#3B82F6',
    [ESTADOS_INFORME.ERROR]: '#EF4444',
    [ESTADOS_INFORME.ELIMINADO]: '#9CA3AF',
    [ESTADOS_INFORME.ARCHIVADO]: '#F59E0B'
  },
  
  animations: {
    duration: 200,
    easing: 'ease-in-out'
  }
};

export default INFORMES_CONFIG;