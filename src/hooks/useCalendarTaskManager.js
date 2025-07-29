import { useState, useRef, useCallback } from 'preact/hooks';
import { useCalendarContext } from '@/context/CalendarContext.jsx';

/**
 * @name useCalendarTaskManager
 * @summary
 * Hook especializado para manejar tareas asíncronas del calendario
 * Proporciona control sobre ejecución de acciones con manejo de estado de carga y errores
 *
 * @returns {Object} Objeto con métodos para ejecutar tareas y estado de las mismas
 */
export const useCalendarTaskManager = () => {
  // Obtener todo el contexto con las acciones categorizadas
  const context = useCalendarContext();

  // Extraer las acciones categorizadas y algunas acciones base
  const {
    configActions,
    navigation,
    view,
    events,
    ui,
    // También mantener acceso directo para compatibilidad
    updateConfig,
    setActiveView,
    setEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    setSelectedEvents,
    setUIState,
    openEventModal,
    closeEventModal,
    setError,
    setLoading,
    clearError,
    generateEventId,
  } = context;

  // Crear objeto de acciones que funcione tanto con API categorizada como plana
  const actions = {
    // API categorizada
    config: configActions,
    navigation,
    view,
    events,
    ui,
    // API plana (compatibilidad)
    updateConfig,
    setActiveView,
    setEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    setSelectedEvents,
    setUIState,
    openEventModal,
    closeEventModal,
    setError,
    setLoading,
    clearError,
    generateEventId,
  };
  const [taskState, setTaskState] = useState({
    loading: false,
    error: null,
    activeTasks: new Set(),
  });
  const taskQueue = useRef(new Map());
  const taskId = useRef(0);

  // Generar ID único para cada tarea
  const generateTaskId = useCallback(() => {
    return `task_${++taskId.current}_${Date.now()}`;
  }, []);

  // Actualizar estado de tareas activas
  const updateTaskState = useCallback(updates => {
    setTaskState(prev => ({ ...prev, ...updates }));
  }, []);

  // Ejecutar tarea con manejo de estado
  const executeTask = useCallback(
    async (taskName, taskFn, options = {}) => {
      const {
        showLoading = true,
        errorMessage = `Error en tarea: ${taskName}`,
        onSuccess,
        onError,
        timeout = 10000,
        silent = false,
      } = options;

      const currentTaskId = generateTaskId();

      try {
        // Marcar tarea como activa
        setTaskState(prev => ({
          ...prev,
          loading: showLoading ? true : prev.loading,
          error: null,
          activeTasks: new Set([...prev.activeTasks, currentTaskId]),
        }));

        // Mostrar loading en UI si no es silent
        if (showLoading && !silent) {
          actions.ui.setLoading(true);
        }

        // Configurar timeout si se especifica
        let timeoutId;
        const timeoutPromise =
          timeout > 0
            ? new Promise((_, reject) => {
                timeoutId = setTimeout(() => {
                  reject(
                    new Error(
                      `Timeout: La tarea ${taskName} tardó más de ${timeout}ms`
                    )
                  );
                }, timeout);
              })
            : null;

        // Ejecutar la tarea
        const taskPromise =
          typeof taskFn === 'function' ? taskFn() : Promise.resolve(taskFn);
        const result = timeoutPromise
          ? await Promise.race([taskPromise, timeoutPromise])
          : await taskPromise;

        // Limpiar timeout
        if (timeoutId) clearTimeout(timeoutId);

        // Ejecutar callback de éxito
        if (onSuccess) onSuccess(result);

        return result;
      } catch (error) {
        console.error(`Error en tarea ${taskName}:`, error);

        // Actualizar estado de error solo si no es silent
        if (!silent) {
          actions.ui.setError(errorMessage);
        }

        // Ejecutar callback de error
        if (onError) onError(error);

        throw error;
      } finally {
        // Remover tarea de activas
        setTaskState(prev => {
          const newActiveTasks = new Set(prev.activeTasks);
          newActiveTasks.delete(currentTaskId);

          return {
            ...prev,
            loading: newActiveTasks.size > 0,
            activeTasks: newActiveTasks,
          };
        });

        // Actualizar loading en UI
        if (showLoading && !silent) {
          actions.ui.setLoading(false);
        }
      }
    },
    [actions.ui, generateTaskId]
  );

  // Métodos predefinidos para tareas comunes
  const taskMethods = {
    // Navegación con animación
    navigateWithAnimation: useCallback(
      async (action, animationDuration = 300) => {
        return executeTask(
          `navigate-${action}`,
          async () => {
            // Verificar que la acción existe
            if (!actions.navigation[action]) {
              throw new Error(`Acción de navegación '${action}' no existe`);
            }

            await actions.navigation[action]();

            // Simular duración de animación
            if (animationDuration > 0) {
              await new Promise(resolve =>
                setTimeout(resolve, animationDuration)
              );
            }
          },
          {
            showLoading: true,
            errorMessage: `Error al navegar: ${action}`,
          }
        );
      },
      [actions.navigation, executeTask]
    ),

    // Cargar eventos con manejo de errores
    loadEvents: useCallback(
      async eventLoader => {
        return executeTask(
          'load-events',
          async () => {
            if (typeof eventLoader !== 'function') {
              throw new Error('eventLoader debe ser una función');
            }

            const events = await eventLoader();

            if (!Array.isArray(events)) {
              throw new Error('Los eventos deben ser un array');
            }

            actions.events.setEvents(events);
            return events;
          },
          {
            showLoading: true,
            errorMessage: 'Error al cargar eventos',
            timeout: 15000,
          }
        );
      },
      [actions.events, executeTask]
    ),

    // Guardar evento con validación
    saveEvent: useCallback(
      async (event, isUpdate = false) => {
        return executeTask(
          'save-event',
          async () => {
            // Validar evento
            if (!event || typeof event !== 'object') {
              throw new Error('El evento debe ser un objeto válido');
            }

            if (!event.title || event.title.trim() === '') {
              throw new Error('El evento debe tener un título');
            }

            if (!event.date) {
              throw new Error('El evento debe tener una fecha');
            }

            const result = isUpdate
              ? await actions.events.updateEvent(event.id, event)
              : await actions.events.addEvent(event);

            return result;
          },
          {
            showLoading: true,
            errorMessage: `Error al ${isUpdate ? 'actualizar' : 'crear'} evento`,
            onSuccess: () => {
              actions.ui.closeEventModal();
            },
          }
        );
      },
      [actions.events, actions.ui, executeTask]
    ),

    // Eliminar evento con confirmación
    deleteEvent: useCallback(
      async (eventId, skipConfirmation = false) => {
        return executeTask(
          'delete-event',
          async () => {
            if (!eventId) {
              throw new Error('ID de evento requerido');
            }

            if (!skipConfirmation) {
              const confirmed = window.confirm(
                '¿Estás seguro de eliminar este evento?'
              );
              if (!confirmed) {
                throw new Error('Eliminación cancelada por el usuario');
              }
            }

            await actions.events.deleteEvent(eventId);
            return eventId;
          },
          {
            showLoading: true,
            errorMessage: 'Error al eliminar evento',
          }
        );
      },
      [actions.events, executeTask]
    ),

    // Cambiar vista con carga
    changeView: useCallback(
      async view => {
        return executeTask(
          'change-view',
          async () => {
            const validViews = ['month', 'week', 'day', 'agenda', 'year'];

            if (!validViews.includes(view)) {
              throw new Error(
                `Vista '${view}' no es válida. Vistas disponibles: ${validViews.join(', ')}`
              );
            }

            actions.view.setActiveView(view);

            // Simular carga de datos específicos de la vista
            await new Promise(resolve => setTimeout(resolve, 200));

            return view;
          },
          {
            showLoading: true,
            errorMessage: `Error al cambiar a vista: ${view}`,
          }
        );
      },
      [actions.view, executeTask]
    ),

    // Aplicar configuración con validación
    applyConfig: useCallback(
      async configUpdates => {
        return executeTask(
          'apply-config',
          async () => {
            if (!configUpdates || typeof configUpdates !== 'object') {
              throw new Error(
                'Las actualizaciones de configuración deben ser un objeto'
              );
            }

            actions.config.updateConfig(configUpdates);

            // Simular tiempo de aplicación de configuración
            await new Promise(resolve => setTimeout(resolve, 100));

            return configUpdates;
          },
          {
            showLoading: false, // Los cambios de config suelen ser instantáneos
            errorMessage: 'Error al aplicar configuración',
          }
        );
      },
      [actions.config, executeTask]
    ),

    // Buscar eventos (ejemplo de tarea personalizada)
    searchEvents: useCallback(
      async (searchTerm, searchFn = null) => {
        return executeTask(
          'search-events',
          async () => {
            if (!searchTerm || searchTerm.trim() === '') {
              throw new Error('Término de búsqueda requerido');
            }

            // Si se proporciona una función de búsqueda personalizada, usarla
            if (searchFn && typeof searchFn === 'function') {
              return await searchFn(searchTerm);
            }

            // Búsqueda básica por defecto (esto requeriría acceso a los eventos)
            // Por ahora es un placeholder que simula la búsqueda
            await new Promise(resolve => setTimeout(resolve, 500));

            return []; // Resultado placeholder
          },
          {
            showLoading: true,
            errorMessage: 'Error al buscar eventos',
            timeout: 5000,
          }
        );
      },
      [executeTask]
    ),
  };

  // Métodos de utilidad
  const utilities = {
    // Cancelar todas las tareas activas
    cancelAllTasks: useCallback(() => {
      setTaskState(prev => ({
        ...prev,
        loading: false,
        activeTasks: new Set(),
      }));
      taskQueue.current.clear();
      actions.ui.setLoading(false);
    }, [actions.ui]),

    // Verificar si hay tareas activas
    hasActiveTasks: useCallback(() => {
      return taskState.activeTasks.size > 0;
    }, [taskState.activeTasks]),

    // Obtener tareas activas
    getActiveTasks: useCallback(() => {
      return Array.from(taskState.activeTasks);
    }, [taskState.activeTasks]),

    // Limpiar errores
    clearError: useCallback(() => {
      actions.ui.clearError();
      updateTaskState({ error: null });
    }, [actions.ui, updateTaskState]),

    // Ejecutar múltiples tareas en secuencia
    executeSequence: useCallback(
      async tasks => {
        if (!Array.isArray(tasks)) {
          throw new Error('Las tareas deben ser un array');
        }

        const results = [];

        for (const task of tasks) {
          const { name, fn, options = {} } = task;
          try {
            const result = await executeTask(name, fn, options);
            results.push({ success: true, result, name });
          } catch (error) {
            results.push({ success: false, error, name });
            if (!options.continueOnError) {
              break;
            }
          }
        }

        return results;
      },
      [executeTask]
    ),

    // Ejecutar múltiples tareas en paralelo
    executeParallel: useCallback(
      async tasks => {
        if (!Array.isArray(tasks)) {
          throw new Error('Las tareas deben ser un array');
        }

        const promises = tasks.map(async task => {
          const { name, fn, options = {} } = task;
          try {
            const result = await executeTask(name, fn, options);
            return { success: true, result, name };
          } catch (error) {
            return { success: false, error, name };
          }
        });

        return await Promise.all(promises);
      },
      [executeTask]
    ),
  };

  return {
    // Estado de tareas
    ...taskState,

    // Método principal
    executeTask,

    // Métodos predefinidos
    ...taskMethods,

    // Utilidades
    ...utilities,
  };
};
