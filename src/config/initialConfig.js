/**
 * @name initialConfig
 * @summary
 * Configuración inicial del calendario
 */
export const initialConfig = {
  // Configuración del calendario
  config: {
    locale: 'es-MX',
    firstDayOfWeek: 0,
    timeFormat: '24h',
    dateFormat: 'DD/MM/YYYY',
    theme: 'light',
    weekendsVisible: true,
    showWeekNumbers: false,
    viewToolbar: {
      start: [
        { action: 'today' },
        { action: 'month' },
        { action: 'week' },
        { action: 'day' },
        { action: 'agenda' },
      ],
      center: [{ action: 'title' }],
      end: [
        { action: 'prevYear' },
        { action: 'prev' },
        { action: 'next' },
        { action: 'nextYear' },
      ],
    },
    viewFormats: {
      month: { month: 'long', year: 'numeric' },
    },
  },

  // Vista activa
  activeView: 'month',

  // Eventos del calendario
  events: [],
  selectedEvents: [],
};
