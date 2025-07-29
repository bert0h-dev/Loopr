import { h, createContext } from 'preact';
import { useContext, useReducer, useCallback } from 'preact/hooks';
import { useCalendarReducer } from '@/hooks/useCalendarReducer.js';
import { initialConfig as initialState } from '@/config/initialConfig.js';
import { useCalendarController } from '@/hooks/useCalendarController.js';

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

  // Acciones del calendario
  const actions = {
    // Configuración
    updateConfig: useCallback(configUpdates => {
      dispatch({ type: 'SET_CONFIG', payload: configUpdates });
    }, []),

    // Vistas
    setActiveView: useCallback(view => {
      dispatch({ type: 'SET_ACTIVE_VIEW', payload: view });
    }, []),

    // Eventos
    setEvents: useCallback(events => {
      dispatch({ type: 'SET_EVENTS', payload: events });
    }, []),

    addEvent: useCallback(event => {
      const eventWithId = { ...event, id: event.id || generateEventId() };
      dispatch({ type: 'ADD_EVENT', payload: eventWithId });
    }, []),

    updateEvent: useCallback((eventId, updates) => {
      dispatch({ type: 'UPDATE_EVENT', payload: { id: eventId, updates } });
    }, []),

    deleteEvent: useCallback(eventId => {
      dispatch({ type: 'DELETE_EVENT', payload: eventId });
    }, []),

    setSelectedEvents: useCallback(events => {
      dispatch({ type: 'SET_SELECTED_EVENTS', payload: events });
    }, []),

    // UI
    setUIState: useCallback(uiUpdates => {
      dispatch({ type: 'SET_UI_STATE', payload: uiUpdates });
    }, []),

    openEventModal: useCallback((date = null) => {
      dispatch({
        type: 'SET_UI_STATE',
        payload: {
          isEventModalOpen: true,
          selectedDate: date,
        },
      });
    }, []),

    closeEventModal: useCallback(() => {
      dispatch({
        type: 'SET_UI_STATE',
        payload: {
          isEventModalOpen: false,
          selectedDate: null,
        },
      });
    }, []),

    // Utilidades
    setError: useCallback(error => {
      dispatch({ type: 'SET_ERROR', payload: error });
    }, []),

    setLoading: useCallback(loading => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    }, []),
  };

  // Valor del contexto
  const contextValue = {
    // Estado
    ...state,
    currentDate,

    // Controlador de fechas
    dateController,

    // Acciones
    ...actions,
  };

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

/**
 * Genera un ID único para eventos
 */
function generateEventId() {
  return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
