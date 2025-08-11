import { h } from 'preact';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * @name DayView
 * @summary Vista diaria del calendario
 */
export const DayView = ({ date }) => {
  return (
    <div className='calendar-view day-view'>
      <h2>Vista Diaria</h2>
      <p>Día: {format(date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es })}</p>
      <div className='day-content'>
        {/* Aquí iria el contenido de la vista diaria */}
        <p>Vista diaria - En desarrollo</p>
      </div>
    </div>
  );
};
