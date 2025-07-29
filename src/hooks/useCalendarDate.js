import { useCalendarContext } from '@/context/CalendarContext.jsx';
import { useMemo } from 'preact/hooks';

/**
 * @name useCalendarDate
 * @summary
 * Hook especializado para manejar la navegación de fechas
 * Wrapper del dateController existente con funcionalidades adicionales
 *
 * @returns {Object} Fecha actual y métodos de navegación
 */
export const useCalendarDate = () => {
  const { currentDate, dateController } = useCalendarContext();

  const dateActions = useMemo(
    () => ({
      // Métodos del controlador original
      ...dateController,

      // Métodos adicionales
      isToday: (date = currentDate) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
      },

      isSameMonth: (date1, date2 = currentDate) => {
        return (
          date1.getFullYear() === date2.getFullYear() &&
          date1.getMonth() === date2.getMonth()
        );
      },

      isSameDay: (date1, date2 = currentDate) => {
        return date1.toDateString() === date2.toDateString();
      },

      formatDate: (date = currentDate, format = 'DD/MM/YYYY') => {
        // Implementación básica de formateo
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();

        return format
          .replace('DD', day)
          .replace('MM', month)
          .replace('YYYY', year);
      },
    }),
    [currentDate, dateController]
  );

  return {
    currentDate,
    ...dateActions,
  };
};
