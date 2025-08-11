import { useMemo } from 'preact/hooks';
// Importar funciones específicas de date-fns
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isToday,
  isSameMonth,
  isWeekend,
} from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * @name useCalendarMonth
 * @summary
 * Obtiene todos los días visibles en la vista de calendario mensual
 * Incluye días del mes anterior y siguiente para completar las semanas
 * MEJORADO con date-fns para mayor confiabilidad y rendimiento
 *
 * @param {Object} options - Opciones de configuración
 * @param {Date} [options.currentDate=new Date()] - Fecha del mes a mostrar
 * @param {number} [options.weekDay=0] - Primer día de la semana (0=Domingo, 1=Lunes, ..., 6=Sábado)
 * @param {string} [options.locale='es-MX'] - Configuración regional
 *
 * @returns {Array<Object>} Array de objetos con información de cada día visible
 * @returns {Date} returns[].date - Fecha del día
 * @returns {string} returns[].numberDay - Número del día formateado (ej: "01", "15")
 * @returns {boolean} returns[].isToday - Indica si el día es hoy
 * @returns {boolean} returns[].isWeekend - Indica si el día es sábado o domingo
 * @returns {boolean} returns[].isInCurrentMonth - Indica si el día pertenece al mes actual
 *
 * @example
 * const dias = useCalendarMonth(
 *   currentDate = new Date(2025, 6, 15), // Julio 2025
 *   weekDay = 1 // Empezar en lunes
 * );
 * // Retorna array con ~35-42 días (5-6 semanas completas)
 */
export function useCalendarMonth(
  currentDate = new Date(),
  weekDay = 0,
  locale = 'es-MX'
) {
  return useMemo(() => {
    try {
      // Usar date-fns para calcular rangos de manera más confiable
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);

      // Obtener el rango completo de semanas para el calendario
      const calendarStart = startOfWeek(monthStart, { weekStartsOn: weekDay });
      const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: weekDay });

      // Generar todos los días del rango usando date-fns
      const allDays = eachDayOfInterval({
        start: calendarStart,
        end: calendarEnd,
      });

      // Mapear a la estructura existente (mantiene compatibilidad 100%)
      return allDays.map(date => ({
        date,
        numberDay: format(date, 'dd', { locale: es }),
        isToday: isToday(date),
        isWeekend: isWeekend(date),
        isInCurrentMonth: isSameMonth(date, currentDate),
      }));
    } catch (error) {
      console.error('Error en useCalendarMonth:', error);
      // Fallback: retornar array vacío en caso de error
      return [];
    }
  }, [currentDate, weekDay, locale]);
}
