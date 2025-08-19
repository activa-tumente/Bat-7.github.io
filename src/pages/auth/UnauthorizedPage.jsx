import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <FaExclamationTriangle className="mx-auto h-16 w-16 text-yellow-500" />
        <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
          Acceso no autorizado
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          No tienes permisos para acceder a esta página.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaHome className="mr-2" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;