import { useEffect, useRef, useState } from 'preact/hooks';

/**
 * @name useCalendarController
 * @summary
 * Hook personalizado para controlar el estado del calendario
 * Proporciona métodos para navegar por fechas y un sistema de suscripción para cambios
 *
 * @param {Date} [defaultDate=new Date()] - Fecha inicial del calendario
 *
 * @returns {[Date, Object]} Array con la fecha actual y el objeto controlador
 */
export function useCalendarController(defaultDate = new Date()) {
  const [currentDate, setCurrentDate] = useState(defaultDate);
  const subscribers = useRef(new Set());

  // Notificar a todos los suscriptores cuando cambie la fecha
  useEffect(() => {
    subscribers.current.forEach(subscriber => subscriber(currentDate));
  }, [currentDate]);

  const controller = useRef({
    getDate: () => currentDate,
    setDate: date => {
      setCurrentDate(date);
    },
    nextMonth: () => {
      setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setMonth(newDate.getMonth() + 1);
        return newDate;
      });
    },
    prevMonth: () => {
      setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setMonth(newDate.getMonth() - 1);
        return newDate;
      });
    },
    nextYear: () => {
      setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setFullYear(newDate.getFullYear() + 1);
        return newDate;
      });
    },
    prevYear: () => {
      setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setFullYear(newDate.getFullYear() - 1);
        return newDate;
      });
    },
    goToToday: () => {
      setCurrentDate(new Date());
    },
    subscribe: fn => {
      subscribers.current.add(fn);
      return () => subscribers.current.delete(fn);
    },
  });

  return [currentDate, controller.current];
}
