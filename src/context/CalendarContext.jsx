import { h, createContext } from 'preact';
import { useContext, useReducer, useCallback, useMemo } from 'preact/hooks';
import { useCalendarReducer } from '@/hooks/useCalendarReducer.js';
import { initialConfig as initialState } from '@/config/initialConfig.js';
import { useCalendarController } from '@/hooks/useCalendarController.js';
import { createCalendarActionsBase } from '@/hooks/useCalendarActions.js';

/**
 * @name CalendarContext
 * @summary
 * Contexto principal del calendario que centraliza todo el estado y las acciones
 * Proporciona acceso global al estado del calendario sin prop drilling
 */
const CalendarContext = createContext();

/**
 * @name CalendarProvider
 * @summary
 * Proveedor del contexto del calendario que envuelve toda la aplicación
 *
 * @param {Object} props - Propiedades del proveedor
 * @param {React.ReactNode} props.children - Componentes hijos que tendrán acceso al contexto
 * @param {Object} [props.initialConfig={}] - Configuración inicial del calendario
 * @param {Array} [props.initialEvents=[]] - Eventos iniciales del calendario
 *
 * @returns {import('preact').JSX.Element} Elemento JSX que representa el proveedor del contexto del calendario
 */
export const CalendarProvider = ({
  children,
  initialConfig = {},
  initialEvents = [],
}) => {
  // Estado del reducer del calendario
  const [state, dispatch] = useReducer(useCalendarReducer, {
    ...initialState,
    config: { ...initialState.config, ...initialConfig },
    events: initialEvents,
  });

  // Hook del controlador de fechas
  const [currentDate, dateController] = useCalendarController();

  // Usar las acciones base para evitar duplicación de código
  const actions = createCalendarActionsBase(dispatch);

  // Crear acciones categorizadas de forma más eficiente
  const categorizedActions = useMemo(() => {
    // Acciones de configuración - simplificadas
    const configActions = {
      updateConfig: actions.updateConfig,
      setLocale: locale => actions.updateConfig({ locale }),
      setFirstDayOfWeek: firstDayOfWeek =>
        actions.updateConfig({ firstDayOfWeek }),
      setTheme: theme => actions.updateConfig({ theme }),
      toggleTheme: () => {
        const newTheme = state.config.theme === 'light' ? 'dark' : 'light';
        actions.updateConfig({ theme: newTheme });
      },
      setTimeFormat: timeFormat => actions.updateConfig({ timeFormat }),
      setDateFormat: dateFormat => actions.updateConfig({ dateFormat }),
    };

    // Acciones de navegación - simplificadas sin useCallback anidados
    const navigationActions = {
      goToToday: () => dateController.goToToday(),
      nextMonth: () => dateController.nextMonth(),
      prevMonth: () => dateController.prevMonth(),
      nextYear: () => dateController.nextYear(),
      prevYear: () => dateController.prevYear(),
      nextWeek: () => dateController.incrementDate(1, 'week'),
      prevWeek: () => dateController.incrementDate(-1, 'week'),
      nextDay: () => dateController.incrementDate(1, 'day'),
      prevDay: () => dateController.incrementDate(-1, 'day'),
      setDate: date => dateController.setDate(date),
      gotoDate: date => dateController.gotoDate(date),
      incrementDate: (amount, unit) =>
        dateController.incrementDate(amount, unit),
    };

    // Acciones de vista
    const viewActions = {
      setActiveView: actions.setActiveView,
      showMonthView: useCallback(() => {
        actions.setActiveView('month');
      }, [actions.setActiveView]),
      showWeekView: useCallback(() => {
        actions.setActiveView('week');
      }, [actions.setActiveView]),
      showDayView: useCallback(() => {
        actions.setActiveView('day');
      }, [actions.setActiveView]),
      showAgendaView: useCallback(() => {
        actions.setActiveView('agenda');
      }, [actions.setActiveView]),
      showYearView: useCallback(() => {
        actions.setActiveView('year');
      }, [actions.setActiveView]),
    };

    // Acciones de eventos (con promesas para manejo de errores)
    const eventActions = {
      setEvents: actions.setEvents,
      addEvent: useCallback(
        event => {
          return new Promise((resolve, reject) => {
            try {
              const result = actions.addEvent(event);
              resolve(result || event);
            } catch (error) {
              actions.setError(`Error al agregar evento: ${error.message}`);
              reject(error);
            }
          });
        },
        [actions.addEvent, actions.setError]
      ),
      updateEvent: useCallback(
        (eventId, updates) => {
          return new Promise((resolve, reject) => {
            try {
              const result = actions.updateEvent(eventId, updates);
              resolve(result || { id: eventId, ...updates });
            } catch (error) {
              actions.setError(`Error al actualizar evento: ${error.message}`);
              reject(error);
            }
          });
        },
        [actions.updateEvent, actions.setError]
      ),
      deleteEvent: useCallback(
        eventId => {
          return new Promise((resolve, reject) => {
            try {
              const result = actions.deleteEvent(eventId);
              resolve(result || eventId);
            } catch (error) {
              actions.setError(`Error al eliminar evento: ${error.message}`);
              reject(error);
            }
          });
        },
        [actions.deleteEvent, actions.setError]
      ),
      setSelectedEvents: actions.setSelectedEvents,
      clearSelectedEvents: useCallback(() => {
        actions.setSelectedEvents([]);
      }, [actions.setSelectedEvents]),
      selectEvent: useCallback(
        event => {
          const currentSelected = state.selectedEvents || [];
          const isAlreadySelected = currentSelected.some(
            e => e.id === event.id
          );

          if (isAlreadySelected) {
            actions.setSelectedEvents(
              currentSelected.filter(e => e.id !== event.id)
            );
          } else {
            actions.setSelectedEvents([...currentSelected, event]);
          }
        },
        [actions.setSelectedEvents, state.selectedEvents]
      ),
    };

    // Acciones de UI
    const uiActions = {
      setUIState: actions.setUIState,
      openEventModal: actions.openEventModal,
      closeEventModal: actions.closeEventModal,
      setError: actions.setError,
      clearError: actions.clearError,
      setLoading: actions.setLoading,
      toggleSidebar: useCallback(() => {
        actions.setUIState(prev => ({
          ...prev,
          sidebarOpen: !prev.sidebarOpen,
        }));
      }, [actions.setUIState]),
      setSidebarOpen: useCallback(
        open => {
          actions.setUIState(prev => ({
            ...prev,
            sidebarOpen: open,
          }));
        },
        [actions.setUIState]
      ),
    };

    return {
      config: configActions,
      navigation: navigationActions,
      view: viewActions,
      events: eventActions,
      ui: uiActions,
    };
  }, [actions, dateController, state.config.theme, state.selectedEvents]);

  // Valor del contexto optimizado con memoización
  const contextValue = useMemo(
    () => ({
      // Estado del calendario (incluye state.config con la configuración)
      ...state,
      currentDate,

      // Controlador de fechas
      dateController,

      // Acciones base (mantener para compatibilidad)
      ...actions,

      // Acciones categorizadas (nueva API)
      // NOTA: configActions son las ACCIONES, state.config es la CONFIGURACIÓN
      configActions: categorizedActions.config,
      navigation: categorizedActions.navigation,
      view: categorizedActions.view,
      events: categorizedActions.events,
      ui: categorizedActions.ui,

      // Métodos de utilidad adicionales
      utils: {
        // Generar ID único para eventos
        generateEventId: actions.generateEventId,

        // Validar evento
        validateEvent: event => {
          if (!event || typeof event !== 'object') {
            throw new Error('El evento debe ser un objeto válido');
          }
          if (!event.title || event.title.trim() === '') {
            throw new Error('El evento debe tener un título');
          }
          if (!event.date) {
            throw new Error('El evento debe tener una fecha');
          }
          return true;
        },

        // Validar vista
        validateView: view => {
          const validViews = ['month', 'week', 'day', 'agenda', 'year'];
          if (!validViews.includes(view)) {
            throw new Error(
              `Vista '${view}' no es válida. Vistas disponibles: ${validViews.join(', ')}`
            );
          }
          return true;
        },

        // Obtener configuración actual
        getCurrentConfig: () => state.config,

        // Obtener eventos actuales
        getCurrentEvents: () => state.events,

        // Obtener estado UI actual
        getCurrentUIState: () => state.ui,

        // Verificar si hay errores
        hasError: () => !!state.ui?.error,

        // Verificar si está cargando
        isLoading: () => !!state.ui?.loading,
      },

      // Información del contexto para debugging
      _contextInfo: {
        version: '2.0.0',
        features: [
          'enhanced-actions',
          'error-handling',
          'validation',
          'utilities',
          'hooks-integration',
        ],
        lastUpdate: new Date().toISOString(),
      },
    }),
    [state, currentDate, dateController, actions, categorizedActions]
  );

  return (
    <CalendarContext.Provider value={contextValue}>
      {children}
    </CalendarContext.Provider>
  );
};

/**
 * @name useCalendarContext
 * @summary
 * Hook personalizado para acceder al contexto del calendario
 *
 * @returns {Object} Contexto completo del calendario
 * @throws {Error} Si se usa fuera de un CalendarProvider
 *
 * @example
 * const {currentDate, dateController, events, addEvent } = useCalendarContext();
 */
export const useCalendarContext = () => {
  const context = useContext(CalendarContext);

  if (!context) {
    throw new Error(
      'useCalendarContext debe usarse dentro de un componente CalendarProvider'
    );
  }

  return context;
};
