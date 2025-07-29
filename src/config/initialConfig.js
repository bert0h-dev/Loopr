/**
 * @name initialConfig
 * @summary
 * Configuración inicial del calendario
 */
export const initialConfig = {
  // Configuración del calendario
  config: {
    locale: 'es-MX',
    firstDayOfWeek: 0, // 0 = Domingo, 1 = Lunes
    timeFormat: '24h', // '12h' | '24h'
    dateFormat: 'DD/MM/YYYY',
    theme: 'light', // 'light' | 'dark' | 'auto'
    weekendsVisible: true,
    showWeekNumbers: false,
    viewToolbar: {
      start: [
        { action: 'today' },
        { action: 'month' },
        { action: 'week' },
        { action: 'day' },
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
  activeView: 'month', // 'month' | 'week' | 'day' | 'year'

  // Eventos del calendario
  events: [],
  selectedEvents: [],
};
