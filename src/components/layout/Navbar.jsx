import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaUser, 
  FaBars, 
  FaTimes, 
  FaSignOutAlt, 
  FaCog, 
  FaUserCog,
  FaChartBar,
  FaClipboardList,
  FaUserMd,
  FaHospital
} from 'react-icons/fa';
import AuthService from '../../services/authService';
import { toast } from 'react-toastify';

/**
 * Barra de navegación principal con control de autenticación
 * Responsiva para dispositivos móviles y escritorio
 */
const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Verificar usuario autenticado al cargar
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        // Obtener usuario y verificar si es admin
        const currentUser = await AuthService.getCurrentUser();
        setUser(currentUser);
        
        if (currentUser) {
          const adminStatus = await AuthService.isUserAdmin();
          setIsAdmin(adminStatus);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        setUser(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [location.pathname]); // Volver a verificar cuando cambie la ruta

  // Cerrar menús al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  // Manejar cierre de sesión
  const handleLogout = async () => {
    try {
      await AuthService.signOut();
      toast.success('Sesión cerrada correctamente');
      setUser(null);
      setIsAdmin(false);
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  // Alternar menú móvil
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isUserMenuOpen) setIsUserMenuOpen(false);
  };

  // Alternar menú de usuario
  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  // Elementos de navegación según el rol
  const NavigationItems = () => (
    <>
      <Link
        to="/dashboard"
        className={`px-3 py-2 rounded-md text-sm font-medium ${
          location.pathname === '/dashboard'
            ? 'text-white bg-blue-700'
            : 'text-gray-300 hover:text-white hover:bg-blue-600'
        } transition-colors duration-200`}
      >
        <div className="flex items-center">
          <FaChartBar className="mr-1.5" />
          <span>Dashboard</span>
        </div>
      </Link>
      
      <Link
        to="/patients"
        className={`px-3 py-2 rounded-md text-sm font-medium ${
          location.pathname.startsWith('/patients')
            ? 'text-white bg-blue-700'
            : 'text-gray-300 hover:text-white hover:bg-blue-600'
        } transition-colors duration-200`}
      >
        <div className="flex items-center">
          <FaClipboardList className="mr-1.5" />
          <span>Pacientes</span>
        </div>
      </Link>
      
      <Link
        to="/psychologists"
        className={`px-3 py-2 rounded-md text-sm font-medium ${
          location.pathname.startsWith('/psychologists')
            ? 'text-white bg-blue-700'
            : 'text-gray-300 hover:text-white hover:bg-blue-600'
        } transition-colors duration-200`}
      >
        <div className="flex items-center">
          <FaUserMd className="mr-1.5" />
          <span>Psicólogos</span>
        </div>
      </Link>
      
      <Link
        to="/institutions"
        className={`px-3 py-2 rounded-md text-sm font-medium ${
          location.pathname.startsWith('/institutions')
            ? 'text-white bg-blue-700'
            : 'text-gray-300 hover:text-white hover:bg-blue-600'
        } transition-colors duration-200`}
      >
        <div className="flex items-center">
          <FaHospital className="mr-1.5" />
          <span>Instituciones</span>
        </div>
      </Link>
      
      {isAdmin && (
        <Link
          to="/admin"
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            location.pathname.startsWith('/admin')
              ? 'text-white bg-blue-700'
              : 'text-gray-300 hover:text-white hover:bg-blue-600'
          } transition-colors duration-200`}
        >
          <div className="flex items-center">
            <FaUserCog className="mr-1.5" />
            <span>Administración</span>
          </div>
        </Link>
      )}
    </>
  );

  return (
    <nav className="bg-blue-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo y navegación */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-white font-bold text-2xl tracking-wider">
                BAT-7
              </Link>
            </div>
            
            {/* Navegación para escritorio */}
            {user && (
              <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
                <NavigationItems />
              </div>
            )}
          </div>
          
          {/* Sección de perfil */}
          <div className="flex items-center">
            {!loading && user ? (
              <div className="ml-3 relative">
                <div className="flex items-center">
                  {/* Botón de perfil */}
                  <button
                    onClick={toggleUserMenu}
                    className="flex text-sm rounded-full text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-800 focus:ring-white transition-colors"
                  >
                    <span className="sr-only">Abrir menú de usuario</span>
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-500 border-2 border-white">
                      {user.email?.charAt(0).toUpperCase() || <FaUser />}
                    </div>
                  </button>
                  
                  {/* Email del usuario (visible en escritorio) */}
                  <span className="hidden md:inline-block ml-2 text-sm text-gray-300">
                    {user.email || 'Usuario'}
                  </span>
                </div>
                
                {/* Menú desplegable de usuario */}
                {isUserMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="user-menu">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        <FaUserCog className="mr-2 text-gray-500" />
                        Mi Perfil
                      </Link>
                      <Link
                        to="/configuracion"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        <FaCog className="mr-2 text-gray-500" />
                        Configuración
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        <FaSignOutAlt className="mr-2 text-gray-500" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              !loading && (
                <Link
                  to="/login"
                  className="text-gray-300 hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Iniciar Sesión
                </Link>
              )
            )}
            
            {/* Botón de menú móvil */}
            <div className="flex items-center md:hidden ml-2">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <span className="sr-only">Abrir menú principal</span>
                {isMobileMenuOpen ? (
                  <FaTimes className="block h-6 w-6" />
                ) : (
                  <FaBars className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {isMobileMenuOpen && user && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavigationItems />
          </div>
          <div className="pt-4 pb-3 border-t border-blue-700">
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  {user.email?.charAt(0).toUpperCase() || <FaUser />}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-white">
                  {user.email || 'Usuario'}
                </div>
                {isAdmin && (
                  <div className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded w-fit">
                    Admin
                  </div>
                )}
              </div>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <Link
                to="/profile"
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-blue-600"
              >
                <FaUser className="mr-2" />
                Mi Perfil
              </Link>
              <Link
                to="/configuracion"
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-blue-600"
              >
                <FaCog className="mr-2" />
                Configuración
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-3 py-2 rounded-md text-sm font-medium text-red-300 hover:text-white hover:bg-red-600"
              >
                <FaSignOutAlt className="mr-2" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
