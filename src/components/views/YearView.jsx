import { h } from 'preact';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * @name YearView
 * @summary Vista anual del calendario
 */
export const YearView = ({ date }) => {
  return (
    <div className='calendar-view year-view'>
      <h2>Vista Anual</h2>
      <p>Año: {format(date, 'yyyy', { locale: es })}</p>
      <div className='year-content'>
        {/* Aquí iria el contenido de la vista anual */}
        <p>Vista anual - En desarrollo</p>
      </div>
    </div>
  );
};
