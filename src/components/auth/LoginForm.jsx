import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaSpinner, FaUserMd, FaUserGraduate, FaUserShield, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { useFormValidation } from '../../hooks/useFormValidation';
import { loginSchema } from '../../utils/validationSchemas';
import ValidatedInput from '../forms/ValidatedInput';
import { FormErrorBoundary } from '../error/ErrorBoundary';

/**
 * Componente de formulario de login que soporta:
 * - Login con email o documento
 * - Diferentes tipos de usuarios (pacientes, psicólogos, administradores)
 */
const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    identifier: '', // Email o documento
    password: '',
    userType: 'candidato' // Tipo de usuario seleccionado
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Tipos de usuario disponibles
  const userTypes = [
    {
      value: 'candidato',
      label: 'Candidato',
      icon: FaUserGraduate,
      description: 'Acceso para realizar evaluaciones psicométricas',
      color: 'text-blue-600'
    },
    {
      value: 'psicólogo',
      label: 'Psicólogo',
      icon: FaUserMd,
      description: 'Acceso para gestionar candidatos y resultados',
      color: 'text-green-600'
    },
    {
      value: 'administrador',
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
    
    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Email o documento es requerido';
    }
    
    if (!formData.password) {
      newErrors.password = 'Contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
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
      const result = await login({
        identifier: formData.identifier,
        password: formData.password
      });

      if (result.success) {
        // Verificar que el tipo de usuario en la BD coincida con el seleccionado en la UI
        const userRole = result.user?.tipo_usuario?.toLowerCase();
        const selectedRole = formData.userType.toLowerCase();

        // Mapeo de valores del formulario a valores de BD para validación
        const formToDatabaseRole = {
          'candidato': 'estudiante',
          'psicólogo': 'psicologo',
          'administrador': 'administrador'
        };

        const expectedRole = formToDatabaseRole[selectedRole] || selectedRole;

        if (userRole !== expectedRole) {
          // Mapeo inverso para mostrar nombres amigables
          const databaseToFormRole = {
            'estudiante': 'candidato',
            'psicologo': 'psicólogo',
            'administrador': 'administrador'
          };
          const displayRole = databaseToFormRole[userRole] || userRole;
          toast.error(`Error de rol: Intentaste iniciar sesión como "${formData.userType}", pero tu cuenta es de tipo "${displayRole}". Por favor, selecciona el tipo de usuario correcto.`);
          return; // Detener la ejecución
        }

        // Redirigir según el tipo de usuario
        switch (userRole) {
          case 'administrador':
            navigate('/admin/administration');
            break;
          case 'psicologo':
            navigate('/admin/candidates');
            break;
          case 'candidato':
          case 'estudiante':
          default:
            navigate('/home');
            break;
        }

        toast.success('¡Bienvenido al sistema BAT-7!');
      } else {
        // Mostrar mensaje de error más amigable
        const friendlyMessage = getFriendlyErrorMessage(result.message);
        toast.error(friendlyMessage);
      }
    } catch (error) {
      console.error('Error en login:', error);
      const friendlyMessage = getFriendlyErrorMessage(error.message);
      toast.error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  // Función para convertir errores técnicos en mensajes amigables
  const getFriendlyErrorMessage = (errorMessage) => {
    if (!errorMessage) return 'Error al iniciar sesión';

    const lowerMessage = errorMessage.toLowerCase();

    if (lowerMessage.includes('invalid login credentials') ||
        lowerMessage.includes('invalid email or password')) {
      return 'El email/documento o la contraseña son incorrectos';
    }

    if (lowerMessage.includes('email not confirmed')) {
      return 'Debes confirmar tu email antes de iniciar sesión';
    }

    if (lowerMessage.includes('usuario no encontrado')) {
      return 'No se encontró un usuario con ese documento';
    }

    if (lowerMessage.includes('too many requests')) {
      return 'Demasiados intentos. Espera unos minutos antes de intentar de nuevo';
    }

    return errorMessage;
  };

  const isEmailFormat = (identifier) => {
    return identifier.includes('@');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="min-h-screen flex">
        {/* Panel izquierdo - Información del sistema */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          {/* Fondo con gradiente moderno */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800"></div>

          {/* Elementos decorativos modernos */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 to-transparent"></div>
            <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
          </div>

          {/* Patrón de puntos moderno */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
              backgroundSize: '32px 32px'
            }}
          ></div>

          <div className="relative z-10 flex flex-col justify-center px-12 py-12 text-white slide-in-left">
            <div className="space-y-8">
              {/* Logo y branding */}
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl float-animation">
                    <FaUserShield className="text-2xl text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-black tracking-tight">BAT-7</h1>
                    <p className="text-blue-200 text-lg font-medium">Sistema de Evaluación</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-5xl font-black leading-tight">
                    Bienvenido al
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                      Futuro de la Evaluación
                    </span>
                    <span className="block text-blue-200">Psicométrica</span>
                  </h2>
                  <p className="text-xl text-blue-100 leading-relaxed max-w-md">
                    Plataforma de nueva generación para evaluaciones psicológicas inteligentes y análisis avanzado
                  </p>
                </div>
              </div>

              {/* Características modernas */}
              <div className="space-y-4">
                {[
                  { icon: FaUserGraduate, text: "Evaluaciones Inteligentes", desc: "IA aplicada a evaluaciones" },
                  { icon: FaUserMd, text: "Dashboard Avanzado", desc: "Análisis en tiempo real" },
                  { icon: FaUserShield, text: "Seguridad Total", desc: "Protección de datos garantizada" }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-4 group">
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-all duration-300 group-hover:scale-110">
                      <feature.icon className="text-amber-300 text-lg" />
                    </div>
                    <div>
                      <div className="text-white font-semibold text-lg">{feature.text}</div>
                      <div className="text-blue-200 text-sm">{feature.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Panel derecho - Formulario de login */}
        <div className="flex-1 flex flex-col justify-center py-8 px-6 sm:px-8 lg:px-16 xl:px-24 glass-effect">
          <div className="mx-auto w-full max-w-md lg:w-full lg:max-w-lg fade-in-up">
            {/* Header móvil */}
            <div className="text-center lg:hidden mb-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl">
                  <FaUserShield className="text-white text-xl" />
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-black text-gray-900">BAT-7</h1>
                  <p className="text-sm text-gray-600 font-medium">Sistema de Evaluación</p>
                </div>
              </div>
            </div>

            {/* Título principal moderno */}
            <div className="text-center lg:text-left mb-10">
              <h2 className="text-4xl font-black text-gray-900 mb-3">
                Iniciar Sesión
              </h2>
              <p className="text-gray-600 text-lg">
                Accede a tu cuenta para continuar
              </p>
            </div>

          {/* Selector de tipo de usuario */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Tipo de Usuario</h3>
            <div className="grid grid-cols-1 gap-3">
              {userTypes.map((type) => {
                const IconComponent = type.icon;
                const isSelected = formData.userType === type.value;
                return (
                  <label
                    key={type.value}
                    className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                      isSelected
                        ? 'border-amber-500 bg-gradient-to-r from-amber-50 to-orange-50 shadow-lg shadow-amber-500/20'
                        : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50 hover:shadow-md'
                    }`}
                  >
                    <input
                      type="radio"
                      name="userType"
                      value={type.value}
                      checked={isSelected}
                      onChange={handleInputChange}
                      className="sr-only"
                    />

                    {/* Icono */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center mr-4 transition-all duration-300 ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg'
                        : 'bg-gray-100 group-hover:bg-gray-200'
                    }`}>
                      <IconComponent className={`h-6 w-6 transition-all duration-300 ${
                        isSelected ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold text-lg transition-all duration-300 ${
                        isSelected ? 'text-amber-900' : 'text-gray-900'
                      }`}>
                        {type.label}
                      </div>
                      <div className={`text-sm transition-all duration-300 ${
                        isSelected ? 'text-amber-700' : 'text-gray-500'
                      }`}>
                        {type.description}
                      </div>
                    </div>

                    {/* Indicador de selección */}
                    <div className="flex-shrink-0">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500'
                          : 'border-gray-300'
                      }`}>
                        {isSelected && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

            {/* Formulario de login moderno */}
            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="space-y-8">
                {/* Campo de email/documento */}
                <div className="space-y-3">
                  <label htmlFor="identifier" className="block text-sm font-bold text-gray-800 uppercase tracking-wide">
                    Email o Documento
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
                      <FaUser className={`h-5 w-5 transition-all duration-300 ${
                        errors.identifier ? 'text-red-400' : 'text-gray-400 group-focus-within:text-amber-500 group-focus-within:scale-110'
                      }`} />
                    </div>
                    <input
                      id="identifier"
                      name="identifier"
                      type="text"
                      autoComplete="username"
                      required
                      value={formData.identifier}
                      onChange={handleInputChange}
                      className={`block w-full pl-14 pr-5 py-5 border-2 rounded-2xl text-gray-900 placeholder-gray-400 transition-all duration-300 text-lg font-medium ${
                        errors.identifier
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50'
                          : 'border-gray-200 focus:border-amber-500 focus:ring-amber-500 hover:border-gray-300 focus:shadow-xl hover:shadow-lg'
                      } focus:outline-none focus:ring-4 focus:ring-opacity-30 shadow-sm backdrop-blur-sm bg-white/90`}
                      placeholder={isEmailFormat(formData.identifier) ? "ejemplo@correo.com" : "Número de documento"}
                    />
                  </div>
                  {errors.identifier && (
                    <div className="mt-3 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
                      <p className="text-sm text-red-700 flex items-center font-medium">
                        <FaExclamationTriangle className="h-4 w-4 mr-3 text-red-500" />
                        {errors.identifier}
                      </p>
                    </div>
                  )}
                </div>

                {/* Campo de contraseña */}
                <div className="space-y-3">
                  <label htmlFor="password" className="block text-sm font-bold text-gray-800 uppercase tracking-wide">
                    Contraseña
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
                      <FaLock className={`h-5 w-5 transition-all duration-300 ${
                        errors.password ? 'text-red-400' : 'text-gray-400 group-focus-within:text-amber-500 group-focus-within:scale-110'
                      }`} />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`block w-full pl-14 pr-14 py-5 border-2 rounded-2xl text-gray-900 placeholder-gray-400 transition-all duration-300 text-lg font-medium ${
                        errors.password
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50'
                          : 'border-gray-200 focus:border-amber-500 focus:ring-amber-500 hover:border-gray-300 focus:shadow-xl hover:shadow-lg'
                      } focus:outline-none focus:ring-4 focus:ring-opacity-30 shadow-sm backdrop-blur-sm bg-white/90`}
                      placeholder="Ingresa tu contraseña"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-5 flex items-center group z-10"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <div className="p-1 rounded-lg hover:bg-gray-100 transition-all duration-300">
                        {showPassword ? (
                          <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-amber-500 transition-all duration-300 group-hover:scale-110" />
                        ) : (
                          <FaEye className="h-5 w-5 text-gray-400 hover:text-amber-500 transition-all duration-300 group-hover:scale-110" />
                        )}
                      </div>
                    </button>
                  </div>
                  {errors.password && (
                    <div className="mt-3 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
                      <p className="text-sm text-red-700 flex items-center font-medium">
                        <FaExclamationTriangle className="h-4 w-4 mr-3 text-red-500" />
                        {errors.password}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Opciones adicionales modernas */}
              <div className="flex items-center justify-between py-6">
                <div className="flex items-center group">
                  <div className="relative">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-5 w-5 text-amber-600 focus:ring-amber-500 border-2 border-gray-300 rounded-lg transition-all duration-300 hover:border-amber-400 focus:ring-4 focus:ring-amber-200"
                    />
                  </div>
                  <label htmlFor="remember-me" className="ml-4 block text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors duration-300 cursor-pointer">
                    Recordarme
                  </label>
                </div>
                <div className="text-sm">
                  <a
                    href="#"
                    className="font-bold text-amber-600 hover:text-amber-700 transition-all duration-300 hover:underline hover:scale-105 inline-block"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </div>

              {/* Botón de submit moderno */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`group relative w-full flex justify-center items-center py-6 px-8 border border-transparent text-lg font-black rounded-2xl text-white transition-all duration-300 overflow-hidden ${
                    loading
                      ? 'bg-amber-400 cursor-not-allowed opacity-75'
                      : 'bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-700 hover:via-orange-700 hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-amber-500 focus:ring-opacity-50 transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl hover:shadow-3xl'
                  }`}
                >
                  {/* Efecto de brillo */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin h-6 w-6 mr-4" />
                      <span className="relative z-10">Iniciando sesión...</span>
                    </>
                  ) : (
                    <>
                      <FaUser className="h-6 w-6 mr-4 group-hover:scale-110 transition-transform duration-300" />
                      <span className="relative z-10">Iniciar Sesión</span>
                    </>
                  )}
                </button>
              </div>

              {/* Separador moderno */}
              <div className="relative py-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-6 py-2 bg-white text-gray-500 font-bold uppercase tracking-wider rounded-full border-2 border-gray-200">
                    ¿Nuevo en BAT-7?
                  </span>
                </div>
              </div>

              {/* Enlaces adicionales modernos */}
              <div className="text-center">
                <p className="text-base text-gray-600">
                  ¿No tienes cuenta?{' '}
                  <Link
                    to="/register"
                    className="font-black text-amber-600 hover:text-amber-700 transition-all duration-300 hover:underline hover:scale-105 inline-block"
                  >
                    Regístrate aquí
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
