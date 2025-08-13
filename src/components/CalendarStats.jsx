import { h } from 'preact';
import { useMemo } from 'preact/hooks';

/**
 * @name CalendarStats
 * @summary
 * Componente para mostrar estadísticas del calendario
 *
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.events - Array de eventos
 * @param {Date} props.currentDate - Fecha actual del calendario
 * @param {string} props.view - Vista actual del calendario
 * @return {JSX.Element} Componente de estadísticas
 */
export const CalendarStats = ({ events = [], currentDate, view }) => {
  const stats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    // Eventos del mes actual
    const monthEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= startOfMonth && eventDate <= endOfMonth;
    });

    // Eventos por tipo
    const eventsByType = events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {});

    // Eventos próximos (próximos 7 días)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcomingEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= now && eventDate <= nextWeek;
    });

    // Eventos pasados este mes
    const pastEventsThisMonth = monthEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate < now;
    });

    // Días con eventos este mes
    const daysWithEvents = new Set(
      monthEvents.map(event => new Date(event.date).toDateString())
    ).size;

    const totalDaysInMonth = endOfMonth.getDate();
    const busyDaysPercentage =
      totalDaysInMonth > 0 ? (daysWithEvents / totalDaysInMonth) * 100 : 0;

    return {
      total: events.length,
      thisMonth: monthEvents.length,
      upcoming: upcomingEvents.length,
      pastThisMonth: pastEventsThisMonth.length,
      byType: eventsByType,
      daysWithEvents,
      totalDaysInMonth,
      busyDaysPercentage: Math.round(busyDaysPercentage),
    };
  }, [events, currentDate]);

  const getTypeIcon = type => {
    const icons = {
      personal: '👤',
      work: '💼',
      meeting: '👥',
      holiday: '🏖️',
      reminder: '🔔',
      default: '📅',
    };
    return icons[type] || icons.default;
  };

  const getTypeColor = type => {
    const colors = {
      personal: 'primary',
      work: 'warning',
      meeting: 'success',
      holiday: 'error',
      reminder: 'gray',
      default: 'gray',
    };
    return colors[type] || colors.default;
  };

  const formatMonthYear = date => {
    return date.toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className='calendar-stats space-y-4'>
      {/* Estadísticas principales */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='card p-4 text-center hover-lift transition-all'>
          <div className='text-2xl font-bold text-primary mb-1'>
            {stats.total}
          </div>
          <div className='text-sm text-secondary'>Total eventos</div>
        </div>

        <div className='card p-4 text-center hover-lift transition-all'>
          <div className='text-2xl font-bold text-success-600 mb-1'>
            {stats.thisMonth}
          </div>
          <div className='text-sm text-secondary'>Este mes</div>
        </div>

        <div className='card p-4 text-center hover-lift transition-all'>
          <div className='text-2xl font-bold text-warning-600 mb-1'>
            {stats.upcoming}
          </div>
          <div className='text-sm text-secondary'>Próximos 7 días</div>
        </div>

        <div className='card p-4 text-center hover-lift transition-all'>
          <div className='text-2xl font-bold text-gray-600 mb-1'>
            {stats.busyDaysPercentage}%
          </div>
          <div className='text-sm text-secondary'>Días ocupados</div>
        </div>
      </div>

      {/* Gráfico de ocupación del mes */}
      <div className='card p-4'>
        <h4 className='font-semibold mb-3 flex items-center gap-2'>
          📊 Ocupación en {formatMonthYear(currentDate)}
        </h4>

        <div className='mb-3'>
          <div className='flex justify-between text-sm text-secondary mb-1'>
            <span>
              Días con eventos: {stats.daysWithEvents}/{stats.totalDaysInMonth}
            </span>
            <span>{stats.busyDaysPercentage}%</span>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-2'>
            <div
              className='bg-primary-600 h-2 rounded-full transition-all duration-500'
              style={{ width: `${stats.busyDaysPercentage}%` }}
            ></div>
          </div>
        </div>

        {stats.thisMonth > 0 && (
          <div className='text-sm text-secondary'>
            <span className='text-success-600 font-medium'>
              {stats.pastThisMonth}
            </span>{' '}
            completados,
            <span className='text-warning-600 font-medium ml-1'>
              {stats.thisMonth - stats.pastThisMonth}
            </span>{' '}
            pendientes
          </div>
        )}
      </div>

      {/* Eventos por tipo */}
      {Object.keys(stats.byType).length > 0 && (
        <div className='card p-4'>
          <h4 className='font-semibold mb-3 flex items-center gap-2'>
            🏷️ Eventos por tipo
          </h4>

          <div className='space-y-2'>
            {Object.entries(stats.byType)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count]) => {
                const percentage = Math.round((count / stats.total) * 100);
                const color = getTypeColor(type);

                return (
                  <div key={type} className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <span className='text-lg'>{getTypeIcon(type)}</span>
                      <span className='text-sm capitalize'>{type}</span>
                    </div>

                    <div className='flex items-center gap-2'>
                      <div className='flex-1 min-w-16'>
                        <div className='w-full bg-gray-200 rounded-full h-1.5'>
                          <div
                            className={`bg-${color}-600 h-1.5 rounded-full transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className='text-sm font-medium text-right min-w-12'>
                        <div className={`text-${color}-600`}>{count}</div>
                        <div className='text-xs text-gray-500'>
                          {percentage}%
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Próximos eventos */}
      {stats.upcoming > 0 && (
        <div className='card p-4'>
          <h4 className='font-semibold mb-3 flex items-center gap-2'>
            ⏰ Próximos eventos
          </h4>

          <div className='space-y-2'>
            {events
              .filter(event => {
                const eventDate = new Date(event.date);
                const now = new Date();
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                return eventDate >= now && eventDate <= nextWeek;
              })
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .slice(0, 5)
              .map(event => {
                const eventDate = new Date(event.date);
                const daysUntil = Math.ceil(
                  (eventDate - new Date()) / (1000 * 60 * 60 * 24)
                );

                return (
                  <div
                    key={event.id}
                    className='flex items-center justify-between p-2 bg-gray-50 rounded'
                  >
                    <div className='flex items-center gap-2'>
                      <span className='text-sm'>{getTypeIcon(event.type)}</span>
                      <div>
                        <div className='font-medium text-sm'>{event.title}</div>
                        <div className='text-xs text-gray-500'>
                          {eventDate.toLocaleDateString('es-ES', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}
                          {event.time && !event.isAllDay && ` • ${event.time}`}
                        </div>
                      </div>
                    </div>

                    <div className='text-right'>
                      <div
                        className={`text-xs px-2 py-1 rounded-full ${
                          daysUntil === 0
                            ? 'bg-error-100 text-error-700'
                            : daysUntil === 1
                              ? 'bg-warning-100 text-warning-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {daysUntil === 0
                          ? 'Hoy'
                          : daysUntil === 1
                            ? 'Mañana'
                            : `${daysUntil} días`}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {stats.total === 0 && (
        <div className='card p-8 text-center'>
          <div className='text-4xl mb-4'>📅</div>
          <h4 className='font-semibold mb-2'>No hay eventos</h4>
          <p className='text-secondary text-sm'>
            Comienza agregando tu primer evento al calendario
          </p>
        </div>
      )}
    </div>
  );
};
