import { h } from 'preact';
import { getWeekDays } from '@/utils/dateUtils.js';

/**
 * @name WeekDaysHeader
 * @summary
 * Componente que renderiza el header con los nombres de los días de la semana
 * y opcionalmente una columna para números de semana
 *
 * @param {Object} props - Propiedades del componente
 * @param {number} [props.weekDay=0] - Primer día de la semana (0=Domingo, 1=Lunes)
 * @param {boolean} [props.showWeekNumbers=false] - Si mostrar la columna de números de semana
 *
 * @returns {JSX.Element} Elemento JSX que representa el header de días de la semana
 */
export const MonthDaysHeader = ({ weekDay = 0, showWeekNumbers = false }) => {
  const dayNames = getWeekDays(weekDay);

  return (
    <div
      className={`month-week-days-header ${showWeekNumbers ? 'with-week-numbers' : ''}`}
    >
      {showWeekNumbers && <div className='month-week-number-header'>Sem</div>}
      {dayNames.map(day => (
        <div
          key={day.index}
          className={`month-week-day-name ${day.isWeekend ? 'weekend' : ''}`}
        >
          {day.name}
        </div>
      ))}
    </div>
  );
};
