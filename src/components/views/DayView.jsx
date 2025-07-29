import { h } from 'preact';

/**
 * @name DayView
 * @summary Vista diaria del calendario
 */
export const DayView = ({ date }) => {
  return (
    <div className='calendar-view day-view'>
      <h2>Vista Diaria</h2>
      <p>Día: {date.toLocaleDateString()}</p>
      <div className='day-content'>
        {/* Aquí iria el contenido de la vista diaria */}
        <p>Vista diaria - En desarrollo</p>
      </div>
    </div>
  );
};
