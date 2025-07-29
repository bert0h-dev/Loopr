import { h } from 'preact';
import { memo } from 'preact/compat';

/**
 * @name MonthDay
 * @summary Componente optimizado para renderizar un solo día
 */
const MonthDay = memo(({ day, index }) => (
  <div
    className={`month-day-cell ${day.isToday ? 'today' : ''} ${
      day.isInCurrentMonth ? '' : 'outside-month'
    } ${day.isWeekend ? 'weekend' : ''}`}
    key={index}
  >
    <span className='month-day-number'>{day.numberDay}</span>
  </div>
));

/**
 * @name MonthDays
 * @summary
 * Componente optimizado que renderiza la grilla de días del mes
 *
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.monthCalendarDays - Array de días obtenido de getMonthCalendar
 *
 * @returns {JSX.Element} Elemento JSX que representa la grilla de días del calendario
 */
export const MonthDays = memo(({ monthCalendarDays }) => {
  return (
    <div className='month-days-grid'>
      {monthCalendarDays.map((day, index) => (
        <MonthDay
          key={`${day.date.getTime()}-${index}`}
          day={day}
          index={index}
        />
      ))}
    </div>
  );
});
