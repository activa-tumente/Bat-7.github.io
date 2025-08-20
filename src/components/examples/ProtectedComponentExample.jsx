import React from 'react';
import { 
  withRoleProtection, 
  withAdminProtection, 
  withPsychologistProtection,
  withStudentProtection 
} from '../../hoc/withRoleProtection';
import { useRoleBasedAccess } from '../../hooks/useRoleBasedAccess';

/**
 * Ejemplos de uso del sistema de protección de roles
 */

// Componente base para demostración
const BaseComponent = ({ title, description, userRole }) => (
  <div className="bg-white rounded-lg shadow-md p-6 m-4">
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-4">{description}</p>
    <div className="bg-blue-50 border border-blue-200 rounded p-3">
      <p className="text-sm text-blue-800">
        <span className="font-medium">Acceso permitido para:</span> {userRole}
      </p>
    </div>
  </div>
);

// Componente solo para administradores
const AdminOnlyComponent = withAdminProtection(({ userRole }) => (
  <BaseComponent
    title="Panel de Administración"
    description="Este componente solo es visible para administradores."
    userRole={userRole}
  />
));

// Componente para psicólogos y administradores
const PsychologistComponent = withPsychologistProtection(({ userRole }) => (
  <BaseComponent
    title="Gestión de Candidatos"
    description="Este componente es visible para psicólogos y administradores."
    userRole={userRole}
  />
));

// Componente solo para estudiantes
const StudentComponent = withStudentProtection(({ userRole }) => (
  <BaseComponent
    title="Área de Estudiante"
    description="Este componente solo es visible para estudiantes/candidatos."
    userRole={userRole}
  />
));

// Componente con roles personalizados
const CustomRolesComponent = withRoleProtection(
  ({ userRole }) => (
    <BaseComponent
      title="Componente con Roles Personalizados"
      description="Este componente tiene una configuración de roles específica."
      userRole={userRole}
    />
  ),
  ['psicologo', 'administrador'], // Roles permitidos
  {
    showAccessDenied: true,
    redirectTo: '/home'
  }
);

// Componente con fallback personalizado
const CustomFallbackComponent = ({ userRole, requiredRoles }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4">
    <h3 className="text-lg font-semibold text-red-900 mb-2">
      Acceso Restringido
    </h3>
    <p className="text-red-700 mb-4">
      Este contenido requiere permisos especiales.
    </p>
    <div className="text-sm text-red-600">
      <p><strong>Tu rol:</strong> {userRole}</p>
      <p><strong>Roles requeridos:</strong> {requiredRoles.join(', ')}</p>
    </div>
  </div>
);

const ComponentWithCustomFallback = withRoleProtection(
  ({ userRole }) => (
    <BaseComponent
      title="Componente con Fallback Personalizado"
      description="Este componente muestra un mensaje personalizado cuando no tienes acceso."
      userRole={userRole}
    />
  ),
  ['administrador'],
  {
    fallbackComponent: CustomFallbackComponent,
    showAccessDenied: false
  }
);

// Componente principal que demuestra todos los ejemplos
const ProtectedComponentExample = () => {
  const { userRole, permissions, isAuthenticated } = useRoleBasedAccess();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Debes iniciar sesión
          </h2>
          <p className="text-gray-600">
            Para ver los ejemplos de componentes protegidos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Ejemplos de Componentes Protegidos
          </h1>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
            <p className="text-blue-800">
              <span className="font-medium">Usuario actual:</span> {userRole}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información de permisos */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Permisos del Usuario Actual
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {Object.entries(permissions).map(([permission, allowed]) => (
                <div
                  key={permission}
                  className={`p-2 rounded ${
                    allowed 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-gray-50 text-gray-500 border border-gray-200'
                  }`}
                >
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                    allowed ? 'bg-green-500' : 'bg-gray-400'
                  }`}></span>
                  {permission.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </div>
              ))}
            </div>
          </div>

          {/* Componentes protegidos */}
          <AdminOnlyComponent userRole={userRole} />
          <PsychologistComponent userRole={userRole} />
          <StudentComponent userRole={userRole} />
          <CustomRolesComponent userRole={userRole} />
          <ComponentWithCustomFallback userRole={userRole} />
        </div>
      </div>
    </div>
  );
};

export default ProtectedComponentExample;
