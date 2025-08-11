import { h } from 'preact';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * @name AgendaView
 * @summary Vista de agenda del calendario
 */
export const AgendaView = ({ date }) => {
  return (
    <div className='calendar-view agenda-view'>
      <h2>Vista Agenda</h2>
      <p>
        Agenda para:{' '}
        {format(date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es })}
      </p>
      <div className='agenda-content'>
        {/* Aquí iria el contenido de la agenda */}
        <p>Vista agenda - En desarrollo</p>
      </div>
    </div>
  );
};
