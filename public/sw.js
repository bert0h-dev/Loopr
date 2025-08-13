/**
 * Service Worker para notificaciones de Loopr Calendar
 * Maneja notificaciones en segundo plano y acciones
 */

const CACHE_NAME = 'loopr-calendar-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/dist/esm/index.css',
  '/dist/esm/main.js',
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  console.log('SW: Installing Service Worker');

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('SW: Caching app shell');
      return cache.addAll(urlsToCache);
    })
  );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
  console.log('SW: Service Worker activated');

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Manejo de solicitudes de red
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Devolver desde cache si está disponible
      if (response) {
        return response;
      }

      // Si no está en cache, hacer solicitud de red
      return fetch(event.request);
    })
  );
});

// Manejo de notificaciones push (para futuras implementaciones)
self.addEventListener('push', event => {
  console.log('SW: Push message received', event);

  const options = {
    body: event.data ? event.data.text() : 'Nuevo recordatorio del calendario',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: 'calendar-reminder',
    data: {
      url: '/',
    },
  };

  event.waitUntil(
    self.registration.showNotification('Loopr Calendar', options)
  );
});

// Manejo de clicks en notificaciones
self.addEventListener('notificationclick', event => {
  console.log('SW: Notification clicked', event);

  event.notification.close();

  const action = event.action;
  const notification = event.notification;
  const data = notification.data || {};

  switch (action) {
    case 'view':
      // Abrir la aplicación y navegar al evento
      event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clientList => {
          // Si ya hay una ventana abierta, enfocarla
          for (const client of clientList) {
            if (client.url === data.url && 'focus' in client) {
              return client.focus();
            }
          }

          // Si no hay ventana abierta, abrir una nueva
          if (clients.openWindow) {
            return clients.openWindow(data.url || '/');
          }
        })
      );
      break;

    case 'snooze':
      // Programar una nueva notificación en 5 minutos
      setTimeout(
        () => {
          self.registration.showNotification('Recordatorio aplazado', {
            body: notification.body,
            icon: notification.icon,
            badge: notification.badge,
            tag: notification.tag + '_snoozed',
            data: notification.data,
          });
        },
        5 * 60 * 1000
      ); // 5 minutos
      break;

    default:
      // Click por defecto - abrir la aplicación
      event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clientList => {
          if (clientList.length > 0) {
            return clientList[0].focus();
          }

          if (clients.openWindow) {
            return clients.openWindow('/');
          }
        })
      );
  }
});

// Manejo de cierre de notificaciones
self.addEventListener('notificationclose', event => {
  console.log('SW: Notification closed', event);

  // Aquí se pueden agregar analytics o limpiezas necesarias
});

// Sincronización en segundo plano (para futuras implementaciones)
self.addEventListener('sync', event => {
  console.log('SW: Background sync', event);

  if (event.tag === 'calendar-sync') {
    event.waitUntil(
      // Aquí se podría sincronizar eventos con un servidor
      console.log('SW: Syncing calendar data')
    );
  }
});

// Mensajes desde la aplicación principal
self.addEventListener('message', event => {
  console.log('SW: Message received', event.data);

  const { type, data } = event.data;

  switch (type) {
    case 'SCHEDULE_NOTIFICATION':
      // Programar una notificación
      const { event: calendarEvent, reminderTime } = data;
      const delay = reminderTime - Date.now();

      if (delay > 0) {
        setTimeout(() => {
          self.registration.showNotification(
            `Recordatorio: ${calendarEvent.title}`,
            {
              body: `Tu evento comienza pronto`,
              icon: '/icon-192.png',
              badge: '/badge-72.png',
              tag: `event_${calendarEvent.id}`,
              data: {
                eventId: calendarEvent.id,
                url: `/?event=${calendarEvent.id}`,
              },
              actions: [
                {
                  action: 'view',
                  title: 'Ver evento',
                },
                {
                  action: 'snooze',
                  title: 'Recordar en 5 min',
                },
              ],
            }
          );
        }, delay);
      }
      break;

    case 'CANCEL_NOTIFICATION':
      // Cancelar notificaciones (limitado en Service Worker)
      console.log('SW: Canceling notifications for', data.eventId);
      break;

    default:
      console.log('SW: Unknown message type', type);
  }
});

// Utilidades del Service Worker
function logNotificationAction(action, eventId) {
  console.log(`SW: Notification action '${action}' for event ${eventId}`);

  // Aquí se podrían enviar analytics o logs a un servidor
}

function scheduleRecurringNotification(event, recurrence) {
  // Lógica para programar notificaciones recurrentes
  console.log('SW: Scheduling recurring notification', event, recurrence);
}

// Información del Service Worker
console.log('SW: Loopr Calendar Service Worker loaded');
console.log('SW: Cache name:', CACHE_NAME);
console.log('SW: Cached URLs:', urlsToCache);
