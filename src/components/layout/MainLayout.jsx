import React from 'react';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './Navbar';

/**
 * Componente de layout principal que incluye navegación, notificaciones,
 * y estructura común a todas las páginas autenticadas
 */
const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Barra de navegación superior */}
      <Navbar />
      
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
      
      {/* Contenido principal */}
      <main className="flex-grow container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      
      {/* Pie de página */}
      <footer className="bg-white shadow-inner py-4 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Sistema de Gestión Psicológica. Todos los derechos reservados.
          </p>
        </div>
      </footer>
      
      {/* Modal container para componentes modales (como FormModal) */}
      <div id="modal-root"></div>
    </div>
  );
};

export default MainLayout;
