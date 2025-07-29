import { useCallback } from 'preact/hooks';

/**
 * Función interna para generar las acciones base del calendario
 * @param {Function} dispatch - Función dispatch del reducer
 * @returns {Object} Objeto con todas las acciones base del calendario
 */
const createCalendarActionsBase = dispatch => {
  // Función para generar ID único para eventos
  const generateEventId = () => {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  return {
    // Configuración
    updateConfig: useCallback(
      configUpdates => {
        try {
          if (!configUpdates || typeof configUpdates !== 'object') {
            throw new Error(
              'Las actualizaciones de configuración deben ser un objeto válido'
            );
          }
          dispatch({ type: 'SET_CONFIG', payload: configUpdates });
        } catch (error) {
          console.error('Error al actualizar configuración:', error);
          dispatch({ type: 'SET_ERROR', payload: error.message });
          throw error;
        }
      },
      [dispatch]
    ),

    // Vistas
    setActiveView: useCallback(
      view => {
        try {
          const validViews = ['month', 'week', 'day', 'agenda', 'year'];
          if (!validViews.includes(view)) {
            throw new Error(
              `Vista '${view}' no es válida. Vistas disponibles: ${validViews.join(', ')}`
            );
          }
          dispatch({ type: 'SET_ACTIVE_VIEW', payload: view });
        } catch (error) {
          console.error('Error al cambiar vista:', error);
          dispatch({ type: 'SET_ERROR', payload: error.message });
          throw error;
        }
      },
      [dispatch]
    ),

    // Eventos
    setEvents: useCallback(
      events => {
        try {
          if (!Array.isArray(events)) {
            throw new Error('Los eventos deben ser un array');
          }
          dispatch({ type: 'SET_EVENTS', payload: events });
        } catch (error) {
          console.error('Error al establecer eventos:', error);
          dispatch({ type: 'SET_ERROR', payload: error.message });
          throw error;
        }
      },
      [dispatch]
    ),

    addEvent: useCallback(
      event => {
        try {
          if (!event || typeof event !== 'object') {
            throw new Error('El evento debe ser un objeto válido');
          }
          if (!event.title || event.title.trim() === '') {
            throw new Error('El evento debe tener un título');
          }
          if (!event.date) {
            throw new Error('El evento debe tener una fecha');
          }

          const eventWithId = { ...event, id: event.id || generateEventId() };
          dispatch({ type: 'ADD_EVENT', payload: eventWithId });
          return eventWithId;
        } catch (error) {
          console.error('Error al agregar evento:', error);
          dispatch({ type: 'SET_ERROR', payload: error.message });
          throw error;
        }
      },
      [dispatch]
    ),

    updateEvent: useCallback(
      (eventId, updates) => {
        try {
          if (!eventId) {
            throw new Error('ID de evento requerido');
          }
          if (!updates || typeof updates !== 'object') {
            throw new Error('Las actualizaciones deben ser un objeto válido');
          }

          dispatch({ type: 'UPDATE_EVENT', payload: { id: eventId, updates } });
          return { id: eventId, ...updates };
        } catch (error) {
          console.error('Error al actualizar evento:', error);
          dispatch({ type: 'SET_ERROR', payload: error.message });
          throw error;
        }
      },
      [dispatch]
    ),

    deleteEvent: useCallback(
      eventId => {
        try {
          if (!eventId) {
            throw new Error('ID de evento requerido');
          }

          dispatch({ type: 'DELETE_EVENT', payload: eventId });
          return eventId;
        } catch (error) {
          console.error('Error al eliminar evento:', error);
          dispatch({ type: 'SET_ERROR', payload: error.message });
          throw error;
        }
      },
      [dispatch]
    ),

    setSelectedEvents: useCallback(
      events => {
        try {
          if (!Array.isArray(events)) {
            throw new Error('Los eventos seleccionados deben ser un array');
          }
          dispatch({ type: 'SET_SELECTED_EVENTS', payload: events });
        } catch (error) {
          console.error('Error al seleccionar eventos:', error);
          dispatch({ type: 'SET_ERROR', payload: error.message });
          throw error;
        }
      },
      [dispatch]
    ),

    // UI
    setUIState: useCallback(
      uiUpdates => {
        try {
          if (!uiUpdates || typeof uiUpdates !== 'object') {
            throw new Error(
              'Las actualizaciones de UI deben ser un objeto válido'
            );
          }
          dispatch({ type: 'SET_UI_STATE', payload: uiUpdates });
        } catch (error) {
          console.error('Error al actualizar estado UI:', error);
          dispatch({ type: 'SET_ERROR', payload: error.message });
          throw error;
        }
      },
      [dispatch]
    ),

    openEventModal: useCallback(
      (date = null) => {
        try {
          dispatch({
            type: 'SET_UI_STATE',
            payload: {
              isEventModalOpen: true,
              selectedDate: date,
            },
          });
        } catch (error) {
          console.error('Error al abrir modal de evento:', error);
          dispatch({ type: 'SET_ERROR', payload: error.message });
          throw error;
        }
      },
      [dispatch]
    ),

    closeEventModal: useCallback(() => {
      try {
        dispatch({
          type: 'SET_UI_STATE',
          payload: {
            isEventModalOpen: false,
            selectedDate: null,
          },
        });
      } catch (error) {
        console.error('Error al cerrar modal de evento:', error);
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      }
    }, [dispatch]),

    // Utilidades
    setError: useCallback(
      error => {
        dispatch({ type: 'SET_ERROR', payload: error });
      },
      [dispatch]
    ),

    setLoading: useCallback(
      loading => {
        dispatch({ type: 'SET_LOADING', payload: loading });
      },
      [dispatch]
    ),

    clearError: useCallback(() => {
      dispatch({ type: 'SET_ERROR', payload: null });
    }, [dispatch]),

    // Función de generación de ID disponible
    generateEventId,
  };
};

/**
 * Función para crear acciones categorizadas basadas en dispatch y dateController
 * @param {Function} dispatch - Función dispatch del reducer
 * @param {Object} dateController - Controlador de fechas
 * @param {Object} state - Estado actual del calendario
 * @returns {Object} Objeto con acciones organizadas por categorías
 */
const createCategorizedActions = (dispatch, dateController, state) => {
  const baseActions = createCalendarActionsBase(dispatch);

  // Acciones de configuración
  const configActions = {
    updateConfig: baseActions.updateConfig,
    setLocale: useCallback(
      locale => {
        baseActions.updateConfig({ locale });
      },
      [baseActions.updateConfig]
    ),
    setFirstDayOfWeek: useCallback(
      day => {
        baseActions.updateConfig({ firstDayOfWeek: day });
      },
      [baseActions.updateConfig]
    ),
    setTheme: useCallback(
      theme => {
        baseActions.updateConfig({ theme });
      },
      [baseActions.updateConfig]
    ),
    toggleTheme: useCallback(() => {
      const newTheme = state?.config?.theme === 'light' ? 'dark' : 'light';
      baseActions.updateConfig({ theme: newTheme });
    }, [baseActions.updateConfig, state?.config?.theme]),
    setTimeFormat: useCallback(
      format => {
        baseActions.updateConfig({ timeFormat: format });
      },
      [baseActions.updateConfig]
    ),
    setDateFormat: useCallback(
      format => {
        baseActions.updateConfig({ dateFormat: format });
      },
      [baseActions.updateConfig]
    ),
  };

  // Acciones de navegación
  const navigationActions = {
    goToToday: useCallback(() => {
      dateController?.goToToday();
    }, [dateController]),
    nextMonth: useCallback(() => {
      dateController?.nextMonth();
    }, [dateController]),
    prevMonth: useCallback(() => {
      dateController?.prevMonth();
    }, [dateController]),
    nextYear: useCallback(() => {
      dateController?.nextYear();
    }, [dateController]),
    prevYear: useCallback(() => {
      dateController?.prevYear();
    }, [dateController]),
    nextWeek: useCallback(() => {
      dateController?.incrementDate(1, 'week');
    }, [dateController]),
    prevWeek: useCallback(() => {
      dateController?.incrementDate(-1, 'week');
    }, [dateController]),
    nextDay: useCallback(() => {
      dateController?.incrementDate(1, 'day');
    }, [dateController]),
    prevDay: useCallback(() => {
      dateController?.incrementDate(-1, 'day');
    }, [dateController]),
    setDate: useCallback(
      date => {
        dateController?.setDate(date);
      },
      [dateController]
    ),
    gotoDate: useCallback(
      date => {
        dateController?.gotoDate(date);
      },
      [dateController]
    ),
    incrementDate: useCallback(
      (amount, unit) => {
        dateController?.incrementDate(amount, unit);
      },
      [dateController]
    ),
  };

  // Acciones de vista
  const viewActions = {
    setActiveView: baseActions.setActiveView,
    showMonthView: useCallback(() => {
      baseActions.setActiveView('month');
    }, [baseActions.setActiveView]),
    showWeekView: useCallback(() => {
      baseActions.setActiveView('week');
    }, [baseActions.setActiveView]),
    showDayView: useCallback(() => {
      baseActions.setActiveView('day');
    }, [baseActions.setActiveView]),
    showAgendaView: useCallback(() => {
      baseActions.setActiveView('agenda');
    }, [baseActions.setActiveView]),
    showYearView: useCallback(() => {
      baseActions.setActiveView('year');
    }, [baseActions.setActiveView]),
  };

  // Acciones de eventos
  const eventActions = {
    setEvents: baseActions.setEvents,
    addEvent: baseActions.addEvent,
    updateEvent: baseActions.updateEvent,
    deleteEvent: baseActions.deleteEvent,
    setSelectedEvents: baseActions.setSelectedEvents,
    clearSelectedEvents: useCallback(() => {
      baseActions.setSelectedEvents([]);
    }, [baseActions.setSelectedEvents]),
    selectEvent: useCallback(
      event => {
        const currentSelected = state?.selectedEvents || [];
        const isAlreadySelected = currentSelected.some(e => e.id === event.id);

        if (isAlreadySelected) {
          baseActions.setSelectedEvents(
            currentSelected.filter(e => e.id !== event.id)
          );
        } else {
          baseActions.setSelectedEvents([...currentSelected, event]);
        }
      },
      [baseActions.setSelectedEvents, state?.selectedEvents]
    ),
  };

  // Acciones de UI
  const uiActions = {
    setUIState: baseActions.setUIState,
    openEventModal: baseActions.openEventModal,
    closeEventModal: baseActions.closeEventModal,
    setError: baseActions.setError,
    clearError: baseActions.clearError,
    setLoading: baseActions.setLoading,
    toggleSidebar: useCallback(() => {
      baseActions.setUIState(prev => ({
        ...prev,
        sidebarOpen: !prev?.sidebarOpen,
      }));
    }, [baseActions.setUIState]),
    setSidebarOpen: useCallback(
      open => {
        baseActions.setUIState(prev => ({
          ...prev,
          sidebarOpen: open,
        }));
      },
      [baseActions.setUIState]
    ),
  };

  return {
    // Acciones categorizadas
    config: configActions,
    navigation: navigationActions,
    view: viewActions,
    events: eventActions,
    ui: uiActions,

    // API plana para compatibilidad con acciones base
    ...baseActions,

    // Acciones de conveniencia (API plana)
    setLocale: configActions.setLocale,
    setFirstDayOfWeek: configActions.setFirstDayOfWeek,
    setTheme: configActions.setTheme,
    toggleTheme: configActions.toggleTheme,
    setTimeFormat: configActions.setTimeFormat,
    setDateFormat: configActions.setDateFormat,
    goToToday: navigationActions.goToToday,
    nextMonth: navigationActions.nextMonth,
    prevMonth: navigationActions.prevMonth,
    nextYear: navigationActions.nextYear,
    prevYear: navigationActions.prevYear,
    nextWeek: navigationActions.nextWeek,
    prevWeek: navigationActions.prevWeek,
    nextDay: navigationActions.nextDay,
    prevDay: navigationActions.prevDay,
    showMonthView: viewActions.showMonthView,
    showWeekView: viewActions.showWeekView,
    showDayView: viewActions.showDayView,
    showAgendaView: viewActions.showAgendaView,
    showYearView: viewActions.showYearView,
    clearSelectedEvents: eventActions.clearSelectedEvents,
    selectEvent: eventActions.selectEvent,
    toggleSidebar: uiActions.toggleSidebar,
    setSidebarOpen: uiActions.setSidebarOpen,
  };
};

/**
 * @name useCalendarActions
 * @summary
 * Hook unificado que contiene tanto las acciones base como la API organizada por categorías
 *
 * @param {Function} dispatch - Opcional: función dispatch para generar acciones base
 * @returns {Object} Objeto con acciones base y organizadas por categoría
 */
export const useCalendarActions = (dispatch = null) => {
  // Si se proporciona dispatch, generar acciones base (uso en contexto)
  if (dispatch) {
    return createCalendarActionsBase(dispatch);
  }

  throw new Error(
    'useCalendarActions requiere un dispatch. Para uso en componentes, usar useCalendarContext() directamente.'
  );
};

// Exportar también las funciones de creación de acciones para uso del contexto
export { createCalendarActionsBase, createCategorizedActions };
