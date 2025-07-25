import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';

/**
 * Componente header del calendario con controles de navegación
 * @param {Object} props - Propiedades del componente
 * @param {Date} props.currentDate - Fecha actual del calendario
 * @param {Object} props.controller - Objeto controlador del calendario
 * @returns {JSX.Element} Elemento JSX que representa el header del calendario
 */
export const CalendarHeader = ({ currentDate, controller }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastAction, setLastAction] = useState('');

  // Suscribirse a eventos específicos del calendario
  useEffect(() => {
    // Escuchar navegación de mes
    const unsubscribeNextMonth = controller.on(
      'nextMonth',
      ({ current, previous }) => {
        console.log('📅 Navegación: Mes siguiente', { current, previous });
        setLastAction('nextMonth');
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
      }
    );

    const unsubscribePrevMonth = controller.on(
      'prevMonth',
      ({ current, previous }) => {
        console.log('📅 Navegación: Mes anterior', { current, previous });
        setLastAction('prevMonth');
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
      }
    );

    // Escuchar navegación de año
    const unsubscribeNextYear = controller.on(
      'nextYear',
      ({ current, previous }) => {
        console.log('📅 Navegación: Año siguiente', { current, previous });
        setLastAction('nextYear');
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
      }
    );

    const unsubscribePrevYear = controller.on(
      'prevYear',
      ({ current, previous }) => {
        console.log('📅 Navegación: Año anterior', { current, previous });
        setLastAction('prevYear');
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
      }
    );

    // Escuchar cuando se va a "hoy"
    const unsubscribeGoToToday = controller.on(
      'goToToday',
      ({ current, previous }) => {
        console.log('📅 Navegación: Ir a hoy', { current, previous });
        setLastAction('goToToday');
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 500);
      }
    );

    // Escuchar cambios de mes (desde cualquier método)
    const unsubscribeMonthChange = controller.on(
      'monthChange',
      ({ current, previous }) => {
        console.log('📅 Cambio de mes detectado:', {
          from: `${previous.month}/${previous.year}`,
          to: `${current.month}/${current.year}`,
        });
      }
    );

    // Cleanup: desuscribirse cuando el componente se desmonte
    return () => {
      unsubscribeNextMonth();
      unsubscribePrevMonth();
      unsubscribeNextYear();
      unsubscribePrevYear();
      unsubscribeGoToToday();
      unsubscribeMonthChange();
    };
  }, [controller]);

  const formateador = new Intl.DateTimeFormat('es-ES', {
    month: 'long',
    year: 'numeric',
  });
  const formattedDate = formateador.format(currentDate);

  // Función para manejar el click en "Ir a hoy"
  const handleGoToToday = () => {
    controller.goToToday();
  };

  return (
    <header
      className={`header ${isAnimating ? 'animating' : ''} ${lastAction ? `action-${lastAction}` : ''}`}
    >
      <div className='header-nav-group'>
        <button
          onClick={controller.prevYear}
          title='Año anterior'
          disabled={isAnimating}
        >
          {' '}
          «{' '}
        </button>
        <button
          onClick={controller.prevMonth}
          title='Mes anterior'
          disabled={isAnimating}
        >
          {' '}
          ‹{' '}
        </button>
      </div>

      <button
        onClick={handleGoToToday}
        className='today-button'
        title='Ir a hoy'
        disabled={isAnimating}
      >
        Hoy
      </button>

      <div className='header-center-date'>
        <span>{`${formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}`}</span>
      </div>

      <div className='header-nav-group'>
        <button
          onClick={controller.nextMonth}
          title='Mes siguiente'
          disabled={isAnimating}
        >
          {' '}
          ›{' '}
        </button>
        <button
          onClick={controller.nextYear}
          title='Año siguiente'
          disabled={isAnimating}
        >
          {' '}
          »{' '}
        </button>
      </div>
    </header>
  );
};
