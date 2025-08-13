import { h } from 'preact';
import { useState, useMemo } from 'preact/hooks';

/**
 * @name EventList
 * @summary
 * Componente para mostrar lista de eventos con filtros y búsqueda
 *
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.events - Array de eventos
 * @param {Function} props.onEditEvent - Callback para editar evento
 * @param {Function} props.onDeleteEvent - Callback para eliminar evento
 * @param {Function} props.onDateSelect - Callback para seleccionar fecha
 * @return {JSX.Element} Componente de lista de eventos
 */
export const EventList = ({
  events = [],
  onEditEvent,
  onDeleteEvent,
  onDateSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('upcoming'); // upcoming, all, past

  // Obtener tipos únicos de eventos
  const eventTypes = useMemo(() => {
    const types = [...new Set(events.map(event => event.type))];
    return types.sort();
  }, [events]);

  // Filtrar y ordenar eventos
  const filteredEvents = useMemo(() => {
    let filtered = events;
    const now = new Date();

    // Filtrar por modo de vista
    if (viewMode === 'upcoming') {
      filtered = filtered.filter(event => new Date(event.date) >= now);
    } else if (viewMode === 'past') {
      filtered = filtered.filter(event => new Date(event.date) < now);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        event =>
          event.title.toLowerCase().includes(term) ||
          event.description?.toLowerCase().includes(term) ||
          event.type.toLowerCase().includes(term)
      );
    }

    // Filtrar por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(event => event.type === filterType);
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.date) - new Date(b.date);
        case 'date-desc':
          return new Date(b.date) - new Date(a.date);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

    return filtered;
  }, [events, searchTerm, filterType, sortBy, viewMode]);

  // Agrupar eventos por fecha
  const groupedEvents = useMemo(() => {
    const groups = {};

    filteredEvents.forEach(event => {
      const dateKey = new Date(event.date).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
    });

    return Object.entries(groups).sort(([a], [b]) => {
      return sortBy.includes('desc')
        ? new Date(b) - new Date(a)
        : new Date(a) - new Date(b);
    });
  }, [filteredEvents, sortBy]);

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

  const formatEventDate = date => {
    const eventDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (eventDate.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (eventDate.toDateString() === tomorrow.toDateString()) {
      return 'Mañana';
    } else if (eventDate.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return eventDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year:
          eventDate.getFullYear() !== today.getFullYear()
            ? 'numeric'
            : undefined,
      });
    }
  };

  const isEventToday = date => {
    return new Date(date).toDateString() === new Date().toDateString();
  };

  const isEventPast = date => {
    return new Date(date) < new Date();
  };

  const handleEventClick = event => {
    if (onDateSelect) {
      onDateSelect(new Date(event.date));
    }
  };

  return (
    <div className='event-list space-y-4'>
      {/* Controles de filtrado y búsqueda */}
      <div className='space-y-4'>
        {/* Búsqueda */}
        <div className='relative'>
          <input
            type='text'
            placeholder='Buscar eventos...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='input w-full pl-10'
          />
          <div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'>
            🔍
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
            >
              ✕
            </button>
          )}
        </div>

        {/* Filtros */}
        <div className='flex flex-wrap gap-2'>
          {/* Modo de vista */}
          <select
            value={viewMode}
            onChange={e => setViewMode(e.target.value)}
            className='input text-sm'
          >
            <option value='upcoming'>Próximos</option>
            <option value='all'>Todos</option>
            <option value='past'>Pasados</option>
          </select>

          {/* Tipo */}
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className='input text-sm'
          >
            <option value='all'>Todos los tipos</option>
            {eventTypes.map(type => (
              <option key={type} value={type}>
                {getTypeIcon(type)}{' '}
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>

          {/* Ordenamiento */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className='input text-sm'
          >
            <option value='date'>Fecha (ascendente)</option>
            <option value='date-desc'>Fecha (descendente)</option>
            <option value='title'>Título</option>
            <option value='type'>Tipo</option>
          </select>
        </div>

        {/* Resumen de resultados */}
        <div className='text-sm text-secondary'>
          {filteredEvents.length === 0
            ? searchTerm || filterType !== 'all'
              ? 'No se encontraron eventos con los filtros aplicados'
              : 'No hay eventos disponibles'
            : `${filteredEvents.length} evento${filteredEvents.length !== 1 ? 's' : ''} ${
                searchTerm || filterType !== 'all'
                  ? 'encontrado' + (filteredEvents.length !== 1 ? 's' : '')
                  : ''
              }`}
        </div>
      </div>

      {/* Lista de eventos agrupados */}
      <div className='space-y-6'>
        {groupedEvents.map(([dateKey, dayEvents]) => {
          const date = new Date(dateKey);
          const isToday = isEventToday(dateKey);
          const isPast = isEventPast(dateKey);

          return (
            <div key={dateKey} className='space-y-3'>
              {/* Encabezado de fecha */}
              <div
                className={`sticky top-0 z-10 py-2 px-3 rounded-lg border-l-4 ${
                  isToday
                    ? 'bg-primary-50 border-primary-500'
                    : isPast
                      ? 'bg-gray-50 border-gray-300'
                      : 'bg-success-50 border-success-500'
                }`}
              >
                <h3
                  className={`font-semibold ${
                    isToday
                      ? 'text-primary-700'
                      : isPast
                        ? 'text-gray-600'
                        : 'text-success-700'
                  }`}
                >
                  {formatEventDate(dateKey)}
                  <span className='ml-2 text-sm font-normal'>
                    ({dayEvents.length} evento
                    {dayEvents.length !== 1 ? 's' : ''})
                  </span>
                </h3>
                <div className='text-xs opacity-75'>
                  {date.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>

              {/* Eventos del día */}
              <div className='space-y-2 ml-4'>
                {dayEvents.map(event => {
                  const color = getTypeColor(event.type);
                  const eventPast = isEventPast(event.date);

                  return (
                    <div
                      key={event.id}
                      className={`card p-4 cursor-pointer hover-lift transition-all ${
                        eventPast ? 'opacity-60' : ''
                      }`}
                      onClick={() => handleEventClick(event)}
                    >
                      <div className='flex items-start justify-between'>
                        {/* Información del evento */}
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-2 mb-1'>
                            <span className='text-lg'>
                              {getTypeIcon(event.type)}
                            </span>
                            <h4
                              className={`font-semibold truncate ${
                                eventPast ? 'line-through' : ''
                              }`}
                            >
                              {event.title}
                            </h4>
                            <span
                              className={`px-2 py-1 text-xs rounded-full bg-${color}-100 text-${color}-700`}
                            >
                              {event.type}
                            </span>
                          </div>

                          {event.description && (
                            <p className='text-sm text-secondary mb-2 line-clamp-2'>
                              {event.description}
                            </p>
                          )}

                          <div className='flex items-center gap-4 text-xs text-secondary'>
                            {!event.isAllDay && event.time && (
                              <span className='flex items-center gap-1'>
                                ⏰ {event.time}
                              </span>
                            )}
                            {event.isAllDay && (
                              <span className='flex items-center gap-1'>
                                📅 Todo el día
                              </span>
                            )}
                            {event.location && (
                              <span className='flex items-center gap-1'>
                                📍 {event.location}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className='flex items-center gap-1 ml-2'>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              onEditEvent?.(event);
                            }}
                            className='btn-icon btn-ghost hover:bg-primary-100'
                            title='Editar evento'
                          >
                            ✏️
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              if (
                                confirm(
                                  '¿Estás seguro de que quieres eliminar este evento?'
                                )
                              ) {
                                onDeleteEvent?.(event.id);
                              }
                            }}
                            className='btn-icon btn-ghost hover:bg-error-100'
                            title='Eliminar evento'
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Estado vacío */}
      {filteredEvents.length === 0 && (
        <div className='card p-8 text-center'>
          <div className='text-4xl mb-4'>
            {searchTerm || filterType !== 'all' ? '🔍' : '📅'}
          </div>
          <h3 className='font-semibold mb-2'>
            {searchTerm || filterType !== 'all'
              ? 'No se encontraron eventos'
              : 'No hay eventos disponibles'}
          </h3>
          <p className='text-secondary text-sm mb-4'>
            {searchTerm || filterType !== 'all'
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Comienza agregando tu primer evento al calendario'}
          </p>
          {(searchTerm || filterType !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
              }}
              className='btn btn-primary btn-sm'
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
};
