import { h } from 'preact';

/**
 * @name WeekView
 * @summary Vista semanal del calendario
 */
export const WeekView = ({ date }) => {
  return (
    <div className='calendar-view week-view'>
      <h2>Vista Semanal</h2>
      <p>Semana de: {date.toLocaleDateString()}</p>
      <div className='week-content'>
        {/* Aquí iria el contenido de la vista semanal */}
        <p>Vista semanal - En desarrollo</p>
      </div>
    </div>
  );
};
