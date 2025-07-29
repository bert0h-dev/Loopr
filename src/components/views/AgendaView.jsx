import { h } from 'preact';

/**
 * @name AgendaView
 * @summary Vista de agenda del calendario
 */
export const AgendaView = ({ date }) => {
  return (
    <div className='calendar-view agenda-view'>
      <h2>Vista Agenda</h2>
      <p>Agenda para: {date.toLocaleDateString()}</p>
      <div className='agenda-content'>
        {/* Aquí iria el contenido de la agenda */}
        <p>Vista agenda - En desarrollo</p>
      </div>
    </div>
  );
};
