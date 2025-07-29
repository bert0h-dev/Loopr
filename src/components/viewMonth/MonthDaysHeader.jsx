import { h } from 'preact';
import { getWeekDays } from '@/utils/dateUtils.js';

/**
 * @name WeekDaysHeader
 * @summary
 * Componente que renderiza el header con los nombres de los días de la semana
 *
 * @param {Object} props - Propiedades del componente
 * @param {number} [props.primerDiaSemana=0] - Primer día de la semana (0=Domingo, 1=Lunes)
 *
 * @returns {JSX.Element} Elemento JSX que representa el header de días de la semana
 */
export const MonthDaysHeader = ({ weekDay = 0 }) => {
  const dayNames = getWeekDays(weekDay);

  return (
    <div className='month-week-days-header'>
      {dayNames.map(day => (
        <div
          key={day.index}
          className={`month-week-day-name ${day.esFinDeSemana ? 'weekend' : ''}`}
        >
          {day.nombre}
        </div>
      ))}
    </div>
  );
};
