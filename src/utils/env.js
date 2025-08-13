/**
 * 🔧 Utilidades para Variables de Entorno - Loopr
 *
 * Centraliza el acceso a las variables de entorno con valores por defecto
 * y validación de tipos.
 */

// Safe access to process.env para navegador y Node.js
const safeEnv = (() => {
  // En el navegador, Rollup reemplaza process.env.VARIABLE por sus valores
  // En Node.js, process.env está disponible
  if (typeof process !== 'undefined' && process.env) {
    return process.env;
  }

  // Fallback para navegador sin build tools
  if (typeof window !== 'undefined' && window.__ENV__) {
    return window.__ENV__;
  }

  // Objeto vacío como último recurso
  console.warn(
    '⚠️ Variables de entorno no disponibles, usando valores por defecto'
  );
  return {};
})();

/**
 * Obtiene una variable de entorno como string
 * @param {string} key - Clave de la variable de entorno
 * @param {string} defaultValue - Valor por defecto
 * @returns {string}
 */
export const getEnvString = (key, defaultValue = '') => {
  const value = safeEnv[key];
  return value !== undefined && value !== null ? String(value) : defaultValue;
};

/**
 * Obtiene una variable de entorno como boolean
 * @param {string} key - Clave de la variable de entorno
 * @param {boolean} defaultValue - Valor por defecto
 * @returns {boolean}
 */
export const getEnvBoolean = (key, defaultValue = false) => {
  const value = safeEnv[key];
  if (value === undefined || value === null) return defaultValue;

  // Valores truthy: 'true', '1', 'yes', 'on'
  const stringValue = String(value).toLowerCase();
  return (
    stringValue === 'true' ||
    stringValue === '1' ||
    stringValue === 'yes' ||
    stringValue === 'on'
  );
};

/**
 * Obtiene una variable de entorno como number
 * @param {string} key - Clave de la variable de entorno
 * @param {number} defaultValue - Valor por defecto
 * @returns {number}
 */
export const getEnvNumber = (key, defaultValue = 0) => {
  const value = safeEnv[key];
  if (value === undefined || value === null) return defaultValue;

  const parsed = Number(value);
  return !isNaN(parsed) ? parsed : defaultValue;
};

/**
 * Configuración de la aplicación basada en variables de entorno
 */
export const appConfig = {
  // App
  name: getEnvString('VITE_APP_NAME', 'Loopr'),
  version: getEnvString('VITE_APP_VERSION', '1.0.3'),
  debug: getEnvBoolean('VITE_APP_DEBUG', true),

  // API
  api: {
    url: getEnvString('VITE_API_URL', 'http://localhost:3001'),
    timeout: getEnvNumber('VITE_API_TIMEOUT', 5000),
  },

  // Calendar
  calendar: {
    defaultView: getEnvString('VITE_DEFAULT_VIEW', 'month'),
    enableTimeSlots: getEnvBoolean('VITE_ENABLE_TIME_SLOTS', true),
    maxEventsPerDay: getEnvNumber('VITE_MAX_EVENTS_PER_DAY', 10),
  },

  // Features
  features: {
    analytics: getEnvBoolean('VITE_ENABLE_ANALYTICS', false),
    notifications: getEnvBoolean('VITE_ENABLE_NOTIFICATIONS', true),
    themes: getEnvBoolean('VITE_ENABLE_THEMES', true),
  },

  // Development
  dev: {
    sourcemaps: getEnvBoolean('VITE_ENABLE_SOURCEMAPS', true),
  },
};

/**
 * Valida que todas las variables de entorno críticas estén presentes
 * @returns {boolean}
 */
export const validateEnvironment = () => {
  const requiredVars = ['VITE_APP_NAME'];
  const missing = requiredVars.filter(key => {
    const value = safeEnv[key];
    return value === undefined || value === null || value === '';
  });

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    return false;
  }

  console.log('✅ Environment validation passed');
  return true;
};

/**
 * Muestra información de debug sobre el entorno actual
 */
export const debugEnvironment = () => {
  if (!appConfig.debug) return;

  console.group('🔧 Environment Debug Info');
  console.log(
    'Runtime:',
    typeof window !== 'undefined' ? 'Browser' : 'Node.js'
  );
  console.log('Node Environment:', getEnvString('NODE_ENV', 'undefined'));
  console.log(
    'Available env vars:',
    Object.keys(safeEnv).filter(key => key.startsWith('VITE_'))
  );
  console.log('App Config:', appConfig);
  console.log('Build Time:', new Date().toISOString());
  console.groupEnd();
};

// Auto-validar en desarrollo
if (appConfig.debug) {
  validateEnvironment();
  debugEnvironment();
}
