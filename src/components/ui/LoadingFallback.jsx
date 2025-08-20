import { FaSpinner } from 'react-icons/fa';

/**
 * Componente de fallback para mostrar mientras se cargan las páginas
 */
const LoadingFallback = ({ message = "Cargando..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <FaSpinner className="animate-spin text-blue-600 text-4xl" />
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            {message}
          </h2>
          <p className="text-sm text-gray-500">
            Por favor espera un momento...
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingFallback;
