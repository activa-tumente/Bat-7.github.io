import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaSpinner } from 'react-icons/fa';

/**
 * Página de login básica sin dependencias complejas
 */
const BasicLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('candidato');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simular login
    setTimeout(() => {
      // Guardar datos básicos en localStorage
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', selectedRole);
      localStorage.setItem('userEmail', email);
      
      setLoading(false);
      
      // Redirigir según el rol
      switch (selectedRole) {
        case 'administrador':
          navigate('/admin/administration');
          break;
        case 'psicologo':
          navigate('/admin/candidates');
          break;
        case 'candidato':
        default:
          navigate('/home');
          break;
      }
    }, 1000);
  };

  const handleQuickLogin = (role) => {
    setSelectedRole(role);
    setLoading(true);
    
    setTimeout(() => {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', role);
      localStorage.setItem('userEmail', 'test@example.com');
      
      setLoading(false);
      
      // Redirigir según el rol
      switch (role) {
        case 'administrador':
          navigate('/admin/administration');
          break;
        case 'psicologo':
          navigate('/admin/candidates');
          break;
        case 'candidato':
        default:
          navigate('/home');
          break;
      }
    }, 500);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Blue Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border border-white rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 border border-white rounded-full"></div>
          <div className="absolute top-1/2 left-10 w-16 h-16 border border-white rounded-full"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          {/* Logo and Title */}
          <div className="mb-12">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mr-4">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold">BAT-7</h1>
                <p className="text-blue-200">Sistema de Evaluación</p>
              </div>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-4">
              Bienvenido al<br />
              <span className="text-orange-400">Futuro de la Evaluación</span><br />
              <span className="text-blue-200">Psicométrica</span>
            </h2>
            <p className="text-blue-200 text-lg leading-relaxed">
              Plataforma de nueva generación para evaluaciones psicológicas inteligentes y análisis avanzado
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-4">
                <span className="text-white text-sm">✓</span>
              </div>
              <div>
                <h3 className="font-semibold">Evaluaciones Inteligentes</h3>
                <p className="text-blue-200 text-sm">Adaptativas y avanzadas</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-4">
                <span className="text-white text-sm">✓</span>
              </div>
              <div>
                <h3 className="font-semibold">Dashboard Avanzado</h3>
                <p className="text-blue-200 text-sm">Análisis en tiempo real</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-4">
                <span className="text-white text-sm">✓</span>
              </div>
              <div>
                <h3 className="font-semibold">Seguridad Total</h3>
                <p className="text-blue-200 text-sm">Protección de datos garantizada</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">BAT-7</h1>
            <p className="text-gray-600">Sistema de Evaluación</p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  TIPO DE USUARIO
                </label>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-orange-50 transition-colors">
                    <input
                      type="radio"
                      name="userType"
                      value="candidato"
                      checked={selectedRole === 'candidato'}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                      selectedRole === 'candidato' ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                    }`}>
                      {selectedRole === 'candidato' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                        <FaUser className="text-white text-sm" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">Candidato</div>
                        <div className="text-sm text-gray-500">Acceso para realizar evaluaciones psicométricas</div>
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="userType"
                      value="psicologo"
                      checked={selectedRole === 'psicologo'}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                      selectedRole === 'psicologo' ? 'border-gray-500 bg-gray-500' : 'border-gray-300'
                    }`}>
                      {selectedRole === 'psicologo' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center mr-3">
                        <FaUser className="text-white text-sm" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">Psicólogo</div>
                        <div className="text-sm text-gray-500">Acceso para gestionar candidatos y resultados</div>
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="userType"
                      value="administrador"
                      checked={selectedRole === 'administrador'}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                      selectedRole === 'administrador' ? 'border-gray-500 bg-gray-500' : 'border-gray-300'
                    }`}>
                      {selectedRole === 'administrador' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center mr-3">
                        <FaUser className="text-white text-sm" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">Administrador</div>
                        <div className="text-sm text-gray-500">Acceso completo al sistema</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Email/Document */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  EMAIL O DOCUMENTO
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Número de documento"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CONTRASEÑA
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Ingresa tu contraseña"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                  <span className="ml-2 text-sm text-gray-600">Recordarme</span>
                </label>
                <a href="#" className="text-sm text-orange-500 hover:text-orange-600">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <FaUser className="mr-2" />
                    Iniciar Sesión
                  </>
                )}
              </button>
            </form>

            {/* Quick Login Buttons - Disabled for production */}
            {/*
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center mb-3">Acceso rápido para testing:</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleQuickLogin('administrador')}
                  disabled={loading}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  Admin
                </button>
                <button
                  onClick={() => handleQuickLogin('psicologo')}
                  disabled={loading}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  Psicólogo
                </button>
                <button
                  onClick={() => handleQuickLogin('candidato')}
                  disabled={loading}
                  className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                >
                  Candidato
                </button>
              </div>
            </div>
            */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicLogin;
