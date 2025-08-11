import { h, createContext } from 'preact';
import { useContext, useReducer, useMemo } from 'preact/hooks';
import { useDateFnsLocaleController } from '@/hooks/useDateFnsLocaleController.js';
import { useCalendarReducer } from '@/hooks/useCalendarReducer.js';
import { useCalendarController } from '@/hooks/useCalendarController.js';
import { createCategorizedActions } from '@/hooks/useCalendarActions.js';
import { initialConfig as initialState } from '@/config/initialConfig.js';

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

  // Usar el hook para obtener el objeto locale de date-fns según el config
  const dateFnsLocale = useDateFnsLocaleController(
    state.config?.locale || 'es'
  );

  // Crear acciones categorizadas usando el dispatch y el controlador de fechas
  const actionsBase = createCategorizedActions(dispatch, dateController, state);

  // Valor del contexto optimizado con memoización
  const contextValue = useMemo(
    () => ({
      // Estado del calendario (incluye state.config con la configuración)
      ...state,

      // Fecha actual y controlador de fechas
      currentDate,

      // Controlador de fechas
      dateController,

      // Acciones categorizadas
      configActions: actionsBase.config,
      navigation: actionsBase.navigation,
      view: actionsBase.view,
      events: actionsBase.events,
      ui: actionsBase.ui,

      // Locale de date-fns resuelto según config
      dateFnsLocale,

      // Métodos de utilidad adicionales
      utils: {
        // Generar ID único para eventos
        generateEventId: actionsBase.generateEventId,

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
    }),
    [state, currentDate, dateController, actionsBase, dateFnsLocale]
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
