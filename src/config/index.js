/**
 * 🔧 Configuración de la aplicación
 *
 * Ejemplo de importación de JSON usando resolución de módulos mejorada
 */

// Importación directa de JSON (gracias al plugin @rollup/plugin-json)
import appData from '@/config/app.json';
import { appConfig } from '@/utils/env.js';

/**
 * Configuración combinada de la aplicación
 * Fusiona configuración JSON con variables de entorno
 */
export const appConfiguration = {
  // Información básica de la app
  ...appData.app,

  // Configuración de entorno (tiene prioridad)
  name: appConfig.name || appData.app.name,
  version: appConfig.version || appData.app.version,
  debug: appConfig.debug,

  // Features habilitadas
  features: {
    ...appData.features,
    analytics: appConfig.features.analytics,
    notifications: appConfig.features.notifications,
    themes: appConfig.features.themes,
  },

  // Configuración de API
  api: appConfig.api,

  // Configuración del calendario
  calendar: {
    ...appData.defaultSettings,
    defaultView: appConfig.calendar.defaultView || appData.defaultSettings.view,
    enableTimeSlots: appConfig.calendar.enableTimeSlots,
    maxEventsPerDay: appConfig.calendar.maxEventsPerDay,
  },

  // Tipos de eventos disponibles
  eventTypes: appData.eventTypes,

  // Locales soportados
  supportedLocales: appData.supportedLocales,

  // Temas disponibles
  themes: appConfig.features.themes
    ? appData.themes
    : { light: appData.themes.light },
};

/**
 * Obtiene la configuración de un tipo de evento
 * @param {string} eventType - ID del tipo de evento
 * @returns {Object|null} Configuración del evento o null si no existe
 */
export const getEventTypeConfig = eventType => {
  return appData.eventTypes.find(type => type.id === eventType) || null;
};

/**
 * Obtiene la configuración de tema
 * @param {string} themeName - Nombre del tema
 * @returns {Object|null} Configuración del tema o null si no existe
 */
export const getThemeConfig = (themeName = 'light') => {
  return appData.themes[themeName] || appData.themes.light;
};

/**
 * Valida si un locale está soportado
 * @param {string} locale - Código del locale
 * @returns {boolean} True si está soportado
 */
export const isSupportedLocale = locale => {
  return appData.supportedLocales.includes(locale);
};

/**
 * Obtiene el primer locale soportado de una lista
 * @param {string[]} locales - Lista de locales por prioridad
 * @returns {string} Primer locale soportado o 'es-MX' por defecto
 */
export const getBestSupportedLocale = (locales = []) => {
  for (const locale of locales) {
    if (isSupportedLocale(locale)) {
      return locale;
    }
  }
  return 'es-MX'; // Fallback
};

/**
 * Información de debug sobre la configuración
 */
export const debugConfiguration = () => {
  if (!appConfiguration.debug) return;

  console.group('🔧 App Configuration Debug');
  console.log('📋 Full config:', appConfiguration);
  console.log('🎨 Available themes:', Object.keys(appData.themes));
  console.log('🌍 Supported locales:', appData.supportedLocales);
  console.log(
    '📅 Event types:',
    appData.eventTypes.map(t => t.id)
  );
  console.log(
    '✨ Features enabled:',
    Object.entries(appConfiguration.features)
      .filter(([_, enabled]) => enabled)
      .map(([feature, _]) => feature)
  );
  console.groupEnd();
};

// Auto-debug si está habilitado
if (appConfiguration.debug) {
  debugConfiguration();
}

// Export por defecto
export default appConfiguration;
