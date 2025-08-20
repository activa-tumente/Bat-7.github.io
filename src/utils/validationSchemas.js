import * as yup from 'yup';

/**
 * Esquemas de validación centralizados usando Yup
 * Proporciona validación consistente en toda la aplicación
 */

// Mensajes de error personalizados en español
const messages = {
  required: 'Este campo es obligatorio',
  email: 'Debe ser un email válido',
  min: 'Debe tener al menos ${min} caracteres',
  max: 'No puede tener más de ${max} caracteres',
  minNumber: 'Debe ser mayor o igual a ${min}',
  maxNumber: 'Debe ser menor o igual a ${max}',
  positive: 'Debe ser un número positivo',
  integer: 'Debe ser un número entero',
  oneOf: 'Debe ser uno de los siguientes valores: ${values}',
  matches: 'El formato no es válido',
  url: 'Debe ser una URL válida',
  date: 'Debe ser una fecha válida',
  phone: 'Debe ser un número de teléfono válido',
  document: 'Debe ser un número de documento válido'
};

// Configurar mensajes por defecto de Yup
yup.setLocale({
  mixed: {
    required: messages.required,
    oneOf: messages.oneOf
  },
  string: {
    email: messages.email,
    min: messages.min,
    max: messages.max,
    matches: messages.matches,
    url: messages.url
  },
  number: {
    min: messages.minNumber,
    max: messages.maxNumber,
    positive: messages.positive,
    integer: messages.integer
  },
  date: {
    min: 'La fecha debe ser posterior a ${min}',
    max: 'La fecha debe ser anterior a ${max}'
  }
});

// Validaciones personalizadas
const customValidations = {
  // Validación de documento de identidad (cédula, pasaporte, etc.)
  document: yup.string()
    .matches(/^[0-9A-Za-z\-]{6,20}$/, messages.document)
    .required(messages.required),

  // Validación de teléfono
  phone: yup.string()
    .matches(/^[\+]?[0-9\s\-\(\)]{7,15}$/, messages.phone),

  // Validación de contraseña segura
  password: yup.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    )
    .required(messages.required),

  // Validación de confirmación de contraseña
  confirmPassword: (passwordField = 'password') => 
    yup.string()
      .oneOf([yup.ref(passwordField)], 'Las contraseñas no coinciden')
      .required(messages.required),

  // Validación de edad
  age: yup.number()
    .min(16, 'Debe ser mayor de 16 años')
    .max(100, 'Edad no válida')
    .integer(messages.integer)
    .positive(messages.positive),

  // Validación de puntuación (0-100)
  score: yup.number()
    .min(0, 'La puntuación mínima es 0')
    .max(100, 'La puntuación máxima es 100')
    .required(messages.required),

  // Validación de URL opcional
  optionalUrl: yup.string().url(messages.url).nullable(),

  // Validación de fecha de nacimiento
  birthDate: yup.date()
    .max(new Date(), 'La fecha de nacimiento no puede ser futura')
    .min(new Date('1900-01-01'), 'Fecha de nacimiento no válida')
    .required(messages.required)
};

// Esquemas de validación para diferentes formularios

// Esquema de login
export const loginSchema = yup.object({
  identifier: yup.string()
    .required('Email o documento es obligatorio')
    .test('email-or-document', 'Debe ser un email válido o un documento válido', function(value) {
      if (!value) return false;
      
      // Si contiene @, validar como email
      if (value.includes('@')) {
        return yup.string().email().isValidSync(value);
      }
      
      // Si no, validar como documento
      return customValidations.document.isValidSync(value);
    }),
  password: yup.string().required(messages.required),
  userType: yup.string()
    .oneOf(['candidato', 'psicólogo', 'administrador'], 'Tipo de usuario no válido')
    .required('Debe seleccionar un tipo de usuario'),
  remember: yup.boolean()
});

// Esquema de registro
export const registerSchema = yup.object({
  nombre: yup.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras')
    .required(messages.required),
  apellido: yup.string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede tener más de 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido solo puede contener letras')
    .required(messages.required),
  email: yup.string().email(messages.email).required(messages.required),
  documento: customValidations.document,
  telefono: customValidations.phone.nullable(),
  fechaNacimiento: customValidations.birthDate,
  password: customValidations.password,
  confirmPassword: customValidations.confirmPassword(),
  rol: yup.string()
    .oneOf(['estudiante', 'psicologo', 'administrador'], 'Rol no válido')
    .required('Debe seleccionar un rol'),
  institucion: yup.string().when('rol', {
    is: (val) => val === 'estudiante',
    then: (schema) => schema.required('La institución es obligatoria para estudiantes'),
    otherwise: (schema) => schema.nullable()
  }),
  especialidad: yup.string().when('rol', {
    is: (val) => val === 'psicologo',
    then: (schema) => schema.required('La especialidad es obligatoria para psicólogos'),
    otherwise: (schema) => schema.nullable()
  }),
  numeroLicencia: yup.string().when('rol', {
    is: (val) => val === 'psicologo',
    then: (schema) => schema.required('El número de licencia es obligatorio para psicólogos'),
    otherwise: (schema) => schema.nullable()
  }),
  acceptTerms: yup.boolean()
    .oneOf([true], 'Debe aceptar los términos y condiciones')
    .required('Debe aceptar los términos y condiciones')
});

// Esquema para perfil de usuario
export const profileSchema = yup.object({
  nombre: yup.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres')
    .required(messages.required),
  apellido: yup.string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede tener más de 50 caracteres')
    .required(messages.required),
  email: yup.string().email(messages.email).required(messages.required),
  telefono: customValidations.phone.nullable(),
  biografia: yup.string().max(500, 'La biografía no puede tener más de 500 caracteres').nullable(),
  sitioWeb: customValidations.optionalUrl,
  linkedin: customValidations.optionalUrl,
  especialidad: yup.string().when('$userRole', {
    is: 'psicologo',
    then: (schema) => schema.required('La especialidad es obligatoria'),
    otherwise: (schema) => schema.nullable()
  }),
  institucion: yup.string().when('$userRole', {
    is: 'estudiante',
    then: (schema) => schema.required('La institución es obligatoria'),
    otherwise: (schema) => schema.nullable()
  })
});

// Esquema para cambio de contraseña
export const changePasswordSchema = yup.object({
  currentPassword: yup.string().required('La contraseña actual es obligatoria'),
  newPassword: customValidations.password,
  confirmNewPassword: customValidations.confirmPassword('newPassword')
});

// Esquema para cuestionario
export const questionnaireSchema = yup.object({
  title: yup.string()
    .min(5, 'El título debe tener al menos 5 caracteres')
    .max(100, 'El título no puede tener más de 100 caracteres')
    .required(messages.required),
  description: yup.string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(500, 'La descripción no puede tener más de 500 caracteres')
    .required(messages.required),
  duration: yup.number()
    .min(5, 'La duración mínima es 5 minutos')
    .max(180, 'La duración máxima es 180 minutos')
    .integer(messages.integer)
    .required(messages.required),
  category: yup.string().required('La categoría es obligatoria'),
  difficulty: yup.string()
    .oneOf(['easy', 'medium', 'hard'], 'Dificultad no válida')
    .required('La dificultad es obligatoria'),
  questions: yup.array()
    .of(yup.object({
      question: yup.string().required('La pregunta es obligatoria'),
      type: yup.string()
        .oneOf(['multiple-choice', 'text', 'boolean'], 'Tipo de pregunta no válido')
        .required('El tipo de pregunta es obligatorio'),
      options: yup.array().when('type', {
        is: 'multiple-choice',
        then: (schema) => schema.min(2, 'Debe tener al menos 2 opciones').required(),
        otherwise: (schema) => schema.nullable()
      }),
      correctAnswer: yup.string().when('type', {
        is: (val) => val === 'multiple-choice' || val === 'boolean',
        then: (schema) => schema.required('La respuesta correcta es obligatoria'),
        otherwise: (schema) => schema.nullable()
      })
    }))
    .min(1, 'Debe tener al menos una pregunta')
    .required('Las preguntas son obligatorias')
});

// Esquema para respuestas de cuestionario
export const questionnaireResponseSchema = yup.object({
  questionnaireId: yup.string().required('ID del cuestionario es obligatorio'),
  answers: yup.object().required('Las respuestas son obligatorias'),
  timeSpent: yup.number().min(0, 'El tiempo no puede ser negativo').required(),
  isComplete: yup.boolean().required()
});

// Esquema para informe
export const reportSchema = yup.object({
  title: yup.string()
    .min(5, 'El título debe tener al menos 5 caracteres')
    .max(200, 'El título no puede tener más de 200 caracteres')
    .required(messages.required),
  type: yup.string()
    .oneOf(['individual', 'group'], 'Tipo de informe no válido')
    .required('El tipo de informe es obligatorio'),
  candidateIds: yup.array().when('type', {
    is: 'individual',
    then: (schema) => schema.length(1, 'Debe seleccionar exactamente un candidato'),
    otherwise: (schema) => schema.min(1, 'Debe seleccionar al menos un candidato')
  }),
  questionnaireId: yup.string().required('Debe seleccionar un cuestionario'),
  includeCharts: yup.boolean(),
  includeRecommendations: yup.boolean(),
  tags: yup.array().of(yup.string()),
  summary: yup.string().max(1000, 'El resumen no puede tener más de 1000 caracteres')
});

// Esquema para institución
export const institutionSchema = yup.object({
  nombre: yup.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede tener más de 100 caracteres')
    .required(messages.required),
  tipo: yup.string()
    .oneOf(['universidad', 'colegio', 'instituto', 'empresa', 'otro'], 'Tipo no válido')
    .required('El tipo es obligatorio'),
  direccion: yup.string()
    .max(200, 'La dirección no puede tener más de 200 caracteres')
    .nullable(),
  telefono: customValidations.phone.nullable(),
  email: yup.string().email(messages.email).nullable(),
  sitioWeb: customValidations.optionalUrl,
  activa: yup.boolean()
});

// Función helper para validar un campo específico
export const validateField = async (schema, fieldName, value, context = {}) => {
  try {
    await schema.validateAt(fieldName, { [fieldName]: value }, { context });
    return null; // Sin errores
  } catch (error) {
    return error.message;
  }
};

// Función helper para validar todo el formulario
export const validateForm = async (schema, values, context = {}) => {
  try {
    await schema.validate(values, { abortEarly: false, context });
    return {}; // Sin errores
  } catch (error) {
    const errors = {};
    error.inner.forEach(err => {
      if (err.path) {
        errors[err.path] = err.message;
      }
    });
    return errors;
  }
};

// Función helper para sanitizar datos de entrada
export const sanitizeInput = (value, type = 'text') => {
  if (typeof value !== 'string') return value;
  
  switch (type) {
    case 'email':
      return value.toLowerCase().trim();
    case 'name':
      return value.trim().replace(/\s+/g, ' ');
    case 'phone':
      return value.replace(/[^\d\+\-\(\)\s]/g, '');
    case 'document':
      return value.replace(/[^\w\-]/g, '');
    case 'url':
      return value.toLowerCase().trim();
    default:
      return value.trim();
  }
};

export default {
  loginSchema,
  registerSchema,
  profileSchema,
  changePasswordSchema,
  questionnaireSchema,
  questionnaireResponseSchema,
  reportSchema,
  institutionSchema,
  validateField,
  validateForm,
  sanitizeInput,
  customValidations
};
