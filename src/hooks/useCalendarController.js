import { useEffect, useRef, useState } from 'preact/hooks';

/**
 * @name useCalendarController
 * @summary
 * Hook personalizado para controlar el estado del calendario con sistema de eventos
 * Proporciona métodos para navegar por fechas y un Event Emitter completo para suscribirse a cambios específicos
 *
 * @description
 * Este hook implementa un controlador de calendario con las siguientes características:
 * - Navegación por fechas (mes, año, ir a hoy)
 * - Sistema de eventos granular con Event Emitter
 * - Información de estado anterior y actual en cada evento
 * - API de suscripción/desuscripción flexible
 * - Compatibilidad con API anterior
 *
 * @param {Date} [defaultDate=new Date()] - Fecha inicial del calendario
 *
 * @returns {[Date, Object]} Array con la fecha actual y el objeto controlador
 * @returns {Date} returns.0 - Fecha actual del calendario
 * @returns {Object} returns.1 - Objeto controlador con métodos y eventos
 * @returns {Function} returns.1.getDate - Obtiene la fecha actual
 * @returns {Function} returns.1.setDate - Establece una fecha específica
 * @returns {Function} returns.1.nextMonth - Navega al mes siguiente
 * @returns {Function} returns.1.prevMonth - Navega al mes anterior
 * @returns {Function} returns.1.nextYear - Navega al año siguiente
 * @returns {Function} returns.1.prevYear - Navega al año anterior
 * @returns {Function} returns.1.goToToday - Navega a la fecha actual
 * @returns {Function} returns.1.gotoDate - Navega a una fecha específica
 * @returns {Function} returns.1.incrementDate - Incrementa/decrementa fecha por cantidad y unidad
 * @returns {Function} returns.1.on - Suscribirse a eventos específicos
 * @returns {Function} returns.1.off - Desuscribirse de eventos
 * @returns {Function} returns.1.getAvailableEvents - Lista de eventos disponibles
 * @returns {Function} returns.1.subscribe - Compatibilidad: suscribirse a cambios de fecha
 *
 * @example
 * // Uso básico
 * const [currentDate, controller] = useCalendarController();
 *
 * @example
 * // Suscribirse a eventos específicos
 * const [currentDate, controller] = useCalendarController();
 *
 * // Escuchar cambios de mes
 * const unsubscribeMonth = controller.on('monthChange', ({ current, previous }) => {
 *   console.log(`Mes cambió de ${previous.month} a ${current.month}`);
 * });
 *
 * // Escuchar navegación específica
 * controller.on('nextMonth', ({ current, previous }) => {
 *   animateSlideLeft();
 * });
 *
 * // Cleanup
 * unsubscribeMonth();
 *
 * @example
 * // Eventos disponibles:
 * controller.getAvailableEvents()
 * // ['dateChange', 'monthChange', 'yearChange', 'dateSet', 'nextMonth', 'prevMonth', 'nextYear', 'prevYear', 'goToToday', 'gotoDate', 'incrementDate']
 *
 * @example
 * // Navegación avanzada
 * const [currentDate, controller] = useCalendarController();
 *
 * // Ir a fecha específica (útil para DatePickers, URLs, etc.)
 * controller.gotoDate('2025-12-25'); // Ir a Navidad
 * controller.gotoDate(new Date(2026, 0, 1)); // Ir a Año Nuevo 2026
 *
 * // Incrementar por días, semanas, meses
 * controller.incrementDate(7, 'days'); // Avanzar una semana
 * controller.incrementDate(-2, 'months'); // Retroceder 2 meses
 * controller.incrementDate(1, 'years'); // Avanzar un año
 */
export function useCalendarController(defaultDate = new Date()) {
  const [currentDate, setCurrentDate] = useState(defaultDate);
  const subscribers = useRef(new Map()); // Map para diferentes tipos de eventos
  const prevDate = useRef(null); // Mover fuera del useEffect

  // Función helper para emitir eventos
  const emit = (eventType, data) => {
    const eventSubscribers = subscribers.current.get(eventType);
    if (eventSubscribers) {
      eventSubscribers.forEach(callback => callback(data));
    }
  };

  // Notificar cambios de fecha y emitir eventos específicos
  useEffect(() => {
    // Solo emitir eventos si hay una fecha previa (no en el primer render)
    if (prevDate.current) {
      // Emitir evento general de cambio de fecha
      emit('dateChange', {
        current: currentDate,
        previous: prevDate.current,
      });

      // Detectar cambios específicos
      const prevMonth = prevDate.current.getMonth();
      const prevYear = prevDate.current.getFullYear();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      if (prevMonth !== currentMonth) {
        emit('monthChange', {
          current: { month: currentMonth, year: currentYear },
          previous: { month: prevMonth, year: prevYear },
        });
      }

      if (prevYear !== currentYear) {
        emit('yearChange', {
          current: currentYear,
          previous: prevYear,
        });
      }
    }

    // Actualizar la referencia de fecha anterior
    prevDate.current = currentDate;
  }, [currentDate]);

  const controller = useRef({
    getDate: () => currentDate,
    setDate: date => {
      const prevDate = currentDate;
      setCurrentDate(date);
      emit('dateSet', { current: date, previous: prevDate });
    },
    nextMonth: () => {
      setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setMonth(newDate.getMonth() + 1);
        emit('nextMonth', { current: newDate, previous: prev });
        return newDate;
      });
    },
    prevMonth: () => {
      setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setMonth(newDate.getMonth() - 1);
        emit('prevMonth', { current: newDate, previous: prev });
        return newDate;
      });
    },
    nextYear: () => {
      setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setFullYear(newDate.getFullYear() + 1);
        emit('nextYear', { current: newDate, previous: prev });
        return newDate;
      });
    },
    prevYear: () => {
      setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setFullYear(newDate.getFullYear() - 1);
        emit('prevYear', { current: newDate, previous: prev });
        return newDate;
      });
    },
    goToToday: () => {
      const prevDate = currentDate;
      const today = new Date();
      setCurrentDate(today);
      emit('goToToday', { current: today, previous: prevDate });
    },
    gotoDate: targetDate => {
      const prevDate = currentDate;

      // Convertir el input a Date válido
      let newDate;
      if (targetDate instanceof Date) {
        newDate = new Date(targetDate);
      } else {
        // Intentar parsear string u otros formatos
        newDate = new Date(targetDate);
      }

      // Validación: asegurar que la fecha es válida
      if (isNaN(newDate.getTime())) {
        console.warn('gotoDate: Fecha inválida proporcionada:', targetDate);
        return; // No cambiar si la fecha es inválida
      }

      setCurrentDate(newDate);
      emit('gotoDate', {
        current: newDate,
        previous: prevDate,
        targetInput: targetDate, // Info adicional para debugging
      });
    },
    incrementDate: (amount, unit = 'days') => {
      // Validación de parámetros
      if (typeof amount !== 'number' || isNaN(amount)) {
        console.warn(
          'incrementDate: amount debe ser un número válido:',
          amount
        );
        return;
      }

      if (!['days', 'months', 'years'].includes(unit)) {
        console.warn(
          'incrementDate: unit debe ser "days", "months" o "years":',
          unit
        );
        return;
      }

      setCurrentDate(prev => {
        const newDate = new Date(prev);

        // Aplicar incremento según la unidad
        switch (unit) {
          case 'days':
            newDate.setDate(newDate.getDate() + amount);
            break;
          case 'months':
            newDate.setMonth(newDate.getMonth() + amount);
            break;
          case 'years':
            newDate.setFullYear(newDate.getFullYear() + amount);
            break;
        }

        // Emitir evento con información detallada
        emit('incrementDate', {
          current: newDate,
          previous: prev,
          amount, // Cantidad incrementada
          unit, // Unidad usada
          direction: amount > 0 ? 'forward' : 'backward', // Dirección para animaciones
        });

        return newDate;
      });
    },
    // Sistema de suscripción mejorado
    on: (eventType, callback) => {
      if (!subscribers.current.has(eventType)) {
        subscribers.current.set(eventType, new Set());
      }
      subscribers.current.get(eventType).add(callback);

      // Retornar función para desuscribirse
      return () => {
        const eventSubscribers = subscribers.current.get(eventType);
        if (eventSubscribers) {
          eventSubscribers.delete(callback);
          if (eventSubscribers.size === 0) {
            subscribers.current.delete(eventType);
          }
        }
      };
    },
    off: (eventType, callback) => {
      const eventSubscribers = subscribers.current.get(eventType);
      if (eventSubscribers) {
        eventSubscribers.delete(callback);
        if (eventSubscribers.size === 0) {
          subscribers.current.delete(eventType);
        }
      }
    },
    // Método para obtener todos los eventos disponibles
    getAvailableEvents: () => [
      // Eventos básicos de navegación
      'dateChange', // Cualquier cambio de fecha
      'monthChange', // Cambio específico de mes
      'yearChange', // Cambio específico de año
      'dateSet', // Fecha establecida manualmente con setDate()

      // Eventos de navegación tradicional
      'nextMonth', // Navegación al mes siguiente
      'prevMonth', // Navegación al mes anterior
      'nextYear', // Navegación al año siguiente
      'prevYear', // Navegación al año anterior
      'goToToday', // Navegación a la fecha actual

      // Eventos de navegación avanzada (NUEVOS)
      'gotoDate', // Navegación a fecha específica
      'incrementDate', // Incremento/decremento por cantidad y unidad
    ],
    // Compatibilidad con la API anterior
    subscribe: fn => {
      return controller.current.on('dateChange', fn);
    },
  });

  return [currentDate, controller.current];
}
