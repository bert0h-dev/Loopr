import { h } from 'preact';

/**
 * @name MonthDays
 * @summary
 * Componente que renderiza la grilla de días del mes
 *
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.monthCalendarDays - Array de días obtenido de getMonthCalendar
 *
 * @returns {JSX.Element} Elemento JSX que representa la grilla de días del calendario
 */
export const MonthDays = ({ monthCalendarDays }) => {
  return (
    <div className='month-days-grid'>
      {monthCalendarDays.map((day, index) => {
        return (
          <div
            className={`month-day-cell ${day.isToday ? 'today' : ''} ${
              day.isInCurrentMonth ? '' : 'outside-month'
            } ${day.isWeekend ? 'weekend' : ''}`}
            key={index}
          >
            <span className='month-day-number'>{day.numberDay}</span>
          </div>
        );
      })}
    </div>
  );
};
