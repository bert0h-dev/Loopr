import { useEffect, useRef, useState } from 'preact/hooks';

/**
 * @name usePerformanceMonitor
 * @summary Hook para monitorear el rendimiento de componentes
 *
 * @param {string} componentName - Nombre del componente
 * @param {Array} dependencies - Dependencias a monitorear
 */
export const usePerformanceMonitor = (componentName, dependencies = []) => {
  const renderCountRef = useRef(0);
  const lastRenderTime = useRef(performance.now());

  useEffect(() => {
    renderCountRef.current += 1;
    const now = performance.now();
    const timeSinceLastRender = now - lastRenderTime.current;

    console.log(
      `[${componentName}] Render #${renderCountRef.current}, Time: ${timeSinceLastRender.toFixed(2)}ms`
    );

    lastRenderTime.current = now;
  }, dependencies);

  return {
    renderCount: renderCountRef.current,
    lastRenderDuration: performance.now() - lastRenderTime.current,
  };
};

/**
 * @name useDebouncedValue
 * @summary Hook para debounce de valores
 *
 * @param {any} value - Valor a hacer debounce
 * @param {number} delay - Delay en ms
 * @returns {any} Valor con debounce aplicado
 */
export const useDebouncedValue = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * @name useWindowSize
 * @summary Hook optimizado para el tamaño de ventana
 */
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    let timeoutId = null;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 150); // Debounce de 150ms
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        clearTimeout(timeoutId);
      };
    }
  }, []);

  return windowSize;
};
