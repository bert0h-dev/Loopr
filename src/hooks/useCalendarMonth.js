import { useMemo } from 'preact/hooks';

/**
 * @name useCalendarMonth
 * @summary
 * Obtiene todos los días visibles en la vista de calendario mensual
 * Incluye días del mes anterior y siguiente para completar las semanas
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
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Día 1 del mes
    const primerDiaMes = new Date(year, month, 1);
    const ultimoDiaMes = new Date(year, month + 1, 0);

    // Calcular inicio de la grilla (inicio de la semana que contiene el primer día del mes)
    const diaInicio = primerDiaMes.getDay(); //0-6
    const diffInicio = (diaInicio - weekDay + 7) % 7;
    const inicioGrilla = new Date(primerDiaMes);
    inicioGrilla.setDate(primerDiaMes.getDate() - diffInicio);

    // Calcular fin de grilla (final de la semana que contiene el último día del mes)
    const diaFin = ultimoDiaMes.getDay(); //0-6
    const diffFin = (weekDay + 6 - diaFin + 7) % 7;
    const finGrilla = new Date(ultimoDiaMes);
    finGrilla.setDate(ultimoDiaMes.getDate() + diffFin);

    const dias = [];
    const cursor = new Date(inicioGrilla);

    while (cursor <= finGrilla) {
      const dia = {
        date: new Date(cursor),
        numberDay: new Intl.DateTimeFormat(locale, { day: '2-digit' }).format(
          new Date(cursor)
        ),
        isToday: cursor.toDateString() === new Date().toDateString(),
        isWeekend: cursor.getDay() === 0 || cursor.getDay() === 6,
        isInCurrentMonth: cursor.getMonth() === month,
      };

      dias.push(dia);
      cursor.setDate(cursor.getDate() + 1);
    }

    return dias;
  }, [currentDate, weekDay, locale]);
}
