import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNoAuth } from '../../context/NoAuthContext';
import PageTransition from '../transitions/PageTransition';
import AnimatedTitle from '../ui/AnimatedTitle';
import '../../styles/userMenu.css';
import '../../styles/sidebar.css';

// Componente Sidebar con favoritos
const Sidebar = ({ isOpen, toggleSidebar, onLogout }) => {
  const location = useLocation();

  // Inicializar favoritos desde localStorage o usar valores predeterminados
  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem('sidebarFavorites');
    return savedFavorites ? JSON.parse(savedFavorites) : {
      dashboard: false,
      home: false,
      patients: false,
      tests: false,
      reports: false,
      administration: false,
      settings: false,
      help: false
    };
  });

  // Guardar favoritos en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('sidebarFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // Toggle para favoritos
  const toggleFavorite = (key, e) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Verificar si una ruta está activa
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }

    return location.pathname === path ||
           (location.pathname.startsWith(path) &&
            (location.pathname.length === path.length ||
             location.pathname[path.length] === '/'));
  };

  // Elementos del menú organizados por secciones
  const menuSections = [
    {
      title: 'Navegación Principal',
      items: [
        { name: 'Inicio', path: '/home', icon: 'home', key: 'home' },
        { name: 'Pacientes', path: '/admin/patients', icon: 'users', key: 'patients' },
        { name: 'Cuestionario', path: '/student/questionnaire', icon: 'clipboard-list', key: 'tests' },
        { name: 'Resultados', path: '/admin/reports', icon: 'chart-bar', key: 'reports' }
      ]
    },
    {
      title: 'Administración',
      items: [
        { name: 'Panel Admin', path: '/admin/administration', icon: 'shield-alt', key: 'administration' },
        { name: 'Configuración', path: '/configuracion', icon: 'cog', key: 'settings' }
      ]
    },
    {
      title: 'Soporte',
      items: [
        { name: 'Ayuda', path: '/help', icon: 'question-circle', key: 'help' }
      ]
    }
  ];

  // Crear lista plana para compatibilidad con favoritos
  const menuItems = menuSections.flatMap(section => section.items);

  // Filtrar favoritos
  const favoriteItems = menuItems.filter(item => favorites[item.key]);

  return (
    <div className={`sidebar bg-[#121940] text-[#a4b1cd] fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-in-out
                     ${isOpen ? 'w-64' : 'w-[70px]'}`}>
      <div className="sidebar-header p-5 flex justify-between items-center border-b border-opacity-10 border-white">
        {isOpen && (
          <h1 className="sidebar-logo text-3xl font-bold text-white text-center flex-1">
            Activatu<span className="text-[#ffda0a]">mente</span>
          </h1>
        )}
        <button
          onClick={toggleSidebar}
          className="collapse-button text-[#a4b1cd] cursor-pointer hover:text-white"
          title={isOpen ? "Contraer menú" : "Expandir menú"}
          aria-label={isOpen ? "Contraer menú" : "Expandir menú"}
        >
          <i className={`fas ${isOpen ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
        </button>
      </div>

      {/* Sección de favoritos */}
      {favoriteItems.length > 0 && (
        <div className="sidebar-section py-2 border-b border-opacity-10 border-white">
          {isOpen && (
            <h2 className="uppercase text-xs px-5 py-2 tracking-wider font-semibold text-gray-400">
              FAVORITOS
            </h2>
          )}
          <ul className="menu-list">
            {favoriteItems.map((item) => (
              <li
                key={`fav-${item.key}`}
                className={`py-3 px-5 hover:bg-opacity-10 hover:bg-white transition-all duration-300 relative transform hover:translate-x-1
                          ${isActive(item.path) ? 'bg-[#ffda0a] bg-opacity-20 border-l-4 border-[#ffda0a] shadow-lg' : ''}`}
              >
                <div className="flex items-center justify-between w-full">
                  <Link
                    to={item.path}
                    className={`flex items-center flex-grow transition-colors duration-200 ${isActive(item.path) ? 'text-[#ffda0a] font-semibold' : 'text-[#a4b1cd] hover:text-white'}`}
                  >
                    <i className={`fas fa-${item.icon} ${!isOpen ? '' : 'mr-3'} w-5 text-center transition-colors duration-200 ${isActive(item.path) ? 'text-[#ffda0a]' : ''}`}></i>
                    {isOpen && <span>{item.name}</span>}
                  </Link>
                  {isOpen && (
                    <span
                      className="text-[#ffda0a] cursor-pointer hover:scale-110 transition-transform duration-200"
                      onClick={(e) => toggleFavorite(item.key, e)}
                      title="Quitar de favoritos"
                    >
                      <i className="fas fa-star"></i>
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Menú principal organizado por secciones */}
      <div className="sidebar-content py-2 flex-1 overflow-y-auto">
        {menuSections.map((section, sectionIndex) => (
          <div key={section.title} className="mb-4">
            {/* Título de sección (solo visible cuando está abierto) */}
            {isOpen && (
              <div className="px-5 py-2 mb-2">
                <h3 className="section-title text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {section.title}
                </h3>
              </div>
            )}

            {/* Separador visual cuando está cerrado */}
            {!isOpen && sectionIndex > 0 && (
              <div className="section-separator"></div>
            )}

            {/* Items de la sección */}
            <ul className="menu-list space-y-1">
              {section.items.map((item) => (
                <li
                  key={item.name}
                  className={`menu-item mx-2 rounded-lg transition-all duration-300 relative transform hover:translate-x-1
                            ${isActive(item.path) ? 'active bg-[#ffda0a] bg-opacity-20 border-l-4 border-[#ffda0a] shadow-lg' : 'hover:bg-white hover:bg-opacity-10'}`}
                >
                  <div className="flex items-center justify-between w-full px-3 py-3">
                    <Link
                      to={item.path}
                      className={`flex items-center flex-grow transition-colors duration-200 ${isActive(item.path) ? 'text-[#ffda0a] font-semibold' : 'text-[#a4b1cd] hover:text-white'}`}
                    >
                      <i className={`menu-icon fas fa-${item.icon} ${!isOpen ? 'text-center' : 'mr-4'} w-5 transition-colors duration-200 ${isActive(item.path) ? 'text-[#ffda0a]' : ''}`}></i>
                      {isOpen && <span className="font-medium">{item.name}</span>}
                    </Link>
                    {isOpen && (
                      <span
                        className={`favorite-star cursor-pointer hover:text-[#ffda0a] transition-all duration-200 ml-2 ${favorites[item.key] ? 'active text-[#ffda0a]' : 'text-gray-400'}`}
                        onClick={(e) => toggleFavorite(item.key, e)}
                        title={favorites[item.key] ? "Quitar de favoritos" : "Añadir a favoritos"}
                      >
                        <i className={`${favorites[item.key] ? 'fas' : 'far'} fa-star text-sm`}></i>
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Cerrar Sesión */}
      <div className="mt-auto p-5 border-t border-opacity-10 border-white">
        {isOpen ? (
          <button
            className="logout-button flex items-center w-full text-gray-400 hover:text-red-400 cursor-pointer transition-all duration-200 hover:bg-red-500 hover:bg-opacity-10 rounded-lg p-3 border border-transparent hover:border-red-500 hover:border-opacity-30"
            onClick={onLogout}
            aria-label="Cerrar sesión"
          >
            <i className="fas fa-door-open mr-3 transition-transform duration-200"></i>
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        ) : (
          <button
            className="logout-button flex justify-center w-full text-gray-400 hover:text-red-400 cursor-pointer transition-all duration-200 p-3 rounded-lg border border-transparent hover:border-red-500 hover:border-opacity-30 hover:bg-red-500 hover:bg-opacity-10"
            onClick={onLogout}
            title="Cerrar Sesión"
            aria-label="Cerrar sesión"
          >
            <i className="fas fa-door-open transition-transform duration-200"></i>
          </button>
        )}
      </div>
    </div>
  );
};

const Layout = () => {
  const { user, isAdmin, isPsicologo, isCandidato, logout } = useNoAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  // Variables derivadas para compatibilidad
  const isPsychologist = isPsicologo;
  const isCandidate = isCandidato;
  const userName = user ? `${user.nombre || ''} ${user.apellido || ''}`.trim() : '';
  const userEmail = user?.email;

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // En caso de error, forzar navegación
      window.location.href = '/login';
    }
  };

  // Cerrar el menú de usuario cuando se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar con favoritos */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} onLogout={handleLogout} />

      {/* Contenido principal */}
      <div className={`flex-1 transition-all duration-300 ease-in-out
                    ${sidebarOpen ? 'ml-64' : 'ml-[70px]'}`}>
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center">
                <AnimatedTitle />
              </div>

              {/* Información del usuario */}
              <div className="flex items-center relative" ref={userMenuRef}>
                <button
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg px-3 py-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={toggleUserMenu}
                  id="user-menu-button"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                  aria-label="Abrir menú de usuario"
                >
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-medium text-gray-800">
                      {userName || userEmail || 'Usuario'}
                    </span>
                    <span className="text-xs text-gray-500">
                      <span className="inline-flex items-center">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                        <span className="text-green-600 font-semibold">Activo</span>
                        <span className="mx-2">•</span>
                        <span className="text-amber-600 font-medium">
                          {isAdmin ? 'Administrador' : isPsychologist ? 'Psicólogo' : 'Candidato'}
                        </span>
                      </span>
                    </span>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-md">
                    <i className="fas fa-user-shield"></i>
                  </div>
                  <div className="text-gray-400">
                    <i className={`fas fa-chevron-${userMenuOpen ? 'up' : 'down'} text-xs transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}></i>
                  </div>
                </button>

                {/* Menú desplegable del usuario - Mejorado */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl menu-shadow border border-gray-200 z-50 overflow-hidden animate-in user-menu-dropdown" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button">
                    {/* Header del menú - Mejorado */}
                    <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
                      <div className="flex items-start space-x-4">
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg ring-2 ring-blue-100">
                          <i className="fas fa-user-shield text-lg"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-semibold text-gray-900 truncate">
                            {userName || userEmail || 'Usuario Desarrollo'}
                          </p>
                          <p className="text-sm text-gray-600 truncate mt-0.5">
                            {userEmail || 'dev@bat7.com'}
                          </p>
                          <div className="flex items-center mt-2 space-x-2">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                              Activo
                            </span>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                              {isAdmin ? 'Administrador' : isPsychologist ? 'Psicólogo' : 'Candidato'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Opciones del menú - Mejoradas */}
                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="flex items-center px-5 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 focus:outline-none focus:bg-blue-50 focus:text-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                        onClick={() => setUserMenuOpen(false)}
                        role="menuitem"
                        tabIndex={0}
                        aria-label="Ir a mi perfil"
                      >
                        <i className="fas fa-user-cog mr-4 text-gray-400 w-4 text-center"></i>
                        <span>Mi Perfil</span>
                      </Link>

                      <Link
                        to="/configuracion"
                        className="flex items-center px-5 py-3 text-sm font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-all duration-200 focus:outline-none focus:bg-amber-50 focus:text-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-inset"
                        onClick={() => setUserMenuOpen(false)}
                        role="menuitem"
                        tabIndex={0}
                        aria-label="Ir a configuración del sistema"
                      >
                        <i className="fas fa-cog mr-4 text-gray-400 w-4 text-center"></i>
                        <span>Configuración</span>
                      </Link>

                      <Link
                        to="/help"
                        className="flex items-center px-5 py-3 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 transition-all duration-200 focus:outline-none focus:bg-green-50 focus:text-green-700 focus:ring-2 focus:ring-green-500 focus:ring-inset"
                        onClick={() => setUserMenuOpen(false)}
                        role="menuitem"
                        tabIndex={0}
                        aria-label="Obtener ayuda y soporte"
                      >
                        <i className="fas fa-question-circle mr-4 text-gray-400 w-4 text-center"></i>
                        <span>Ayuda</span>
                      </Link>

                      <div className="border-t border-gray-200 my-2 mx-2"></div>

                      <button
                        className="flex w-full items-center px-5 py-3 text-sm font-medium text-red-700 hover:bg-red-50 hover:text-red-800 transition-all duration-200 focus:outline-none focus:bg-red-50 focus:text-red-800 focus:ring-2 focus:ring-red-500 focus:ring-inset group"
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleLogout();
                        }}
                        role="menuitem"
                        tabIndex={0}
                        aria-label="Cerrar sesión y salir del sistema"
                      >
                        <i className="fas fa-door-open mr-4 text-red-500 w-4 text-center group-hover:animate-pulse"></i>
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Contenido principal */}
        <main className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Contenido de la página con transición */}
            <PageTransition>
              <Outlet />
            </PageTransition>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} BAT-7 Evaluaciones. Todos los derechos reservados.
            </p>
          </div>
        </footer>

        {/* Contenedor de notificaciones Toast */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </div>
  );
};

export default Layout;