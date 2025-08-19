import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaSpinner, FaEnvelope, FaIdCard, FaUserMd, FaUserGraduate, FaUserShield } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

/**
 * Componente de formulario de registro para los tres tipos de usuarios
 */
const RegisterForm = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    apellido: '',
    documento: '',
    tipo_usuario: 'Candidato'
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Tipos de usuario disponibles
  const userTypes = [
    {
      value: 'Candidato',
      label: 'Candidato',
      icon: FaUserGraduate,
      description: 'Para realizar evaluaciones psicométricas',
      color: 'text-blue-600'
    },
    {
      value: 'Psicólogo',
      label: 'Psicólogo',
      icon: FaUserMd,
      description: 'Para gestionar candidatos y resultados',
      color: 'text-green-600'
    },
    {
      value: 'Administrador',
      label: 'Administrador',
      icon: FaUserShield,
      description: 'Acceso completo al sistema',
      color: 'text-purple-600'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'Email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email no es válido';
    }
    
    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'Nombre es requerido';
    }
    
    // Validar apellido
    if (!formData.apellido.trim()) {
      newErrors.apellido = 'Apellido es requerido';
    }
    
    // Validar documento
    if (!formData.documento.trim()) {
      newErrors.documento = 'Documento es requerido';
    }
    
    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'Contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmación de contraseña es requerida';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await register(formData);
      
      if (result.success) {
        toast.success('Registro exitoso. Revisa tu email para confirmar tu cuenta.');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error en registro:', error);
      toast.error('Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Crear Cuenta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sistema de Evaluación Psicométrica BAT-7
          </p>
        </div>

        {/* Formulario de registro */}
        <form className="mt-8 space-y-6 bg-white rounded-lg shadow-md p-6" onSubmit={handleSubmit}>
          {/* Selector de tipo de usuario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Usuario
            </label>
            <div className="space-y-2">
              {userTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <label
                    key={type.value}
                    className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.tipo_usuario === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tipo_usuario"
                      value={type.value}
                      checked={formData.tipo_usuario === type.value}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <IconComponent className={`h-4 w-4 ${type.color} mr-3`} />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{type.label}</div>
                      <div className="text-xs text-gray-500">{type.description}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            {/* Nombre y Apellido */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <div className="mt-1 relative">
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className={`appearance-none relative block w-full px-3 py-2 border ${
                      errors.nombre ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="Nombre"
                  />
                </div>
                {errors.nombre && (
                  <p className="mt-1 text-xs text-red-600">{errors.nombre}</p>
                )}
              </div>

              <div>
                <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">
                  Apellido
                </label>
                <div className="mt-1 relative">
                  <input
                    id="apellido"
                    name="apellido"
                    type="text"
                    required
                    value={formData.apellido}
                    onChange={handleInputChange}
                    className={`appearance-none relative block w-full px-3 py-2 border ${
                      errors.apellido ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="Apellido"
                  />
                </div>
                {errors.apellido && (
                  <p className="mt-1 text-xs text-red-600">{errors.apellido}</p>
                )}
              </div>
            </div>

            {/* Documento */}
            <div>
              <label htmlFor="documento" className="block text-sm font-medium text-gray-700">
                Documento de Identidad
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaIdCard className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="documento"
                  name="documento"
                  type="text"
                  required
                  value={formData.documento}
                  onChange={handleInputChange}
                  className={`appearance-none relative block w-full pl-10 pr-3 py-2 border ${
                    errors.documento ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="Número de documento"
                />
              </div>
              {errors.documento && (
                <p className="mt-1 text-sm text-red-600">{errors.documento}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`appearance-none relative block w-full pl-10 pr-3 py-2 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="ejemplo@correo.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`appearance-none relative block w-full pl-10 pr-10 py-2 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="Contraseña"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar Contraseña
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`appearance-none relative block w-full pl-10 pr-10 py-2 border ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="Confirmar contraseña"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Botón de submit */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              } transition-colors duration-200`}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin h-5 w-5 mr-2" />
                  Creando cuenta...
                </>
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </div>

          {/* Enlaces adicionales */}
          <div className="text-center">
            <Link
              to="/login"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              ¿Ya tienes cuenta? Inicia sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
