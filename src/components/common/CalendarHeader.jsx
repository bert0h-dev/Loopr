import { h } from 'preact';

/**
 * Componente header del calendario con controles de navegación
 * @param {Object} props - Propiedades del componente
 * @param {Date} props.currentDate - Fecha actual del calendario
 * @param {Object} props.controller - Objeto controlador del calendario
 * @returns {JSX.Element} Elemento JSX que representa el header del calendario
 */
export const CalendarHeader = ({ currentDate, controller }) => {
  const formateador = new Intl.DateTimeFormat('es-ES', {
    month: 'long',
    year: 'numeric',
  });
  const formattedDate = formateador.format(currentDate);

  return (
    <header className='header'>
      <div className='header-nav-group'>
        <button onClick={controller.prevYear} title='Año anterior'>
          {' '}
          «{' '}
        </button>
        <button onClick={controller.prevMonth} title='Mes anterior'>
          {' '}
          ‹{' '}
        </button>
      </div>

      <button
        className='today-button'
        onClick={controller.goToToday}
        title='Ir a hoy'
      >
        Hoy
      </button>

      <div className='header-center-date'>
        <span>{`${formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}`}</span>
      </div>

      <div className='header-nav-group'>
        <button onClick={controller.nextMonth} title='Mes siguiente'>
          {' '}
          ›{' '}
        </button>
        <button onClick={controller.nextYear} title='Año siguiente'>
          {' '}
          »{' '}
        </button>
      </div>
    </header>
  );
};
