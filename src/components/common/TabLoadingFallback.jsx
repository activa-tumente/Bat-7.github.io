import React from 'react';
import { FaSpinner } from 'react-icons/fa';

/**
 * Reusable loading fallback component for tab content
 * Provides consistent loading UX across the application
 */
const TabLoadingFallback = React.memo(() => (
  <div className="flex justify-center items-center h-64">
    <div className="text-center">
      <div className="relative">
        <FaSpinner className="animate-spin text-blue-600 mx-auto mb-4 text-3xl" />
        <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse opacity-20"></div>
      </div>
      <p className="text-gray-600 font-medium">Cargando módulo...</p>
      <p className="text-gray-400 text-sm mt-1">Por favor espera</p>
    </div>
  </div>
));

TabLoadingFallback.displayName = 'TabLoadingFallback';

export default TabLoadingFallback;