import { h } from 'preact';
import { lazy, Suspense } from 'preact/compat';

/**
 * @name createLazyComponent
 * @summary Utilidad para crear componentes con lazy loading
 *
 * @param {Function} importFn - Función que importa el componente
 * @param {JSX.Element} fallback - Componente de carga
 * @returns {Function} Componente envuelto con Suspense
 */
export const createLazyComponent = (
  importFn,
  fallback = <div>Cargando...</div>
) => {
  const LazyComponent = lazy(importFn);

  return props => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

/**
 * @name LoadingSpinner
 * @summary Componente de carga optimizado
 */
export const LoadingSpinner = ({ size = 'normal', text = 'Cargando...' }) => (
  <div className='loading-spinner' role='status' aria-label={text}>
    <div className={`spinner ${size}`}></div>
    {text && <span className='loading-text'>{text}</span>}
  </div>
);
