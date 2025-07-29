import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { useCalendarContext } from '@/context/CalendarContext.jsx';
import { ToolbarOptions } from '@/config/ToolbarConfig.js';

/**
 * @name ToolbarSection
 * @summary
 * Componente de sección de la barra de herramientas del calendario.
 *
 * @param {Array} section - Sección de la barra de herramientas a renderizar.
 * @returns {JSX.Element} Elemento JSX que representa una sección de la barra de herramientas del calendario
 */

export const ToolbarSection = ({ section }) => {
  let children = [];
  const [isAnimating, setIsAnimating] = useState(false);

  // Acceso al contexto unificado del calendario
  const {
    currentDate,
    config,
    activeView,
    dateController,
    // Acciones categorizadas (nueva arquitectura)
    navigation,
    view,
    // Acciones directas para compatibilidad
    setActiveView,
  } = useCalendarContext();

  let formattedConfig = config.viewFormats[activeView] || {
    month: 'long',
  };

  // Suscribirse a eventos específicos del calendario
  useEffect(() => {
    // Escuchar navegación de mes
    const unsubscribeNextMonth = dateController.on(
      'nextMonth',
      ({ current, previous }) => {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
      }
    );

    const unsubscribePrevMonth = dateController.on(
      'prevMonth',
      ({ current, previous }) => {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
      }
    );

    // Escuchar navegación de año
    const unsubscribeNextYear = dateController.on(
      'nextYear',
      ({ current, previous }) => {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
      }
    );

    const unsubscribePrevYear = dateController.on(
      'prevYear',
      ({ current, previous }) => {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
      }
    );

    // Escuchar cuando se va a "hoy"
    const unsubscribeGoToToday = dateController.on(
      'goToToday',
      ({ current, previous }) => {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 500);
      }
    );

    // Escuchar cambios de mes (desde cualquier método)
    const unsubscribeMonthChange = dateController.on(
      'monthChange',
      ({ current, previous }) => {}
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
  }, [dateController]);

  const formateador = new Intl.DateTimeFormat(config.locale, formattedConfig);
  const formattedDate = formateador.format(currentDate);

  const handleGoToAction = action => {
    switch (action) {
      case 'today':
        navigation.goToToday();
        break;
      case 'prev':
        navigation.prevMonth();
        break;
      case 'next':
        navigation.nextMonth();
        break;
      case 'prevYear':
        navigation.prevYear();
        break;
      case 'nextYear':
        navigation.nextYear();
        break;
      case 'month':
        view.showMonthView();
        break;
      case 'week':
        view.showWeekView();
        break;
      case 'day':
        view.showDayView();
        break;
      case 'agenda':
        view.showAgendaView();
        break;
      default:
        console.warn(`Acción desconocida: ${action}`);
        break;
    }
  };

  section.forEach(element => {
    let { action } = element;
    if (action !== '') {
      if (action === 'title') {
        children.push(
          <h2 className='toolbar-title'>{`${formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}`}</h2>
        );
      } else {
        let { buttonClick, buttonTitle, buttonClass, buttonText } =
          ToolbarOptions[action] || {};
        let buttonClasses = [
          'btn',
          buttonClass || '',
          isAnimating ? 'is-loading' : '',
        ];
        if (buttonClick === 'month') {
          switch (activeView) {
            case 'month':
              buttonClasses.push('is-active');
              break;
            case 'week':
              buttonClasses.push('is-disabled');
              break;
            case 'day':
              buttonClasses.push('is-disabled');
              break;
            case 'agenda':
              buttonClasses.push('is-disabled');
              break;
            default:
              break;
          }
        }

        children.push(
          <button
            type='button'
            title={buttonTitle}
            className={buttonClasses.join(' ')}
            onClick={() => handleGoToAction(buttonClick)}
            aria-label={buttonTitle}
          >
            {buttonText || ''}
          </button>
        );
      }
    }
  });

  return <div className='toolbar-section'>{children}</div>;
};
