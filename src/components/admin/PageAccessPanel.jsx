import React, { useState } from 'react';
import { FaSearch, FaFilter, FaUsers, FaInfo } from 'react-icons/fa';

const PageAccessPanel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Páginas del sistema BAT-7
  const [pages, setPages] = useState([
    {
      id: 1,
      name: 'Inicio',
      path: '/home',
      description: 'Página principal del sistema',
      status: 'Activa',
      permissions: {
        administrador: true,
        psicologo: true,
        candidato: true
      },
      specificUsers: ['U1', 'U2']
    },
    {
      id: 2,
      name: 'Cuestionario',
      path: '/cuestionario',
      description: 'Evaluaciones psicológicas BAT-7',
      status: 'Activa',
      permissions: {
        administrador: true,
        psicologo: true,
        candidato: true
      },
      specificUsers: []
    },
    {
      id: 3,
      name: 'Resultados',
      path: '/resultados',
      description: 'Visualización de resultados de evaluaciones',
      status: 'Activa',
      permissions: {
        administrador: true,
        psicologo: true,
        candidato: false
      },
      specificUsers: []
    },
    {
      id: 4,
      name: 'Informes',
      path: '/informes',
      description: 'Generación y gestión de informes',
      status: 'Activa',
      permissions: {
        administrador: true,
        psicologo: true,
        candidato: false
      },
      specificUsers: []
    },
    {
      id: 5,
      name: 'Administración',
      path: '/admin/administration',
      description: 'Panel de administración del sistema',
      status: 'Activa',
      permissions: {
        administrador: true,
        psicologo: false,
        candidato: false
      },
      specificUsers: []
    },
    {
      id: 6,
      name: 'Configuración',
      path: '/configuracion',
      description: 'Configuración del sistema',
      status: 'Activa',
      permissions: {
        administrador: true,
        psicologo: false,
        candidato: false
      },
      specificUsers: []
    },
    {
      id: 7,
      name: 'Pacientes',
      path: '/pacientes',
      description: 'Gestión de pacientes',
      status: 'Activa',
      permissions: {
        administrador: true,
        psicologo: true,
        candidato: false
      },
      specificUsers: []
    },
    {
      id: 8,
      name: 'Soporte',
      path: '/soporte',
      description: 'Centro de ayuda y soporte técnico',
      status: 'Activa',
      permissions: {
        administrador: true,
        psicologo: true,
        candidato: true
      },
      specificUsers: []
    },
    {
      id: 9,
      name: 'Ayuda',
      path: '/ayuda',
      description: 'Documentación y guías de usuario',
      status: 'Activa',
      permissions: {
        administrador: true,
        psicologo: true,
        candidato: true
      },
      specificUsers: []
    }
  ]);

  const togglePermission = (pageId, role) => {
    setPages(pages.map(page =>
      page.id === pageId
        ? {
            ...page,
            permissions: {
              ...page.permissions,
              [role]: !page.permissions[role]
            }
          }
        : page
    ));
  };

  const filteredPages = pages.filter(page =>
    page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (role) => {
    switch (role) {
      case 'administrador':
        return '👑';
      case 'psicologo':
        return '👨‍⚕️';
      case 'candidato':
        return '🎓';
      default:
        return '👤';
    }
  };

  const getRoleColor = (role, hasAccess) => {
    if (!hasAccess) return 'bg-gray-300';

    switch (role) {
      case 'administrador':
        return 'bg-blue-500';
      case 'psicologo':
        return 'bg-green-500';
      case 'candidato':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <FaUsers className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Control de Acceso a Páginas</h2>
          <p className="text-gray-600">Gestiona qué roles pueden acceder a cada página del sistema. Los cambios se aplican inmediatamente.</p>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar rutas por nombre o path..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <FaFilter className="w-4 h-4" />
            <span>Filtros Avanzados</span>
          </button>
        </div>
      </div>

      {/* Tabla de control de acceso */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header de la tabla */}
        <div className="bg-blue-600 text-white">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 font-medium">
            <div className="col-span-2">Página</div>
            <div className="col-span-2">Estado</div>
            <div className="col-span-2 text-center">👑 Administrador</div>
            <div className="col-span-2 text-center">👨‍⚕️ Psicólogo</div>
            <div className="col-span-2 text-center">🎓 Candidato</div>
            <div className="col-span-1 text-center">👥 Usuarios Específicos</div>
            <div className="col-span-1 text-center">Info</div>
          </div>
        </div>

        {/* Filas de la tabla */}
        <div className="divide-y divide-gray-200">
          {filteredPages.map((page) => (
            <div key={page.id} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50">
              {/* Nombre de la página */}
              <div className="col-span-2">
                <div className="font-medium text-gray-900">{page.name}</div>
                <div className="text-sm text-gray-500">{page.path}</div>
                <div className="text-xs text-gray-400">{page.description}</div>
              </div>

              {/* Estado */}
              <div className="col-span-2 flex items-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  page.status === 'Activa'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {page.status}
                </span>
              </div>

              {/* Permisos por rol */}
              {['administrador', 'psicologo', 'candidato'].map((role) => (
                <div key={role} className="col-span-2 flex justify-center">
                  <button
                    onClick={() => togglePermission(page.id, role)}
                    className={`w-12 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      page.permissions[role]
                        ? getRoleColor(role, true)
                        : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out ${
                      page.permissions[role] ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              ))}

              {/* Usuarios específicos */}
              <div className="col-span-1 flex justify-center">
                <button className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200">
                  👥 {page.specificUsers.length} usuario(s)
                </button>
              </div>

              {/* Info */}
              <div className="col-span-1 flex justify-center">
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <FaInfo className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{pages.length}</div>
          <div className="text-sm text-gray-600">Total de Páginas</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {pages.filter(p => p.status === 'Activa').length}
          </div>
          <div className="text-sm text-gray-600">Páginas Activas</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-orange-600">
            {pages.filter(p => p.permissions.candidato).length}
          </div>
          <div className="text-sm text-gray-600">Accesibles a Candidatos</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">
            {pages.filter(p => p.specificUsers.length > 0).length}
          </div>
          <div className="text-sm text-gray-600">Con Usuarios Específicos</div>
        </div>
      </div>
    </div>
  );
};

export default PageAccessPanel;
