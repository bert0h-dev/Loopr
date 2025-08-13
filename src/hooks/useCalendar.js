/**
 * 🪝 Hook personalizado para manejar el calendario
 *
 * Ejemplo de uso de los nuevos alias de resolución de módulos
 */

import { useState, useEffect, useMemo } from 'preact/hooks';
import { appConfig } from '@/utils/env.js';
import {
  calculateRecurrenceDates,
  RECURRENCE_TYPES,
} from '@/utils/recurrence.js';
import { notificationManager } from '@/utils/notifications.js';

/**
 * Hook para manejar estado del calendario
 * @param {Object} initialConfig - Configuración inicial
 * @returns {Object} Estado y métodos del calendario
 */
export const useCalendar = (initialConfig = {}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState(
    initialConfig.defaultView || appConfig.calendar.defaultView
  );
  const [baseEvents, setBaseEvents] = useState([]); // Eventos originales (no expandidos)
  const [loading, setLoading] = useState(false);

  // Calcular eventos expandidos (incluye recurrencias) usando useMemo para performance
  const events = useMemo(() => {
    const expanded = [];
    const today = new Date();

    // Calcular rango de fechas para mostrar (6 meses hacia adelante, 1 mes hacia atrás)
    const startDate = new Date(today);
    startDate.setMonth(startDate.getMonth() - 1);
    const endDate = new Date(today);
    endDate.setMonth(endDate.getMonth() + 6);

    baseEvents.forEach(baseEvent => {
      if (
        baseEvent.recurrence &&
        baseEvent.recurrence.type !== RECURRENCE_TYPES.NONE
      ) {
        // Generar todas las fechas de recurrencia
        const recurrenceDates = calculateRecurrenceDates(
          baseEvent,
          baseEvent.recurrence,
          startDate,
          endDate
        );

        // Crear un evento para cada fecha de recurrencia
        recurrenceDates.forEach((date, index) => {
          expanded.push({
            ...baseEvent,
            id: `${baseEvent.id}_${index}`, // ID único para cada ocurrencia
            originalId: baseEvent.id, // Referencia al evento original
            date: date.toISOString().split('T')[0], // Formato YYYY-MM-DD
            isRecurrence: true,
            recurrenceIndex: index,
          });
        });
      } else {
        // Evento sin recurrencia
        expanded.push({
          ...baseEvent,
          isRecurrence: false,
        });
      }
    });

    return expanded;
  }, [baseEvents]);

  // Efecto para debug
  useEffect(() => {
    if (appConfig.debug) {
      console.log('🗓️ Calendar hook initialized:', {
        currentDate,
        view,
        baseEventsCount: baseEvents.length,
        expandedEventsCount: events.length,
        config: initialConfig,
      });
    }
  }, [currentDate, view, baseEvents.length, events.length, initialConfig]);

  const goToNext = () => {
    const nextDate = new Date(currentDate);

    switch (view) {
      case 'month':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'week':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'day':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
    }

    setCurrentDate(nextDate);
  };

  const goToPrevious = () => {
    const prevDate = new Date(currentDate);

    switch (view) {
      case 'month':
        prevDate.setMonth(prevDate.getMonth() - 1);
        break;
      case 'week':
        prevDate.setDate(prevDate.getDate() - 7);
        break;
      case 'day':
        prevDate.setDate(prevDate.getDate() - 1);
        break;
    }

    setCurrentDate(prevDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const addEvent = event => {
    if (baseEvents.length >= appConfig.calendar.maxEventsPerDay * 30) {
      // Ajustar límite para eventos base
      console.warn('⚠️ Maximum events reached');
      return false;
    }

    const newEvent = {
      id: event.id || Date.now().toString(),
      ...event,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setBaseEvents(prev => [...prev, newEvent]);

    // Programar notificaciones si están habilitadas
    if (newEvent.enableNotifications && newEvent.reminders?.length > 0) {
      notificationManager.scheduleEventNotifications(newEvent);
    }

    return true;
  };

  const removeEvent = eventId => {
    // Cancelar notificaciones del evento
    notificationManager.cancelEventNotifications(eventId);

    setBaseEvents(prev => prev.filter(event => event.id !== eventId));
  };

  const updateEvent = updatedEvent => {
    const updated = {
      ...updatedEvent,
      updatedAt: new Date(),
    };

    setBaseEvents(prev =>
      prev.map(event => (event.id === updated.id ? updated : event))
    );

    // Reprogramar notificaciones
    if (updated.enableNotifications && updated.reminders?.length > 0) {
      notificationManager.rescheduleEventNotifications(updated);
    } else {
      notificationManager.cancelEventNotifications(updated.id);
    }
  };

  const getEventsForDate = date => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getEventsForMonth = (year, month) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });
  };

  return {
    // Estado
    currentDate,
    view,
    events, // Eventos expandidos (incluye recurrencias)
    baseEvents, // Eventos originales
    loading,

    // Setters
    setCurrentDate,
    setView,
    setLoading,

    // Métodos
    goToNext,
    goToPrevious,
    goToToday,
    addEvent,
    removeEvent,
    updateEvent,
    getEventsForDate,
    getEventsForMonth,

    // Información derivada
    isToday: currentDate.toDateString() === new Date().toDateString(),
    eventsCount: events.length,
    baseEventsCount: baseEvents.length,
    hasMaxEvents: baseEvents.length >= appConfig.calendar.maxEventsPerDay * 30,

    // Utilidades para notificaciones
    notificationStats: notificationManager.getStats(),
  };
};
