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
    navigation,
    view,
    ui,
  } = useCalendarContext();
  const todooo = useCalendarContext();

  // Usar el estado de loading del contexto en lugar del estado local isAnimating
  const isLoading = ui?.loading || false;
  console.log(todooo);

  let formattedConfig = config.viewFormats[activeView] || {
    month: 'long',
  };

  // Suscribirse a eventos específicos del calendario para animaciones adicionales si es necesario
  useEffect(() => {
    // Escuchar cambios de mes para animaciones adicionales
    const unsubscribeMonthChange = dateController.on(
      'nextMonth',
      ({ current, previous }) => {
        // Aquí puedes agregar animaciones específicas si las necesitas
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
      }
    );

    // Cleanup: desuscribirse cuando el componente se desmonte
    return () => {
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
          'button',
          'is-primary',
          buttonClass || '',
          isLoading ? 'is-loading' : '',
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
