import React, { lazy, Suspense } from 'react';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { FaSpinner } from 'react-icons/fa';

const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="text-center">
      <FaSpinner className="animate-spin text-blue-600 mx-auto mb-4 text-4xl" />
      <p className="text-gray-600 font-medium">Cargando...</p>
    </div>
  </div>
);

const withLazyPage = (Component) => (props) => (
  <ErrorBoundary>
    <Suspense fallback={<LoadingFallback />}>
      <Component {...props} />
    </Suspense>
  </ErrorBoundary>
);

export default withLazyPage;