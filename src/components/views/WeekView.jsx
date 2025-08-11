import { h } from 'preact';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * @name WeekView
 * @summary Vista semanal del calendario
 */
export const WeekView = ({ date }) => {
  // Calcular inicio y fin de la semana usando date-fns
  const weekStart = startOfWeek(date, { locale: es });
  const weekEnd = endOfWeek(date, { locale: es });

  return (
    <div className='calendar-view week-view'>
      <h2>Vista Semanal</h2>
      <p>
        Semana del {format(weekStart, "dd 'de' MMMM", { locale: es })} al{' '}
        {format(weekEnd, "dd 'de' MMMM 'de' yyyy", { locale: es })}
      </p>
      <div className='week-content'>
        {/* Aquí iria el contenido de la vista semanal */}
        <p>Vista semanal - En desarrollo</p>
      </div>
    </div>
  );
};
