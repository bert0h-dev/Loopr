import { useEffect, useRef, useState } from 'preact/hooks';
// Importar funciones específicas de date-fns para navegación segura
import {
  addMonths,
  addYears,
  addDays,
  addWeeks,
  isValid,
  parseISO,
} from 'date-fns';

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
  // Validar y sanitizar defaultDate usando date-fns
  const validateDate = date => {
    if (!date) return new Date();

    // Si es string, intentar parsearlo como ISO
    if (typeof date === 'string') {
      try {
        const parsedDate = parseISO(date);
        if (isValid(parsedDate)) {
          return parsedDate;
        }
        // Si no es ISO válido, intentar constructor nativo
        const fallbackDate = new Date(date);
        if (isValid(fallbackDate)) {
          return fallbackDate;
        }
      } catch (error) {
        console.warn(
          'useCalendarController: Error al parsear string date, usando fecha actual',
          error
        );
        return new Date();
      }
    }

    // Si es objeto Date, validar con date-fns
    if (date instanceof Date) {
      if (isValid(date)) {
        return date;
      } else {
        console.warn(
          'useCalendarController: Date inválida, usando fecha actual'
        );
        return new Date();
      }
    }

    // Para otros tipos, intentar crear Date y validar
    try {
      const newDate = new Date(date);
      if (isValid(newDate)) {
        return newDate;
      }
    } catch (error) {
      console.warn(
        'useCalendarController: Error al crear Date, usando fecha actual',
        error
      );
    }

    return new Date();
  };

  const [currentDate, setCurrentDate] = useState(() =>
    validateDate(defaultDate)
  );
  const subscribers = useRef(new Map()); // Map para diferentes tipos de eventos
  const prevDate = useRef(null); // Mover fuera del useEffect

  // Función helper para emitir eventos con manejo de errores
  const emit = (eventType, data) => {
    const eventSubscribers = subscribers.current.get(eventType);
    if (eventSubscribers) {
      eventSubscribers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error en callback del evento '${eventType}':`, error);
        }
      });
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
      try {
        const validatedDate = validateDate(date);
        const prevDate = currentDate;
        setCurrentDate(validatedDate);
        emit('dateSet', { current: validatedDate, previous: prevDate });
      } catch (error) {
        console.error('Error en setDate:', error);
      }
    },
    nextMonth: () => {
      try {
        setCurrentDate(prev => {
          // Usar date-fns para navegación segura de mes
          const newDate = addMonths(prev, 1);

          // date-fns garantiza fechas válidas, pero validar por seguridad
          if (!isValid(newDate)) {
            console.error('Error: fecha inválida generada en nextMonth');
            return prev;
          }

          emit('nextMonth', { current: newDate, previous: prev });
          return newDate;
        });
      } catch (error) {
        console.error('Error en nextMonth:', error);
      }
    },
    prevMonth: () => {
      try {
        setCurrentDate(prev => {
          // Usar date-fns para navegación segura de mes
          const newDate = addMonths(prev, -1);

          // date-fns garantiza fechas válidas, pero validar por seguridad
          if (!isValid(newDate)) {
            console.error('Error: fecha inválida generada en prevMonth');
            return prev;
          }

          emit('prevMonth', { current: newDate, previous: prev });
          return newDate;
        });
      } catch (error) {
        console.error('Error en prevMonth:', error);
      }
    },
    nextYear: () => {
      try {
        setCurrentDate(prev => {
          // Usar date-fns para navegación segura de año
          const newDate = addYears(prev, 1);

          // date-fns garantiza fechas válidas, pero validar por seguridad
          if (!isValid(newDate)) {
            console.error('Error: fecha inválida generada en nextYear');
            return prev;
          }

          emit('nextYear', { current: newDate, previous: prev });
          return newDate;
        });
      } catch (error) {
        console.error('Error en nextYear:', error);
      }
    },
    prevYear: () => {
      try {
        setCurrentDate(prev => {
          // Usar date-fns para navegación segura de año
          const newDate = addYears(prev, -1);

          // date-fns garantiza fechas válidas, pero validar por seguridad
          if (!isValid(newDate)) {
            console.error('Error: fecha inválida generada en prevYear');
            return prev;
          }

          emit('prevYear', { current: newDate, previous: prev });
          return newDate;
        });
      } catch (error) {
        console.error('Error en prevYear:', error);
      }
    },
    goToToday: () => {
      try {
        const prevDate = currentDate;
        const today = new Date();

        // Validar con date-fns que la fecha de hoy sea válida
        if (!isValid(today)) {
          console.error('Error: no se pudo obtener la fecha actual válida');
          return;
        }

        setCurrentDate(today);
        emit('goToToday', { current: today, previous: prevDate });
      } catch (error) {
        console.error('Error en goToToday:', error);
      }
    },
    gotoDate: targetDate => {
      try {
        const prevDate = currentDate;

        // Usar la función validateDate para consistencia
        const newDate = validateDate(targetDate);

        // Si validateDate retorna una fecha diferente a la esperada, loggear warning
        if (
          targetDate !== newDate &&
          !(
            targetDate instanceof Date &&
            targetDate.getTime() === newDate.getTime()
          )
        ) {
          console.warn('gotoDate: Fecha proporcionada fue corregida:', {
            original: targetDate,
            corregida: newDate,
          });
        }

        setCurrentDate(newDate);
        emit('gotoDate', {
          current: newDate,
          previous: prevDate,
          targetInput: targetDate, // Info adicional para debugging
        });
      } catch (error) {
        console.error('Error en gotoDate:', error);
      }
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

      // Mapear unidades a funciones de date-fns
      const unitMap = {
        days: addDays,
        day: addDays,
        weeks: addWeeks,
        week: addWeeks,
        months: addMonths,
        month: addMonths,
        years: addYears,
        year: addYears,
      };

      const dateFnsFunction = unitMap[unit];
      if (!dateFnsFunction) {
        console.warn(
          'incrementDate: unit debe ser "days", "weeks", "months" o "years":',
          unit
        );
        return;
      }

      setCurrentDate(prev => {
        try {
          // Usar date-fns para cálculos seguros
          const newDate = dateFnsFunction(prev, amount);

          // Validar resultado con date-fns
          if (!isValid(newDate)) {
            console.error('Error: fecha inválida generada en incrementDate');
            return prev;
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
        } catch (error) {
          console.error('Error en incrementDate:', error);
          return prev;
        }
      });
    },
    // Sistema de suscripción mejorado
    on: (eventType, callback) => {
      try {
        // Validar parámetros
        if (typeof eventType !== 'string' || !eventType.trim()) {
          console.error('on: eventType debe ser un string válido');
          return () => {}; // Retornar función vacía para evitar errores
        }

        if (typeof callback !== 'function') {
          console.error('on: callback debe ser una función');
          return () => {}; // Retornar función vacía para evitar errores
        }

        if (!subscribers.current.has(eventType)) {
          subscribers.current.set(eventType, new Set());
        }
        subscribers.current.get(eventType).add(callback);

        // Retornar función para desuscribirse
        return () => {
          try {
            const eventSubscribers = subscribers.current.get(eventType);
            if (eventSubscribers) {
              eventSubscribers.delete(callback);
              if (eventSubscribers.size === 0) {
                subscribers.current.delete(eventType);
              }
            }
          } catch (error) {
            console.error('Error al desuscribirse del evento:', error);
          }
        };
      } catch (error) {
        console.error('Error en método on:', error);
        return () => {}; // Retornar función vacía para evitar errores
      }
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
