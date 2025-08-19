import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AuthDiagnosticPanel from '../../components/dashboard/AuthDiagnosticPanel';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  console.log('[Dashboard] Renderizando con usuario:', user ? {
    id: user.id,
    name: user.name,
    role: user.role,
    tipo_usuario: user.tipo_usuario
  } : 'No hay usuario');

  // Efecto para verificar autenticación
  useEffect(() => {
    console.log('[Dashboard] useEffect - Verificando autenticación:', {
      isAuthenticated,
      userPresent: !!user,
      userRole: user?.role || user?.tipo_usuario || 'desconocido'
    });

    if (!isAuthenticated) {
      console.log('[Dashboard] Usuario no autenticado, redirigiendo a login');
      navigate('/login');
      return;
    }

    // Verificar si hay datos en localStorage/sessionStorage
    const sessionUser = sessionStorage.getItem('user');
    const localUser = localStorage.getItem('user');

    console.log('[Dashboard] Verificando datos en almacenamiento:', {
      sessionStorage: !!sessionUser,
      localStorage: !!localUser
    });

    // Si no hay usuario en el estado pero sí en almacenamiento, intentar usarlo
    if (!user && (sessionUser || localUser)) {
      try {
        const storedUser = JSON.parse(sessionUser || localUser);
        console.log('[Dashboard] Usando datos de usuario del almacenamiento:', {
          id: storedUser.id,
          email: storedUser.email,
          role: storedUser.role,
          tipo_usuario: storedUser.tipo_usuario
        });
      } catch (error) {
        console.error('[Dashboard] Error al parsear datos de usuario almacenados:', error);
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Determinar el contenido basado en el rol
  const renderRoleSpecificContent = () => {
    // Obtener el rol del usuario, considerando tanto role como tipo_usuario
    const userRole = user?.role?.toLowerCase() || user?.tipo_usuario?.toLowerCase() || '';
    console.log('[Dashboard] Determinando contenido para rol:', userRole);

    if (userRole.includes('admin') || userRole.includes('administrador')) {
      console.log('[Dashboard] Mostrando panel de administrador');
      return (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Panel de Administrador</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {adminCards.map((card, index) => (
              <DashboardCard key={index} {...card} navigate={navigate} />
            ))}
          </div>
        </div>
      );
    } else if (userRole.includes('professional') || userRole.includes('psicologo')) {
      console.log('[Dashboard] Mostrando panel de profesional');
      return (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Panel de Profesional</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {professionalCards.map((card, index) => (
              <DashboardCard key={index} {...card} navigate={navigate} />
            ))}
          </div>
        </div>
      );
    } else {
      console.log('[Dashboard] Mostrando panel de estudiante');
      return (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Mis Tests</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {studentCards.map((card, index) => (
              <DashboardCard key={index} {...card} navigate={navigate} />
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {user ? `Bienvenido, ${user.name}` : 'Bienvenido a BAT-7'}
        </h2>
      </div>

      {/* Panel de diagnóstico de autenticación */}
      <div className="mb-8">
        <AuthDiagnosticPanel />

        {/* Acceso directo a administración para solucionar problemas */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-2">Acceso rápido</h3>
          <p className="text-sm text-blue-700 mb-3">
            Si estás teniendo problemas para acceder a ciertas páginas, puedes usar estos enlaces directos:
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() => window.location.href = '/dashboard/admin/administration'}
              className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Ir a Administración
            </button>
          </div>
        </div>
      </div>

      {renderRoleSpecificContent()}

      <div className="mt-10">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Actividad Reciente</h3>
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {activityItems.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {activityItems.map((item, index) => (
                <li key={index} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.iconBg}`}>
                      <i className={`fas fa-${item.icon} text-white`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.timestamp}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No hay actividad reciente
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente de tarjeta reutilizable
const DashboardCard = ({ title, value, icon, iconBg, link, navigate }) => {
  const handleClick = (e) => {
    if (link && link.url) {
      e.preventDefault();
      console.log('[DashboardCard] Navegando a:', link.url);
      navigate(link.url);
    }
  };

  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${iconBg}`}>
            <i className={`fas fa-${icon} text-white text-xl`}></i>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      {link && (
        <div className="bg-gray-50 px-4 py-4 sm:px-6">
          <div className="text-sm">
            <button
              onClick={handleClick}
              className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
            >
              {link.text} <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Datos de ejemplo para las tarjetas
const adminCards = [
  {
    title: 'Total de usuarios',
    value: '267',
    icon: 'users',
    iconBg: 'bg-blue-500',
    link: { text: 'Ver todos los usuarios', url: '/admin/users' }
  },
  {
    title: 'Instituciones',
    value: '12',
    icon: 'building',
    iconBg: 'bg-green-500',
    link: { text: 'Administrar instituciones', url: '/admin/institutions' }
  },
  {
    title: 'Tests completados',
    value: '1,254',
    icon: 'clipboard-check',
    iconBg: 'bg-purple-500',
    link: { text: 'Ver todos los resultados', url: '/admin/reports' }
  }
];

const professionalCards = [
  {
    title: 'Candidatos',
    value: '42',
    icon: 'user-tie',
    iconBg: 'bg-blue-500',
    link: { text: 'Gestionar candidatos', url: '/professional/candidates' }
  },
  {
    title: 'Estudiantes activos',
    value: '38',
    icon: 'users',
    iconBg: 'bg-green-500',
    link: { text: 'Ver todos los estudiantes', url: '/professional/students' }
  },
  {
    title: 'Tests asignados',
    value: '18',
    icon: 'clipboard-list',
    iconBg: 'bg-yellow-500',
    link: { text: 'Administrar tests', url: '/professional/tests' }
  },
  {
    title: 'Tests completados',
    value: '127',
    icon: 'clipboard-check',
    iconBg: 'bg-green-500',
    link: { text: 'Ver todos los resultados', url: '/professional/reports' }
  }
];

const studentCards = [
  {
    title: 'Batería Completa BAT-7',
    value: 'Pendiente',
    icon: 'clipboard-list',
    iconBg: 'bg-blue-500',
    link: { text: 'Iniciar test', url: '/test/instructions/bat7' }
  },
  {
    title: 'Test de Aptitud Verbal',
    value: '8 días restantes',
    icon: 'file-alt',
    iconBg: 'bg-yellow-500',
    link: { text: 'Iniciar test', url: '/test/instructions/verbal' }
  }
];

// Datos de ejemplo para la actividad reciente
const activityItems = [
  {
    title: 'Has completado el Test de Aptitud Espacial',
    icon: 'check-circle',
    iconBg: 'bg-green-500',
    timestamp: 'Hace 2 días'
  },
  {
    title: 'Se te ha asignado un nuevo test: Batería Completa BAT-7',
    icon: 'clipboard-list',
    iconBg: 'bg-blue-500',
    timestamp: 'Hace 3 días'
  },
  {
    title: 'Has completado el Test de Razonamiento',
    icon: 'check-circle',
    iconBg: 'bg-green-500',
    timestamp: 'Hace 1 semana'
  }
];

export default Dashboard;