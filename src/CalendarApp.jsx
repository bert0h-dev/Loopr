import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';

// Usando los nuevos alias de resolución de módulos
import { useCalendar } from '@/hooks/useCalendar.js';
import { CALENDAR_VIEWS, WEEKDAYS } from '@/constants/calendar.js';
import { ThemeSwitcher } from '@/components/ThemeSwitcher.jsx';
import { CalendarGrid } from '@/components/CalendarGrid.jsx';
import { EventModal } from '@/components/EventModal.jsx';
import { CalendarStats } from '@/components/CalendarStats.jsx';
import { EventList } from '@/components/EventList.jsx';
import { VisualNotificationSettings } from '@/components/VisualNotificationSettings.jsx';
import { ToastSystem } from '@/components/ToastSystem.jsx';
import {
  useToast,
  VisualNotificationManager,
} from '@/contexts/ToastContext.jsx';

/**
 * @name CalendarApp
 * @summary
 * Componente principal del calendario Loopr con notificaciones visuales.
 * Demuestra el uso de los nuevos alias de resolución de módulos.
 *
 * @param {Object} config - Configuración del calendario
 * @return {JSX.Element} Componente del calendario
 */
export const CalendarApp = ({ config }) => {
  // Hooks del sistema de notificaciones visuales
  const toast = useToast();
  const visualNotificationManagerRef = useRef(null);

  // Usando el hook personalizado
  const calendar = useCalendar(config);

  // Estados para los nuevos componentes
  const [selectedDate, setSelectedDate] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [activeView, setActiveView] = useState('calendar'); // calendar, list, stats
  const [isNotificationSettingsOpen, setIsNotificationSettingsOpen] =
    useState(false);

  // Inicializar el manager de notificaciones visuales
  useEffect(() => {
    if (!visualNotificationManagerRef.current && toast) {
      visualNotificationManagerRef.current = new VisualNotificationManager(
        toast
      );

      if (config.debug) {
        console.log('🎨 VisualNotificationManager inicializado');
      }
    }
  }, [toast, config.debug]);

  useEffect(() => {
    if (config.debug) {
      console.log('📅 CalendarApp inicializado con config:', config);
      console.log('🗓️ Calendar state:', {
        currentDate: calendar.currentDate.toDateString(),
        view: calendar.view,
        eventsCount: calendar.eventsCount,
      });
    }
  }, [config, calendar.currentDate, calendar.view, calendar.eventsCount]);

  // Manejar clicks en notificaciones visuales
  useEffect(() => {
    const handleReminderClick = event => {
      const { event: calendarEvent, action } = event.detail;

      if (action === 'view' && calendarEvent) {
        // Navegar al evento cuando se hace click en una notificación
        setSelectedDate(new Date(calendarEvent.date));
        setEditingEvent(calendarEvent);
        setIsEventModalOpen(true);
        setActiveView('calendar');

        toast.success(`📅 Mostrando evento: ${calendarEvent.title}`);
      }
    };

    window.addEventListener('reminderClicked', handleReminderClick);
    return () => {
      window.removeEventListener('reminderClicked', handleReminderClick);
    };
  }, [toast]);

  const handleViewChange = newView => {
    calendar.setView(newView);
    if (config.debug) {
      console.log(`📊 Vista cambiada a: ${newView}`);
    }
  };

  const formatDate = date => {
    return date.toLocaleDateString(config.locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Handlers para los nuevos componentes
  const handleDateClick = date => {
    setSelectedDate(date);
    setEditingEvent(null);
    setIsEventModalOpen(true);
  };

  const handleEventClick = event => {
    setEditingEvent(event);
    setSelectedDate(new Date(event.date));
    setIsEventModalOpen(true);
  };

  const handleEventSave = eventData => {
    if (editingEvent) {
      // Editar evento existente
      calendar.updateEvent(eventData);

      // Reprogramar notificaciones para el evento editado
      if (visualNotificationManagerRef.current) {
        visualNotificationManagerRef.current.rescheduleEventReminders(
          eventData
        );
      }

      toast.success(`✅ Evento "${eventData.title}" actualizado`);
    } else {
      // Crear nuevo evento
      const newEvent = calendar.addEvent(eventData);

      // Programar notificaciones para el nuevo evento
      if (visualNotificationManagerRef.current && newEvent) {
        visualNotificationManagerRef.current.scheduleEventReminders(newEvent);
      }

      toast.success(`🎉 Evento "${eventData.title}" creado`);
    }
  };

  const handleEventDelete = eventId => {
    const eventToDelete = calendar.events.find(e => e.id === eventId);

    if (eventToDelete) {
      // Cancelar notificaciones del evento
      if (visualNotificationManagerRef.current) {
        visualNotificationManagerRef.current.cancelEventReminders(eventId);
      }

      calendar.removeEvent(eventId);
      toast.success(`🗑️ Evento "${eventToDelete.title}" eliminado`);
    }
  };

  const handleModalClose = () => {
    setIsEventModalOpen(false);
    setEditingEvent(null);
    setSelectedDate(null);
  };

  return (
    <div className='calendar-container max-w-6xl mx-auto p-4'>
      {/* Header con ThemeSwitcher */}
      <div className='flex justify-between items-start mb-6'>
        <div className='flex-1'>
          <header className='calendar-header'>
            <h1 className='text-3xl font-bold text-center mb-6 text-primary'>
              🗓️ {config.name || 'Loopr Calendar'}
            </h1>
          </header>
        </div>

        {/* Theme Switcher y controles en la esquina superior derecha */}
        <div className='flex items-center gap-2 ml-4'>
          {/* Botón de configuración de notificaciones visuales */}
          <button
            onClick={() => setIsNotificationSettingsOpen(true)}
            className={`btn btn-ghost btn-sm relative transition-all duration-200 hover:scale-105`}
            title='Configurar notificaciones visuales'
          >
            🎨
            {visualNotificationManagerRef.current?.getStats().scheduled > 0 && (
              <span className='absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse'>
                {visualNotificationManagerRef.current.getStats().scheduled}
              </span>
            )}
          </button>

          <ThemeSwitcher />
        </div>
      </div>

      {/* Navegación de fecha */}
      <div className='calendar-navigation flex items-center justify-center gap-4 mb-6 flex-wrap'>
        <button onClick={calendar.goToPrevious} className='btn btn-secondary'>
          ← Anterior
        </button>

        <div className='current-date flex items-center gap-3 min-w-0'>
          <h2 className='text-xl font-semibold text-center'>
            {formatDate(calendar.currentDate)}
          </h2>
          {calendar.isToday && <span className='badge badge-primary'>HOY</span>}
        </div>

        <button onClick={calendar.goToNext} className='btn btn-secondary'>
          Siguiente →
        </button>

        <button onClick={calendar.goToToday} className='btn btn-primary'>
          Ir a Hoy
        </button>
      </div>

      {/* Selector de vista */}
      <div className='view-selector flex gap-2 justify-center mb-6 flex-wrap'>
        {/* Vistas de calendario */}
        {Object.entries(CALENDAR_VIEWS).map(([key, value]) => (
          <button
            key={key}
            onClick={() => {
              handleViewChange(value);
              setActiveView('calendar');
            }}
            className={`btn ${calendar.view === value && activeView === 'calendar' ? 'btn-primary' : 'btn-outline'}`}
          >
            {key}
          </button>
        ))}

        {/* Vistas adicionales */}
        <button
          onClick={() => setActiveView('list')}
          className={`btn ${activeView === 'list' ? 'btn-primary' : 'btn-outline'}`}
        >
          📋 Lista
        </button>

        <button
          onClick={() => setActiveView('stats')}
          className={`btn ${activeView === 'stats' ? 'btn-primary' : 'btn-outline'}`}
        >
          📊 Estadísticas
        </button>
      </div>

      {config.debug && (
        <div className='alert alert-warning mb-6'>
          <div className='text-sm'>
            <p className='font-medium mb-2'>🔧 Debug mode activo</p>
            <div className='grid grid-cols-2 gap-2 text-xs'>
              <p>
                Vista actual:{' '}
                <span className='font-medium'>{calendar.view}</span>
              </p>
              <p>Slots de tiempo: {config.enableTimeSlots ? '✅' : '❌'}</p>
              <p>
                Max eventos/día:{' '}
                <span className='font-medium'>{config.maxEventsPerDay}</span>
              </p>
              <p>
                Eventos actuales:{' '}
                <span className='font-medium'>{calendar.eventsCount}</span>
              </p>
              <p>Es hoy: {calendar.isToday ? '✅' : '❌'}</p>
            </div>
          </div>
        </div>
      )}

      <main className='calendar-content animate-fade-in'>
        {/* Contenido principal basado en la vista activa */}
        {activeView === 'calendar' && (
          <div className='calendar-view'>
            {/* Vista mensual con grid */}
            {calendar.view === CALENDAR_VIEWS.MONTH && (
              <div className='animate-slide-in-up'>
                <CalendarGrid
                  currentDate={calendar.currentDate}
                  events={calendar.events}
                  selectedDate={selectedDate}
                  onDateClick={handleDateClick}
                  onEventClick={handleEventClick}
                />
              </div>
            )}

            {/* Vista simplificada para otras vistas */}
            {calendar.view !== CALENDAR_VIEWS.MONTH && (
              <div className='card p-6 animate-slide-in-up'>
                <div className='text-center mb-6'>
                  <p className='text-lg text-secondary mb-2'>
                    📅 Vista {calendar.view}
                  </p>
                  <div className='flex flex-col sm:flex-row justify-center gap-4 text-sm'>
                    <span className='badge badge-secondary'>
                      Fecha: <strong>{formatDate(calendar.currentDate)}</strong>
                    </span>
                    <span className='badge badge-primary'>
                      {calendar.eventsCount} eventos
                    </span>
                  </div>
                </div>

                {/* Lista de eventos para vistas no mensuales */}
                <div className='space-y-3'>
                  {calendar.events.length === 0 ? (
                    <div className='text-center py-8 text-muted'>
                      <p className='text-2xl mb-2'>📅</p>
                      <p>No hay eventos en esta fecha</p>
                      <button
                        onClick={() => handleDateClick(calendar.currentDate)}
                        className='btn btn-primary mt-4'
                      >
                        + Agregar evento
                      </button>
                    </div>
                  ) : (
                    calendar.events.map(event => (
                      <div
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className='p-4 bg-secondary rounded-lg border-l-4 border-primary cursor-pointer hover-lift transition-all'
                      >
                        <div className='flex items-center justify-between'>
                          <h4 className='font-semibold text-primary'>
                            {event.title}
                          </h4>
                          <span className='text-xs text-muted'>
                            {event.isAllDay ? 'Todo el día' : event.time}
                          </span>
                        </div>
                        {event.description && (
                          <p className='text-sm text-secondary mt-1'>
                            {event.description}
                          </p>
                        )}
                        {event.location && (
                          <p className='text-xs text-muted mt-1'>
                            📍 {event.location}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeView === 'list' && (
          <div className='list-view animate-slide-in-up'>
            <EventList
              events={calendar.events}
              onEditEvent={handleEventClick}
              onDeleteEvent={handleEventDelete}
              onDateSelect={date => {
                calendar.setCurrentDate(date);
                setActiveView('calendar');
              }}
            />
          </div>
        )}

        {activeView === 'stats' && (
          <div className='stats-view animate-slide-in-up'>
            <CalendarStats
              events={calendar.events}
              currentDate={calendar.currentDate}
              view={calendar.view}
            />
          </div>
        )}

        {/* Modal de eventos */}
        <EventModal
          isOpen={isEventModalOpen}
          onClose={handleModalClose}
          onSave={handleEventSave}
          event={editingEvent}
          selectedDate={selectedDate}
        />

        {/* Modal de configuración de notificaciones visuales */}
        {isNotificationSettingsOpen && (
          <div className='modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
            <VisualNotificationSettings
              visualNotificationManager={visualNotificationManagerRef.current}
              onClose={() => setIsNotificationSettingsOpen(false)}
            />
          </div>
        )}

        {/* Sistema de notificaciones visuales */}
        <ToastSystem
          toasts={toast.toasts}
          onClose={toast.removeToast}
          config={toast.config}
        />
      </main>
    </div>
  );
};
