import { useCalendarContext } from '@/context/CalendarContext.jsx';
import { useMemo } from 'preact/hooks';

/**
 * @name useCalendarUI
 * @summary
 * Hook especializado para manejar la interfaz de usuario del calendario
 *
 * @returns {Object} Estado de la interfaz de usuario y métodos para actualizarla
 */
export const useCalendarUI = () => {
  const {
    ui,
    setUIState,
    openEventModal,
    closeEventModal,
    setError,
    setLoading,
  } = useCalendarContext();

  const uiActions = useMemo(
    () => ({
      // Modales
      openEventModal,
      closeEventModal,

      openConfigModal: () => setUIState({ isConfigModalOpen: true }),
      closeConfigModal: () => setUIState({ isConfigModalOpen: false }),

      // Estados de carga y error
      setLoading,
      setError,
      clearError: () => setError(null),

      // Fecha seleccionada
      setSelectedDate: date => setUIState({ selectedDate: date }),
      clearSelectedDate: () => setUIState({ selectedDate: null }),

      // Drag & Drop
      setDraggingEvent: event => setUIState({ draggingEvent: event }),
      clearDraggingEvent: () => setUIState({ draggingEvent: null }),

      // Actualización general
      setUIState,
    }),
    [ui, setUIState, openEventModal, closeEventModal, setError, setLoading]
  );

  return {
    ...ui,
    ...uiActions,
  };
};
