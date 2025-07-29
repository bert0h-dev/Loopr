import { h } from 'preact';
import { memo } from 'preact/compat';
import { getWeekNumbers } from '@/utils/dateUtils.js';

/**
 * @name MonthDay
 * @summary Componente optimizado para renderizar un solo día
 */
const MonthDay = memo(({ day, index }) => (
  <div
    className={`month-day-cell ${day.isToday ? 'is-today' : ''} ${
      day.isInCurrentMonth ? '' : 'is-other-month'
    } ${day.isWeekend ? 'is-weekend' : ''}`}
    key={index}
  >
    <span className='month-day-number'>{day.numberDay}</span>
  </div>
));

/**
 * @name WeekNumber
 * @summary Componente para mostrar el número de semana
 */
const WeekNumber = memo(({ weekNumber }) => (
  <div className='month-week-number-cell'>
    <span className='month-week-number'>{weekNumber}</span>
  </div>
));

/**
 * @name MonthDays
 * @summary
 * Componente optimizado que renderiza la grilla de días del mes
 * con soporte opcional para números de semana
 *
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.monthCalendarDays - Array de días obtenido de useCalendarMonth
 * @param {boolean} [props.showWeekNumbers=false] - Si mostrar números de semana
 * @param {number} [props.weekDay=0] - Primer día de la semana para cálculo de números de semana
 *
 * @returns {JSX.Element} Elemento JSX que representa la grilla de días del calendario
 */
export const MonthDays = memo(
  ({ monthCalendarDays, showWeekNumbers = false, weekDay = 0 }) => {
    // Calcular números de semana si están habilitados
    const weekNumbers = showWeekNumbers
      ? getWeekNumbers(monthCalendarDays, weekDay)
      : [];

    // Función para renderizar una fila (semana) del calendario
    const renderWeekRow = (weekDays, weekIndex) => {
      const weekNumber = weekNumbers[weekIndex];

      return [
        // Número de semana (si está habilitado)
        showWeekNumbers && (
          <WeekNumber key={`week-${weekIndex}`} weekNumber={weekNumber} />
        ),
        // Días de la semana
        ...weekDays.map((day, dayIndex) => (
          <MonthDay
            key={`${day.date.getTime()}-${weekIndex}-${dayIndex}`}
            day={day}
            index={weekIndex * 7 + dayIndex}
          />
        )),
      ].filter(Boolean);
    };

    // Agrupar los días en semanas (filas de 7 días)
    const weeks = [];
    for (let i = 0; i < monthCalendarDays.length; i += 7) {
      weeks.push(monthCalendarDays.slice(i, i + 7));
    }

    return (
      <div
        className={`month-days-grid ${showWeekNumbers ? 'with-week-numbers' : ''}`}
      >
        {weeks.map((weekDays, weekIndex) => renderWeekRow(weekDays, weekIndex))}
      </div>
    );
  }
);
