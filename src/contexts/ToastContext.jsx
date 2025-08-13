/**
 * @fileoverview Sistema de notificaciones visuales (Toast)
 * @description Sistema elegante de notificaciones integradas en la UI
 */

import { h, createContext } from 'preact';
import { useState, useContext, useCallback } from 'preact/hooks';

/**
 * Tipos de notificaciones
 */
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  REMINDER: 'reminder',
};

/**
 * Posiciones de las notificaciones
 */
export const TOAST_POSITIONS = {
  TOP_RIGHT: 'top-right',
  TOP_LEFT: 'top-left',
  TOP_CENTER: 'top-center',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_CENTER: 'bottom-center',
};

/**
 * Configuración por defecto
 */
export const DEFAULT_TOAST_CONFIG = {
  duration: 5000, // 5 segundos
  position: TOAST_POSITIONS.TOP_RIGHT,
  pauseOnHover: true,
  showProgress: true,
  maxToasts: 5,
  enableSounds: false,
};

/**
 * Contexto de notificaciones
 */
const ToastContext = createContext();

/**
 * Hook para usar el sistema de notificaciones
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de ToastProvider');
  }
  return context;
};

/**
 * Provider del sistema de notificaciones
 */
export const ToastProvider = ({ children, config = DEFAULT_TOAST_CONFIG }) => {
  const [toasts, setToasts] = useState([]);
  const [nextId, setNextId] = useState(1);

  const removeToast = useCallback(id => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message, type = TOAST_TYPES.INFO, options = {}) => {
      const id = nextId;
      setNextId(prev => prev + 1);

      const toast = {
        id,
        message,
        type,
        timestamp: new Date(),
        duration: options.duration ?? config.duration,
        persistent: options.persistent ?? false,
        actions: options.actions ?? [],
        icon: options.icon ?? getDefaultIcon(type),
        sound: options.sound ?? config.enableSounds,
        onClose: options.onClose,
        ...options,
      };

      setToasts(prev => {
        const newToasts = [toast, ...prev];
        // Limitar número máximo de toasts
        return newToasts.slice(0, config.maxToasts);
      });

      // Auto-remove si no es persistente
      if (!toast.persistent && toast.duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, toast.duration);
      }

      // Reproducir sonido si está habilitado
      if (toast.sound) {
        playNotificationSound(type);
      }

      return id;
    },
    [nextId, config, removeToast]
  );

  // Métodos de conveniencia
  const success = useCallback(
    (message, options) => addToast(message, TOAST_TYPES.SUCCESS, options),
    [addToast]
  );

  const error = useCallback(
    (message, options) => addToast(message, TOAST_TYPES.ERROR, options),
    [addToast]
  );

  const warning = useCallback(
    (message, options) => addToast(message, TOAST_TYPES.WARNING, options),
    [addToast]
  );

  const info = useCallback(
    (message, options) => addToast(message, TOAST_TYPES.INFO, options),
    [addToast]
  );

  const reminder = useCallback(
    (message, options) =>
      addToast(message, TOAST_TYPES.REMINDER, {
        persistent: true,
        duration: 0,
        actions: [
          { label: 'Ver', action: 'view' },
          { label: 'Cerrar', action: 'dismiss' },
        ],
        ...options,
      }),
    [addToast]
  );

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const value = {
    toasts,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info,
    reminder,
    config,
  };

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
};

/**
 * Obtiene el icono por defecto para cada tipo
 */
function getDefaultIcon(type) {
  const icons = {
    [TOAST_TYPES.SUCCESS]: '✅',
    [TOAST_TYPES.ERROR]: '❌',
    [TOAST_TYPES.WARNING]: '⚠️',
    [TOAST_TYPES.INFO]: 'ℹ️',
    [TOAST_TYPES.REMINDER]: '🔔',
  };
  return icons[type] || 'ℹ️';
}

/**
 * Reproduce sonido de notificación (opcional)
 */
function playNotificationSound(type) {
  try {
    // Crear audio context para sonidos simples
    if (
      typeof AudioContext !== 'undefined' ||
      typeof webkitAudioContext !== 'undefined'
    ) {
      const AudioCtx = AudioContext || webkitAudioContext;
      const audioCtx = new AudioCtx();

      // Frecuencias diferentes para cada tipo
      const frequencies = {
        [TOAST_TYPES.SUCCESS]: [523.25, 659.25], // C5, E5
        [TOAST_TYPES.ERROR]: [261.63, 196.0], // C4, G3
        [TOAST_TYPES.WARNING]: [440.0, 493.88], // A4, B4
        [TOAST_TYPES.INFO]: [329.63], // E4
        [TOAST_TYPES.REMINDER]: [783.99, 987.77], // G5, B5
      };

      const freqs = frequencies[type] || frequencies[TOAST_TYPES.INFO];

      freqs.forEach((freq, index) => {
        setTimeout(() => {
          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);

          oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
          gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioCtx.currentTime + 0.1
          );

          oscillator.start(audioCtx.currentTime);
          oscillator.stop(audioCtx.currentTime + 0.1);
        }, index * 50);
      });
    }
  } catch (error) {
    console.warn('No se pudo reproducir el sonido de notificación:', error);
  }
}

/**
 * Configuración de recordatorios para eventos
 */
export const REMINDER_TIMES = {
  AT_TIME: 0,
  FIVE_MINUTES: 5,
  FIFTEEN_MINUTES: 15,
  THIRTY_MINUTES: 30,
  ONE_HOUR: 60,
  TWO_HOURS: 120,
  ONE_DAY: 1440,
  ONE_WEEK: 10080,
};

/**
 * Clase para manejar recordatorios de eventos
 */
export class VisualNotificationManager {
  constructor(toastProvider) {
    this.toast = toastProvider;
    this.scheduledReminders = new Map();
    this.settings = this.loadSettings();
  }

  /**
   * Programa recordatorios para un evento
   */
  scheduleEventReminders(event, reminderTimes = null) {
    if (!this.settings.enabled) return;

    const reminders =
      reminderTimes || event.reminders || this.settings.defaultReminders;
    const eventDate = new Date(event.date);

    // Si el evento tiene hora específica, usar esa hora
    if (event.time && !event.isAllDay) {
      const [hours, minutes] = event.time.split(':');
      eventDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }

    // Programar cada recordatorio
    reminders.forEach(reminderMinutes => {
      this.scheduleReminder(event, eventDate, reminderMinutes);
    });
  }

  /**
   * Programa un recordatorio específico
   */
  scheduleReminder(event, eventDate, reminderMinutes) {
    const reminderTime = new Date(
      eventDate.getTime() - reminderMinutes * 60 * 1000
    );
    const now = new Date();

    // Si el tiempo de recordatorio ya pasó, no programar
    if (reminderTime <= now) return;

    const reminderId = `${event.id}_${reminderMinutes}`;
    const timeoutMs = reminderTime.getTime() - now.getTime();

    // Programar el recordatorio
    const timeoutId = setTimeout(() => {
      this.showEventReminder(event, reminderMinutes);
      this.scheduledReminders.delete(reminderId);
    }, timeoutMs);

    // Guardar referencia para poder cancelar después
    this.scheduledReminders.set(reminderId, {
      timeoutId,
      event,
      reminderMinutes,
      scheduledFor: reminderTime,
    });
  }

  /**
   * Muestra un recordatorio visual de evento
   */
  showEventReminder(event, reminderMinutes) {
    const title =
      reminderMinutes === 0 ? `🔔 ${event.title}` : `⏰ ${event.title}`;

    const message =
      reminderMinutes === 0
        ? 'Tu evento está comenzando ahora'
        : `Tu evento comienza en ${this.formatReminderTime(reminderMinutes)}`;

    this.toast.reminder(`${title}\n${message}`, {
      icon:
        event.type === 'work'
          ? '💼'
          : event.type === 'personal'
            ? '👤'
            : event.type === 'meeting'
              ? '👥'
              : '📅',
      actions: [
        {
          label: 'Ver evento',
          action: 'view',
          callback: () => this.handleReminderAction('view', event),
        },
        {
          label: reminderMinutes === 0 ? 'Cerrar' : 'Recordar en 5 min',
          action: reminderMinutes === 0 ? 'dismiss' : 'snooze',
          callback: () =>
            this.handleReminderAction(
              reminderMinutes === 0 ? 'dismiss' : 'snooze',
              event
            ),
        },
      ],
      persistent: reminderMinutes === 0, // Eventos que comienzan ahora son persistentes
      eventData: event,
    });
  }

  /**
   * Maneja acciones de recordatorios
   */
  handleReminderAction(action, event) {
    switch (action) {
      case 'view':
        // Disparar evento para que la aplicación pueda responder
        window.dispatchEvent(
          new CustomEvent('reminderClicked', {
            detail: { event, action: 'view' },
          })
        );
        break;

      case 'snooze':
        // Programar nuevo recordatorio en 5 minutos
        const snoozeTime = new Date(Date.now() + 5 * 60 * 1000);
        this.scheduleReminder(event, snoozeTime, 0);
        this.toast.info('Recordatorio aplazado 5 minutos', {
          icon: '⏸️',
          duration: 2000,
        });
        break;

      case 'dismiss':
        // No hacer nada, el toast se cerrará automáticamente
        break;
    }
  }

  /**
   * Cancela recordatorios de un evento
   */
  cancelEventReminders(eventId) {
    const toCancel = [];

    for (const [reminderId, reminder] of this.scheduledReminders) {
      if (reminder.event.id === eventId) {
        clearTimeout(reminder.timeoutId);
        toCancel.push(reminderId);
      }
    }

    toCancel.forEach(id => this.scheduledReminders.delete(id));
    console.log(
      `Cancelados ${toCancel.length} recordatorios para evento ${eventId}`
    );
  }

  /**
   * Cancela todos los recordatorios
   */
  cancelAllReminders() {
    for (const [, reminder] of this.scheduledReminders) {
      clearTimeout(reminder.timeoutId);
    }
    this.scheduledReminders.clear();
    console.log('Todos los recordatorios han sido cancelados');
  }

  /**
   * Reprograma recordatorios después de cambios en un evento
   */
  rescheduleEventReminders(event) {
    this.cancelEventReminders(event.id);
    this.scheduleEventReminders(event);
  }

  /**
   * Formatea el tiempo de recordatorio
   */
  formatReminderTime(minutes) {
    if (minutes === 0) return 'ahora';
    if (minutes < 60) return `${minutes} minuto${minutes > 1 ? 's' : ''}`;
    if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      return `${hours} hora${hours > 1 ? 's' : ''}`;
    }
    const days = Math.floor(minutes / 1440);
    return `${days} día${days > 1 ? 's' : ''}`;
  }

  /**
   * Obtiene estadísticas
   */
  getStats() {
    return {
      scheduled: this.scheduledReminders.size,
      enabled: this.settings.enabled,
      supported: true, // Siempre true para notificaciones visuales
    };
  }

  /**
   * Actualiza configuración
   */
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  /**
   * Carga configuración
   */
  loadSettings() {
    try {
      const saved = localStorage.getItem('loopr_visual_notification_settings');
      return saved
        ? JSON.parse(saved)
        : {
            enabled: true,
            defaultReminders: [REMINDER_TIMES.FIFTEEN_MINUTES],
            sound: false,
          };
    } catch (error) {
      return {
        enabled: true,
        defaultReminders: [REMINDER_TIMES.FIFTEEN_MINUTES],
        sound: false,
      };
    }
  }

  /**
   * Guarda configuración
   */
  saveSettings() {
    try {
      localStorage.setItem(
        'loopr_visual_notification_settings',
        JSON.stringify(this.settings)
      );
    } catch (error) {
      console.warn('Error guardando configuración:', error);
    }
  }
}
