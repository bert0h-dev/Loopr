import { useMemo } from 'preact/hooks';
import { useCalendarContext } from '@/context/CalendarContext.jsx';

/**
 * @name useCalendarConfig
 * @summary
 * Hook especializado para manejar la configuración del calendario
 *
 * @returns {Object} Configuración y métodos para actualizarla
 */
export const useCalendarConfig = () => {
  const { config, updateConfig } = useCalendarContext();

  const configActions = useMemo(
    () => ({
      // Configuración de idioma/región
      setLocale: locale => updateConfig({ locale }),

      // Configuración de semana
      setFirstDayOfWeek: day => updateConfig({ firstDayOfWeek: day }),

      // Configuracion de formato
      setTimeFormat: format => updateConfig({ timeFormat: format }),
      setDateFormat: format => updateConfig({ dateFormat: format }),

      // Configuración de tema
      setTheme: theme => updateConfig({ theme }),
      toggleTheme: () => {
        const newTheme = config.theme === 'light' ? 'dark' : 'light';
        updateConfig({ theme: newTheme });
      },

      // Configuración de visualización
      toggleWeekends: () => {
        updateConfig({ weekendsVisible: !config.weekendsVisible });
      },
      toggleWeekNumbers: () => {
        updateConfig({ weekNumbersVisible: !config.weekNumbersVisible });
      },

      // Actualización completa
      updateConfig,
    }),
    [config, updateConfig]
  );

  return { config, ...configActions };
};
