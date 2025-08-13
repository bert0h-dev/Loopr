import { h } from 'preact';
import { useMemo } from 'preact/hooks';

/**
 * @name CalendarGrid
 * @summary
 * Componente para mostrar la vista de calendario en forma de cuadrícula
 *
 * @param {Object} props - Propiedades del componente
 * @param {Date} props.currentDate - Fecha actual del calendario
 * @param {Array} props.events - Array de eventos
 * @param {Function} props.onDateClick - Callback al hacer click en una fecha
 * @param {Function} props.onEventClick - Callback al hacer click en un evento
 * @return {JSX.Element} Componente de cuadrícula del calendario
 */
export const CalendarGrid = ({
  currentDate,
  events = [],
  onDateClick,
  onEventClick,
  selectedDate,
}) => {
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Primer día del mes
    const firstDay = new Date(year, month, 1);
    // Último día del mes
    const lastDay = new Date(year, month + 1, 0);

    // Primer día de la semana (domingo = 0)
    const firstDayWeek = firstDay.getDay();

    const days = [];

    // Días del mes anterior (para completar la primera semana)
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = firstDayWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonth.getDate() - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        events: getEventsForDate(date, events),
      });
    }

    // Días del mes actual
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();

      days.push({
        date,
        isCurrentMonth: true,
        isToday,
        events: getEventsForDate(date, events),
      });
    }

    // Días del mes siguiente (para completar la última semana)
    const totalDays = days.length;
    const remainingDays = 42 - totalDays; // 6 semanas * 7 días

    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        events: getEventsForDate(date, events),
      });
    }

    return days;
  }, [currentDate, events]);

  const handleDateClick = dayInfo => {
    if (onDateClick) {
      onDateClick(dayInfo.date, dayInfo);
    }
  };

  const handleEventClick = (event, e) => {
    e.stopPropagation();
    if (onEventClick) {
      onEventClick(event);
    }
  };

  return (
    <div className='calendar-grid-container'>
      {/* Cabecera de días de la semana */}
      <div className='calendar-weekdays grid grid-cols-7 gap-0 mb-2'>
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day, index) => (
          <div
            key={index}
            className='calendar-weekday text-center py-3 font-semibold text-sm bg-secondary text-primary border border-secondary'
          >
            {day}
          </div>
        ))}
      </div>

      {/* Cuadrícula de días */}
      <div className='calendar-grid grid grid-cols-7 gap-0 border border-secondary rounded-lg overflow-hidden'>
        {calendarDays.map((dayInfo, index) => {
          const isSelected =
            selectedDate &&
            dayInfo.date.toDateString() === selectedDate.toDateString();

          return (
            <div
              key={index}
              onClick={() => handleDateClick(dayInfo)}
              className={`
                calendar-cell min-h-24 p-2 border-r border-b border-secondary cursor-pointer transition-all duration-150
                ${
                  dayInfo.isCurrentMonth
                    ? 'bg-white hover:bg-gray-50'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }
                ${
                  dayInfo.isToday
                    ? 'bg-primary-50 border-primary-300 font-semibold'
                    : ''
                }
                ${
                  isSelected
                    ? 'bg-primary-100 border-primary-500 ring-2 ring-primary-200'
                    : ''
                }
              `}
            >
              {/* Número del día */}
              <div
                className={`
                text-sm mb-1 flex items-center justify-between
                ${dayInfo.isToday ? 'text-primary-700' : ''}
                ${!dayInfo.isCurrentMonth ? 'text-gray-400' : 'text-gray-700'}
              `}
              >
                <span
                  className={`
                  ${dayInfo.isToday ? 'bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold' : ''}
                `}
                >
                  {dayInfo.date.getDate()}
                </span>

                {/* Indicador de eventos */}
                {dayInfo.events.length > 0 && (
                  <div className='flex gap-1'>
                    {dayInfo.events.slice(0, 3).map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className={`w-2 h-2 rounded-full ${getEventColor(event.type)} cursor-pointer`}
                        title={event.title}
                        onClick={e => handleEventClick(event, e)}
                      />
                    ))}
                    {dayInfo.events.length > 3 && (
                      <span className='text-xs text-gray-500'>
                        +{dayInfo.events.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Lista de eventos (solo mostrar algunos) */}
              <div className='space-y-1'>
                {dayInfo.events.slice(0, 2).map((event, eventIndex) => (
                  <div
                    key={eventIndex}
                    onClick={e => handleEventClick(event, e)}
                    className={`
                      text-xs p-1 rounded cursor-pointer truncate
                      ${getEventStyle(event.type)}
                      hover:opacity-80 transition-opacity
                    `}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}

                {dayInfo.events.length > 2 && (
                  <div className='text-xs text-gray-500 font-medium'>
                    +{dayInfo.events.length - 2} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Obtener eventos para una fecha específica
 */
function getEventsForDate(date, events) {
  return events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate.toDateString() === date.toDateString();
  });
}

/**
 * Obtener color del punto de evento según el tipo
 */
function getEventColor(type) {
  const colors = {
    personal: 'bg-primary-500',
    work: 'bg-warning-500',
    meeting: 'bg-success-500',
    holiday: 'bg-error-500',
    default: 'bg-gray-500',
  };
  return colors[type] || colors.default;
}

/**
 * Obtener estilo de evento según el tipo
 */
function getEventStyle(type) {
  const styles = {
    personal: 'bg-primary-100 text-primary-700 border border-primary-200',
    work: 'bg-warning-100 text-warning-700 border border-warning-200',
    meeting: 'bg-success-100 text-success-700 border border-success-200',
    holiday: 'bg-error-100 text-error-700 border border-error-200',
    default: 'bg-gray-100 text-gray-700 border border-gray-200',
  };
  return styles[type] || styles.default;
}
