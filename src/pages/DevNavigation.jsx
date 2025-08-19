import React from 'react';
import { Link } from 'react-router-dom';
import { useNoAuth } from '../context/NoAuthContext';
import { 
  FaHome, 
  FaUserGraduate, 
  FaUserMd, 
  FaUserShield, 
  FaBrain,
  FaCalculator,
  FaCube,
  FaLightbulb,
  FaEye,
  FaCog,
  FaSpellCheck,
  FaChartBar,
  FaClipboardList,
  FaTachometerAlt
} from 'react-icons/fa';

/**
 * Página de navegación para desarrollo sin autenticación
 */
const DevNavigation = () => {
  const { setUserType, userRole } = useNoAuth();

  const userTypes = [
    { id: 'candidato', label: 'Candidato', icon: FaUserGraduate, color: 'bg-blue-500' },
    { id: 'psicologo', label: 'Psicólogo', icon: FaUserMd, color: 'bg-green-500' },
    { id: 'administrador', label: 'Administrador', icon: FaUserShield, color: 'bg-red-500' }
  ];

  const evaluations = [
    { path: '/test/verbal', label: 'Evaluación Verbal', icon: FaBrain },
    { path: '/test/numerico', label: 'Evaluación Numérica', icon: FaCalculator },
    { path: '/test/espacial', label: 'Evaluación Espacial', icon: FaCube },
    { path: '/test/razonamiento', label: 'Razonamiento', icon: FaLightbulb },
    { path: '/test/atencion', label: 'Atención', icon: FaEye },
    { path: '/test/mecanico', label: 'Mecánico', icon: FaCog },
    { path: '/test/ortografia', label: 'Ortografía', icon: FaSpellCheck }
  ];

  const adminPages = [
    { path: '/admin/administration', label: 'Administración' },
    { path: '/admin/institutions', label: 'Instituciones' },
    { path: '/admin/psychologists', label: 'Psicólogos' },
    { path: '/admin/diagnostics', label: 'Diagnósticos' },
    { path: '/dashboard', label: 'Dashboard' }
  ];

  const otherPages = [
    { path: '/home', label: 'Inicio', icon: FaHome },
    { path: '/test/resultados', label: 'Resultados', icon: FaChartBar },
    { path: '/cuestionario', label: 'Cuestionarios', icon: FaClipboardList },
    { path: '/simple', label: 'Diagnóstico Simple', icon: FaTachometerAlt }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            BAT-7 - Navegación de Desarrollo
          </h1>
          <p className="text-gray-600">
            Acceso libre a todas las funcionalidades (sin autenticación)
          </p>
        </div>

        {/* Selector de Rol */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Cambiar Rol de Usuario</h2>
          <div className="flex flex-wrap gap-4">
            {userTypes.map((type) => {
              const Icon = type.icon;
              const isActive = userRole === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setUserType(type.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive 
                      ? `${type.color} text-white` 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{type.label}</span>
                  {isActive && <span className="text-xs">(Activo)</span>}
                </button>
              );
            })}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Rol actual: <strong>{userRole}</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Evaluaciones de Aptitudes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">
              Evaluaciones de Aptitudes
            </h2>
            <div className="space-y-2">
              {evaluations.map((evaluation) => {
                const Icon = evaluation.icon;
                return (
                  <Link
                    key={evaluation.path}
                    to={evaluation.path}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 transition-colors group"
                  >
                    <Icon className="w-5 h-5 text-blue-500 group-hover:text-blue-600" />
                    <span className="text-gray-700 group-hover:text-blue-600">
                      {evaluation.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Páginas Generales */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-600">
              Páginas Generales
            </h2>
            <div className="space-y-2">
              {otherPages.map((page) => {
                const Icon = page.icon;
                return (
                  <Link
                    key={page.path}
                    to={page.path}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-green-50 transition-colors group"
                  >
                    <Icon className="w-5 h-5 text-green-500 group-hover:text-green-600" />
                    <span className="text-gray-700 group-hover:text-green-600">
                      {page.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Páginas de Administración */}
          <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-red-600">
              Páginas de Administración
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {adminPages.map((page) => (
                <Link
                  key={page.path}
                  to={page.path}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 transition-colors group"
                >
                  <FaUserShield className="w-5 h-5 text-red-500 group-hover:text-red-600" />
                  <span className="text-gray-700 group-hover:text-red-600">
                    {page.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p className="text-sm">
            Modo de desarrollo - Todas las funcionalidades están disponibles sin autenticación
          </p>
        </div>
      </div>
    </div>
  );
};

export default DevNavigation;
