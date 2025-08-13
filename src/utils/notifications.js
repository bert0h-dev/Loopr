/**
 * @fileoverview Sistema de notificaciones para eventos
 * @description Manejo de notificaciones del navegador y recordatorios
 */

/**
 * Tipos de notificaciones
 */
export const NOTIFICATION_TYPES = {
  EVENT_REMINDER: 'event_reminder',
  EVENT_STARTING: 'event_starting',
  EVENT_CREATED: 'event_created',
  EVENT_UPDATED: 'event_updated',
  EVENT_DELETED: 'event_deleted',
};

/**
 * Tiempos de recordatorio predefinidos (en minutos)
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
 * Configuración por defecto de notificaciones
 */
export const DEFAULT_NOTIFICATION_SETTINGS = {
  enabled: false,
  permission: 'default', // default, granted, denied
  defaultReminders: [REMINDER_TIMES.FIFTEEN_MINUTES],
  sound: true,
  badge: true,
  desktop: true,
  autoClose: 5000, // 5 segundos
};

/**
 * Clase para manejar el sistema de notificaciones
 */
export class NotificationManager {
  constructor() {
    this.settings = this.loadSettings();
    this.scheduledNotifications = new Map();
    this.init();
  }

  /**
   * Inicializa el sistema de notificaciones
   */
  async init() {
    // Verificar soporte del navegador
    if (!('Notification' in window)) {
      console.warn('Este navegador no soporta notificaciones de escritorio');
      return;
    }

    // Verificar soporte de Service Worker para notificaciones programadas
    if ('serviceWorker' in navigator) {
      try {
        await this.registerServiceWorker();
      } catch (error) {
        console.warn('No se pudo registrar el Service Worker:', error);
      }
    }

    // Actualizar configuración de permisos
    this.settings.permission = Notification.permission;
    this.saveSettings();
  }

  /**
   * Registra el Service Worker para notificaciones en segundo plano
   */
  async registerServiceWorker() {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registrado:', registration);
    return registration;
  }

  /**
   * Solicita permisos para notificaciones
   * @returns {Promise<string>} Estado del permiso
   */
  async requestPermission() {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      this.settings.permission = 'granted';
      this.settings.enabled = true;
    } else if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      this.settings.permission = permission;
      this.settings.enabled = permission === 'granted';
    }

    this.saveSettings();
    return this.settings.permission;
  }

  /**
   * Programa notificaciones para un evento
   * @param {Object} event - Evento para el cual programar notificaciones
   * @param {Array} reminderTimes - Tiempos de recordatorio en minutos
   */
  scheduleEventNotifications(event, reminderTimes = null) {
    if (!this.settings.enabled || this.settings.permission !== 'granted') {
      return;
    }

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
      this.scheduleNotification(event, eventDate, reminderMinutes);
    });
  }

  /**
   * Programa una notificación específica
   * @param {Object} event - Evento
   * @param {Date} eventDate - Fecha y hora del evento
   * @param {number} reminderMinutes - Minutos antes del evento
   */
  scheduleNotification(event, eventDate, reminderMinutes) {
    const notificationTime = new Date(
      eventDate.getTime() - reminderMinutes * 60 * 1000
    );
    const now = new Date();

    // Si el tiempo de notificación ya pasó, no programar
    if (notificationTime <= now) {
      return;
    }

    const notificationId = `${event.id}_${reminderMinutes}`;
    const timeoutMs = notificationTime.getTime() - now.getTime();

    // Programar la notificación
    const timeoutId = setTimeout(() => {
      this.showEventReminder(event, reminderMinutes);
      this.scheduledNotifications.delete(notificationId);
    }, timeoutMs);

    // Guardar referencia para poder cancelar después
    this.scheduledNotifications.set(notificationId, {
      timeoutId,
      event,
      reminderMinutes,
      scheduledFor: notificationTime,
    });

    console.log(
      `Notificación programada para ${event.title} en ${this.formatReminderTime(reminderMinutes)}`
    );
  }

  /**
   * Muestra una notificación de recordatorio de evento
   * @param {Object} event - Evento
   * @param {number} reminderMinutes - Minutos de anticipación
   */
  showEventReminder(event, reminderMinutes) {
    const title =
      reminderMinutes === 0
        ? `🔔 ${event.title}`
        : `⏰ Recordatorio: ${event.title}`;

    const body =
      reminderMinutes === 0
        ? 'Tu evento está comenzando ahora'
        : `Tu evento comienza en ${this.formatReminderTime(reminderMinutes)}`;

    const options = {
      body,
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      tag: `event_${event.id}`,
      data: {
        eventId: event.id,
        type: NOTIFICATION_TYPES.EVENT_REMINDER,
        url: `/?event=${event.id}`,
      },
      actions: [
        {
          action: 'view',
          title: 'Ver evento',
          icon: '/view-icon.png',
        },
        {
          action: 'snooze',
          title: 'Recordar en 5 min',
          icon: '/snooze-icon.png',
        },
      ],
      requireInteraction: reminderMinutes === 0, // Requerir interacción si el evento está comenzando
      silent: !this.settings.sound,
    };

    // Mostrar notificación
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Usar Service Worker para notificaciones persistentes
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, options);
      });
    } else {
      // Usar API básica de notificaciones
      const notification = new Notification(title, options);

      // Auto-cerrar después del tiempo configurado
      if (this.settings.autoClose > 0) {
        setTimeout(() => {
          notification.close();
        }, this.settings.autoClose);
      }

      // Manejar clicks en la notificación
      notification.onclick = () => {
        window.focus();
        notification.close();
        // Navegar al evento si es posible
        this.handleNotificationClick(event);
      };
    }
  }

  /**
   * Muestra una notificación simple
   * @param {string} type - Tipo de notificación
   * @param {string} title - Título
   * @param {string} message - Mensaje
   * @param {Object} options - Opciones adicionales
   */
  showNotification(type, title, message, options = {}) {
    if (!this.settings.enabled || this.settings.permission !== 'granted') {
      return;
    }

    const notificationOptions = {
      body: message,
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      tag: `${type}_${Date.now()}`,
      ...options,
    };

    const notification = new Notification(title, notificationOptions);

    if (this.settings.autoClose > 0) {
      setTimeout(() => {
        notification.close();
      }, this.settings.autoClose);
    }

    return notification;
  }

  /**
   * Cancela notificaciones programadas para un evento
   * @param {string} eventId - ID del evento
   */
  cancelEventNotifications(eventId) {
    const toCancel = [];

    for (const [notificationId, notification] of this.scheduledNotifications) {
      if (notification.event.id === eventId) {
        clearTimeout(notification.timeoutId);
        toCancel.push(notificationId);
      }
    }

    toCancel.forEach(id => this.scheduledNotifications.delete(id));
    console.log(
      `Canceladas ${toCancel.length} notificaciones para evento ${eventId}`
    );
  }

  /**
   * Cancela todas las notificaciones programadas
   */
  cancelAllNotifications() {
    for (const [, notification] of this.scheduledNotifications) {
      clearTimeout(notification.timeoutId);
    }
    this.scheduledNotifications.clear();
    console.log('Todas las notificaciones han sido canceladas');
  }

  /**
   * Reprograma las notificaciones después de cambios en un evento
   * @param {Object} event - Evento actualizado
   */
  rescheduleEventNotifications(event) {
    this.cancelEventNotifications(event.id);
    this.scheduleEventNotifications(event);
  }

  /**
   * Maneja el click en una notificación
   * @param {Object} event - Evento relacionado
   */
  handleNotificationClick(event) {
    // Disparar evento personalizado para que la aplicación pueda responder
    window.dispatchEvent(
      new CustomEvent('notificationClicked', {
        detail: { event },
      })
    );
  }

  /**
   * Aplaza una notificación (snooze)
   * @param {Object} event - Evento
   * @param {number} snoozeMinutes - Minutos para aplazar
   */
  snoozeNotification(event, snoozeMinutes = 5) {
    this.scheduleNotification(
      event,
      new Date(Date.now() + snoozeMinutes * 60 * 1000),
      0
    );
  }

  /**
   * Formatea el tiempo de recordatorio para mostrar
   * @param {number} minutes - Minutos
   * @returns {string} Tiempo formateado
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
   * Obtiene las notificaciones programadas para un evento
   * @param {string} eventId - ID del evento
   * @returns {Array} Notificaciones programadas
   */
  getScheduledNotifications(eventId) {
    const notifications = [];
    for (const [, notification] of this.scheduledNotifications) {
      if (notification.event.id === eventId) {
        notifications.push(notification);
      }
    }
    return notifications;
  }

  /**
   * Actualiza la configuración de notificaciones
   * @param {Object} newSettings - Nueva configuración
   */
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  /**
   * Carga la configuración desde localStorage
   * @returns {Object} Configuración cargada
   */
  loadSettings() {
    try {
      const saved = localStorage.getItem('loopr_notification_settings');
      return saved
        ? { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(saved) }
        : DEFAULT_NOTIFICATION_SETTINGS;
    } catch (error) {
      console.warn('Error cargando configuración de notificaciones:', error);
      return DEFAULT_NOTIFICATION_SETTINGS;
    }
  }

  /**
   * Guarda la configuración en localStorage
   */
  saveSettings() {
    try {
      localStorage.setItem(
        'loopr_notification_settings',
        JSON.stringify(this.settings)
      );
    } catch (error) {
      console.warn('Error guardando configuración de notificaciones:', error);
    }
  }

  /**
   * Obtiene la configuración actual
   * @returns {Object} Configuración actual
   */
  getSettings() {
    return { ...this.settings };
  }

  /**
   * Verifica si las notificaciones están disponibles y habilitadas
   * @returns {boolean} True si están disponibles
   */
  isAvailable() {
    return (
      'Notification' in window &&
      this.settings.permission === 'granted' &&
      this.settings.enabled
    );
  }

  /**
   * Obtiene estadísticas de notificaciones
   * @returns {Object} Estadísticas
   */
  getStats() {
    return {
      scheduled: this.scheduledNotifications.size,
      permission: this.settings.permission,
      enabled: this.settings.enabled,
      supported: 'Notification' in window,
    };
  }
}

// Instancia global del gestor de notificaciones
export const notificationManager = new NotificationManager();
