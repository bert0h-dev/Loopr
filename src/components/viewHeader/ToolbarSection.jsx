import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { useCalendarConfig } from '@/hooks/useCalendarConfig.js';
import { useCalendarDate } from '@/hooks/useCalendarDate.js';
import { ToolbarOptions } from '@/config/ToolbarConfig.js';
import { useCalendarViews } from '@/hooks/useCalendarViews.js';

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

  // Hook del contexto
  const { currentDate, ...dateController } = useCalendarDate();
  const { config } = useCalendarConfig();
  const { activeView, showMonthView } = useCalendarViews();

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
        dateController.goToToday();
        break;
      case 'prev':
        dateController.prevMonth();
        break;
      case 'next':
        dateController.nextMonth();
        break;
      case 'prevYear':
        dateController.prevYear();
        break;
      case 'nextYear':
        dateController.nextYear();
        break;
      case 'month':
        showMonthView;
        break;
      case 'week':
        console.log('Función de vista semanal no implementada');
        break;
      case 'day':
        console.log('Función de vista diaria no implementada');
        break;
      case 'agenda':
        console.log('Función de vista de agenda no implementada');
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
