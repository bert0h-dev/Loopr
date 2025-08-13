/**
 * 📋 Constantes del calendario - Loopr
 *
 * Ejemplo de import/export usando resolución de módulos mejorada
 */

import { appConfig } from '@/utils/env.js';

// Vistas disponibles del calendario
export const CALENDAR_VIEWS = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
};

// Configuración de días de la semana
export const WEEKDAYS = {
  FULL: [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
  ],
  SHORT: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  MINIMAL: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
};

// Configuración de meses
export const MONTHS = {
  FULL: [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ],
  SHORT: [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
  ],
};

// Configuración de eventos
export const EVENT_TYPES = {
  PERSONAL: 'personal',
  WORK: 'work',
  MEETING: 'meeting',
  REMINDER: 'reminder',
  HOLIDAY: 'holiday',
};

// Colores por tipo de evento
export const EVENT_COLORS = {
  [EVENT_TYPES.PERSONAL]: '#3b82f6', // Azul
  [EVENT_TYPES.WORK]: '#8b5cf6', // Púrpura
  [EVENT_TYPES.MEETING]: '#ef4444', // Rojo
  [EVENT_TYPES.REMINDER]: '#f59e0b', // Amarillo
  [EVENT_TYPES.HOLIDAY]: '#10b981', // Verde
};

// Configuración de tiempo
export const TIME_CONFIG = {
  HOUR_HEIGHT: 60, // pixels
  MINUTES_IN_HOUR: 60,
  HOURS_IN_DAY: 24,
  DAYS_IN_WEEK: 7,
  DEFAULT_EVENT_DURATION: 60, // minutos
  MIN_EVENT_DURATION: 15, // minutos
  MAX_EVENTS_PER_SLOT: appConfig.calendar.maxEventsPerDay,
};

// Formatos de fecha
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  ISO: 'yyyy-MM-dd',
  TIME: 'HH:mm',
  DATETIME: 'dd/MM/yyyy HH:mm',
  MONTH_YEAR: 'MMMM yyyy',
  DAY_MONTH: 'dd MMM',
};

// Configuración de rangos de tiempo
export const TIME_SLOTS = appConfig.calendar.enableTimeSlots
  ? {
      START_HOUR: 8, // 8:00 AM
      END_HOUR: 20, // 8:00 PM
      SLOT_DURATION: 30, // 30 minutos
      BREAK_DURATION: 15, // 15 minutos de break
    }
  : null;

// Configuración de temas
export const THEME_CONFIG = appConfig.features.themes
  ? {
      LIGHT: 'light',
      DARK: 'dark',
      AUTO: 'auto',
      HIGH_CONTRAST: 'high-contrast',
    }
  : { LIGHT: 'light' };

// Configuración de notificaciones
export const NOTIFICATION_CONFIG = appConfig.features.notifications
  ? {
      TYPES: {
        INFO: 'info',
        SUCCESS: 'success',
        WARNING: 'warning',
        ERROR: 'error',
      },
      DURATION: {
        SHORT: 3000, // 3 segundos
        MEDIUM: 5000, // 5 segundos
        LONG: 8000, // 8 segundos
        PERSISTENT: 0, // No se oculta automáticamente
      },
      POSITIONS: {
        TOP_RIGHT: 'top-right',
        TOP_LEFT: 'top-left',
        BOTTOM_RIGHT: 'bottom-right',
        BOTTOM_LEFT: 'bottom-left',
        TOP_CENTER: 'top-center',
        BOTTOM_CENTER: 'bottom-center',
      },
    }
  : null;

// Configuración de analytics
export const ANALYTICS_CONFIG = appConfig.features.analytics
  ? {
      EVENTS: {
        VIEW_CHANGE: 'calendar.view.change',
        EVENT_CREATE: 'calendar.event.create',
        EVENT_EDIT: 'calendar.event.edit',
        EVENT_DELETE: 'calendar.event.delete',
        DATE_NAVIGATE: 'calendar.date.navigate',
      },
      PROPERTIES: {
        VIEW_TYPE: 'viewType',
        EVENT_TYPE: 'eventType',
        NAVIGATION_DIRECTION: 'navigationDirection',
      },
    }
  : null;

// Configuración de API
export const API_CONFIG = {
  ENDPOINTS: {
    EVENTS: `${appConfig.api.url}/events`,
    CALENDARS: `${appConfig.api.url}/calendars`,
    USERS: `${appConfig.api.url}/users`,
  },
  TIMEOUT: appConfig.api.timeout,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 segundo
};

// Configuración de validación
export const VALIDATION_RULES = {
  EVENT_TITLE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
  },
  EVENT_DESCRIPTION: {
    MAX_LENGTH: 500,
  },
  DATE_RANGE: {
    MIN_YEAR: 1900,
    MAX_YEAR: 2100,
  },
};

// Exportación por defecto con toda la configuración
export default {
  CALENDAR_VIEWS,
  WEEKDAYS,
  MONTHS,
  EVENT_TYPES,
  EVENT_COLORS,
  TIME_CONFIG,
  DATE_FORMATS,
  TIME_SLOTS,
  THEME_CONFIG,
  NOTIFICATION_CONFIG,
  ANALYTICS_CONFIG,
  API_CONFIG,
  VALIDATION_RULES,
};
