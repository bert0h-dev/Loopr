import { useCalendarContext } from '@/context/CalendarContext.jsx';
import { useMemo } from 'preact/hooks';
// Importar funciones de date-fns para comparaciones y formateo seguro
import {
  isToday as dateIsToday,
  isSameMonth as dateIsSameMonth,
  isSameDay as dateIsSameDay,
  format,
  isValid,
  differenceInDays,
  isWeekend,
  isPast,
  isFuture,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { es } from 'date-fns/locale';

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

      // Métodos adicionales mejorados con date-fns
      isToday: (date = currentDate) => {
        try {
          // Validar fecha con date-fns antes de comparar
          if (!isValid(date)) {
            console.warn('useCalendarDate.isToday: fecha inválida', date);
            return false;
          }
          // Usar date-fns para comparación más confiable
          return dateIsToday(date);
        } catch (error) {
          console.error('Error en isToday:', error);
          return false;
        }
      },

      isSameMonth: (date1, date2 = currentDate) => {
        try {
          // Validar ambas fechas con date-fns
          if (!isValid(date1) || !isValid(date2)) {
            console.warn('useCalendarDate.isSameMonth: fecha inválida', {
              date1,
              date2,
            });
            return false;
          }
          // Usar date-fns para comparación de mes más confiable
          return dateIsSameMonth(date1, date2);
        } catch (error) {
          console.error('Error en isSameMonth:', error);
          return false;
        }
      },

      isSameDay: (date1, date2 = currentDate) => {
        try {
          // Validar ambas fechas con date-fns
          if (!isValid(date1) || !isValid(date2)) {
            console.warn('useCalendarDate.isSameDay: fecha inválida', {
              date1,
              date2,
            });
            return false;
          }
          // Usar date-fns para comparación de día más confiable
          return dateIsSameDay(date1, date2);
        } catch (error) {
          console.error('Error en isSameDay:', error);
          return false;
        }
      },

      formatDate: (date = currentDate, formatPattern = 'dd/MM/yyyy') => {
        try {
          // Validar fecha con date-fns antes de formatear
          if (!isValid(date)) {
            console.warn('useCalendarDate.formatDate: fecha inválida', date);
            return 'Fecha inválida';
          }

          // Usar date-fns format con soporte para locale español
          return format(date, formatPattern, { locale: es });
        } catch (error) {
          console.error('Error en formatDate:', error);
          // Fallback a formateo básico si hay error
          try {
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
          } catch (fallbackError) {
            console.error('Error en formatDate fallback:', fallbackError);
            return 'Error de formato';
          }
        }
      },

      // Nuevas funciones adicionales usando date-fns
      getDaysDifference: (date1, date2 = currentDate) => {
        try {
          if (!isValid(date1) || !isValid(date2)) {
            console.warn('useCalendarDate.getDaysDifference: fecha inválida', {
              date1,
              date2,
            });
            return 0;
          }
          return differenceInDays(date1, date2);
        } catch (error) {
          console.error('Error en getDaysDifference:', error);
          return 0;
        }
      },

      isWeekend: (date = currentDate) => {
        try {
          if (!isValid(date)) {
            console.warn('useCalendarDate.isWeekend: fecha inválida', date);
            return false;
          }
          return isWeekend(date);
        } catch (error) {
          console.error('Error en isWeekend:', error);
          return false;
        }
      },

      isPast: (date = currentDate) => {
        try {
          if (!isValid(date)) {
            console.warn('useCalendarDate.isPast: fecha inválida', date);
            return false;
          }
          return isPast(endOfDay(date));
        } catch (error) {
          console.error('Error en isPast:', error);
          return false;
        }
      },

      isFuture: (date = currentDate) => {
        try {
          if (!isValid(date)) {
            console.warn('useCalendarDate.isFuture: fecha inválida', date);
            return false;
          }
          return isFuture(startOfDay(date));
        } catch (error) {
          console.error('Error en isFuture:', error);
          return false;
        }
      },

      getRelativeDescription: (date = currentDate) => {
        try {
          if (!isValid(date)) {
            return 'Fecha inválida';
          }

          if (dateIsToday(date)) return 'Hoy';

          const daysDiff = differenceInDays(date, new Date());

          if (daysDiff === 1) return 'Mañana';
          if (daysDiff === -1) return 'Ayer';
          if (daysDiff > 1 && daysDiff <= 7) return `En ${daysDiff} días`;
          if (daysDiff < -1 && daysDiff >= -7)
            return `Hace ${Math.abs(daysDiff)} días`;

          // Para fechas más lejanas, mostrar formato completo
          return format(date, "dd 'de' MMMM 'de' yyyy", { locale: es });
        } catch (error) {
          console.error('Error en getRelativeDescription:', error);
          return 'Error de formato';
        }
      },
    }),
    [currentDate, dateController]
  );

  return {
    currentDate,
    ...dateActions,
  };
};
