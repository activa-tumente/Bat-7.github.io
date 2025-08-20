import React, { Suspense, memo, useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

/**
 * Componente Suspense optimizado con delay para evitar flashes de loading
 * y mejor experiencia de usuario
 */
const OptimizedSuspense = memo(({ 
  children, 
  fallback, 
  delay = 200,
  minLoadingTime = 500,
  errorFallback,
  testId = 'optimized-suspense'
}) => {
  const [showFallback, setShowFallback] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState(null);

  useEffect(() => {
    // Delay antes de mostrar el loading
    const delayTimer = setTimeout(() => {
      setShowFallback(true);
      setLoadingStartTime(Date.now());
    }, delay);

    return () => {
      clearTimeout(delayTimer);
      setShowFallback(false);
      setLoadingStartTime(null);
    };
  }, [delay]);

  const defaultFallback = (
    <div className="flex items-center justify-center min-h-[200px]" data-testid={testId}>
      <LoadingSpinner size="lg" text="Cargando componente..." />
    </div>
  );

  const DelayedFallback = () => {
    const [shouldShow, setShouldShow] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => {
        setShouldShow(true);
      }, delay);

      return () => clearTimeout(timer);
    }, []);

    if (!shouldShow) {
      return null;
    }

    return fallback || defaultFallback;
  };

  const MinTimeWrapper = ({ children }) => {
    const [canHide, setCanHide] = useState(false);

    useEffect(() => {
      if (loadingStartTime) {
        const elapsed = Date.now() - loadingStartTime;
        const remaining = Math.max(0, minLoadingTime - elapsed);
        
        const timer = setTimeout(() => {
          setCanHide(true);
        }, remaining);

        return () => clearTimeout(timer);
      }
    }, [loadingStartTime]);

    // Si no hay tiempo de inicio o ya puede ocultar, mostrar children
    if (!loadingStartTime || canHide) {
      return children;
    }

    // Mantener loading por tiempo mínimo
    return fallback || defaultFallback;
  };

  return (
    <Suspense fallback={<DelayedFallback />}>
      <MinTimeWrapper>
        {children}
      </MinTimeWrapper>
    </Suspense>
  );
});

OptimizedSuspense.displayName = 'OptimizedSuspense';

export default OptimizedSuspense;
