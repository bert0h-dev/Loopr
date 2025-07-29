/**
 * @name useCalendarReducer
 * @summary
 * Hook personalizado que implementa un reducer para manejar el estado del calendario
 *
 * @param {Object} state - Estado actual del calendario
 * @param {Object} action - Acción a procesar
 *
 * @returns {Object} Nuevo estado del calendario
 */
export const useCalendarReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CONFIG':
      return {
        ...state,
        config: { ...state.config, ...action.payload },
      };

    case 'SET_ACTIVE_VIEW':
      return {
        ...state,
        activeView: action.payload,
      };

    case 'SET_EVENTS':
      return {
        ...state,
        events: action.payload,
      };

    case 'ADD_EVENT':
      return {
        ...state,
        events: [...state.events, action.payload],
      };

    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map(event =>
          event.id === action.payload.id
            ? { ...event, ...action.payload.updates }
            : event
        ),
      };

    case 'DELETE_EVENT':
      return {
        ...state,
        events: state.events.filter(event => event.id !== action.payload),
      };

    case 'SET_SELECTED_EVENTS':
      return {
        ...state,
        selectedEvents: action.payload,
      };

    case 'SET_UI_STATE':
      return {
        ...state,
        ui: { ...state.ui, ...action.payload },
      };

    case 'SET_ERROR':
      return {
        ...state,
        ui: { ...state.ui, error: action.payload, loading: false },
      };

    case 'SET_LOADING':
      return {
        ...state,
        ui: { ...state.ui, loading: action.payload },
      };

    default:
      return state;
  }
};
