import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMinimalAuth } from '../../context/MinimalAuthContext';
import { FaUser, FaLock, FaSpinner } from 'react-icons/fa';

/**
 * Página de login simple para testing
 */
const SimpleLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('candidato');
  const { login, loading, error, simulateLogin } = useMinimalAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await login(email, password);
    
    if (result.success) {
      // Redirigir según el rol
      const userType = result.data.tipo_usuario;
      switch (userType) {
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
    }
  };

  const handleQuickLogin = (role) => {
    simulateLogin(role);
    
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
  };

  const userTypes = [
    { id: 'candidato', label: 'Candidato', email: 'candidato1@email.com' },
    { id: 'psicologo', label: 'Psicólogo', email: 'psicologo1@bat7.com' },
    { id: 'administrador', label: 'Administrador', email: 'admin@bat7.com' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 text-center">
            <h1 className="text-2xl font-bold mb-2">BAT-7 Sistema</h1>
            <p className="text-blue-100">Evaluación de Aptitudes</p>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="usuario@email.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="password"
                    required
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </form>

            {/* Quick Login */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">
                Acceso Rápido (Demo)
              </h3>
              <div className="space-y-2">
                {userTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleQuickLogin(type.id)}
                    className="w-full text-left px-3 py-2 text-sm border border-gray-200 rounded-md hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="font-medium">{type.label}</div>
                    <div className="text-gray-500 text-xs">{type.email}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Credentials Info */}
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-3">
              <h4 className="text-sm font-medium text-blue-800 mb-1">
                Credenciales de Prueba:
              </h4>
              <div className="text-xs text-blue-700 space-y-1">
                <div>• Email: cualquiera de los emails de arriba</div>
                <div>• Contraseña: <code>password</code></div>
                <div>• O usa "Acceso Rápido" para login automático</div>
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-4 text-center">
              <a
                href="/simple"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Volver al diagnóstico
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleLogin;
