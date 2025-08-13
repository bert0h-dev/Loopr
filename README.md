# 📅 Loopr

Un calendario moderno y extensible construido con **Preact**, que ofrece una arquitectura de hooks avanzada, gestión de estado reactiva y una API categorizada para el control total del calendario.

## 🌟 Características Principales

- **🪶 Ultra Ligero**: Construido con Preact (~3KB) para un bundle mínimo
- **🏗️ Arquitectura Avanzada**: Sistema de hooks categorizados y contexto unificado
- **🔧 API Categorizada**: Acciones organizadas por funcionalidad (`config`, `navigation`, `view`, `events`, `ui`)
- **⚡ Alto Rendimiento**: Memoización extensiva y gestión optimizada del estado
- **🌍 Internacionalización**: Soporte completo para múltiples idiomas y regiones
- **📱 Responsive**: Diseño adaptable con CSS modular
- **🎯 Control Granular**: Gestión avanzada de tareas asíncronas y estados
- **🔄 Sistema de Eventos**: Suscripción a cambios con controladores especializados
- **🔔 Notificaciones Visuales**: Sistema completo de toasts con animaciones y configuración avanzada
- **🎨 Temas Dinámicos**: Soporte para modo claro/oscuro con transiciones suaves

## � Inicio Rápido

```bash
# Instalar dependencias
npm install

# Modo desarrollo con hot reload
npm run dev

# Compilar para producción
npm run build
```

## 💻 Uso Básico

### Configuración del Contexto

```jsx
import { h, render } from 'preact';
import { CalendarProvider } from '@/context/CalendarContext.jsx';
import { ToastProvider } from '@/contexts/ToastContext.jsx';
import { CalendarApp } from '@/CalendarApp.jsx';

const App = () => (
  <ToastProvider>
    <CalendarProvider
      initialConfig={{ theme: 'dark', locale: 'es-MX' }}
      initialEvents={[]}
    >
      <CalendarApp />
    </CalendarProvider>
  </ToastProvider>
);

render(<App />, document.getElementById('app'));
```

### Usando el Contexto del Calendario

```jsx
import { useCalendarContext } from '@/context/CalendarContext.jsx';
import { useToast } from '@/contexts/ToastContext.jsx';

const MyComponent = () => {
  const {
    // Estado del calendario
    currentDate,
    config,
    events,
    activeView,

    // Acciones categorizadas
    configActions,
    navigation,
    view,
    events: eventActions,
    ui,

    // API plana (compatibilidad)
    setTheme,
    nextMonth,
    addEvent,
    showMonthView,
  } = useCalendarContext();

  // Sistema de notificaciones visuales
  const { addToast } = useToast();

  const handleAction = () => {
    // Ejecutar acción
    navigation.nextMonth();

    // Mostrar notificación
    addToast({
      type: 'success',
      message: 'Navegado al siguiente mes',
      duration: 3000,
    });
  };

  return (
    <div>
      <button onClick={handleAction}>Siguiente Mes</button>
      <button onClick={() => view.showWeekView()}>Vista Semanal</button>
      <button onClick={() => configActions.toggleTheme()}>Cambiar Tema</button>
    </div>
  );
};
```

## 🏗️ Arquitectura del Sistema

### 📁 Estructura del Proyecto

```
src/
├── App.jsx                     # Componente raíz
├── CalendarApp.jsx             # Aplicación principal del calendario
├── CalendarContent.jsx         # Contenido principal
├── context/
│   └── CalendarContext.jsx     # Contexto global con estado y acciones
├── contexts/
│   └── ToastContext.jsx        # Sistema de notificaciones visuales
├── hooks/
│   ├── useCalendarActions.js   # Acciones del calendario
│   ├── useCalendarTaskManager.js # Gestión de tareas asíncronas
│   ├── useCalendarController.js # Control de navegación de fechas
│   ├── useCalendarReducer.js   # Reducer del estado global
│   └── index.js               # Exportaciones centralizadas
├── components/
│   ├── common/
│   │   ├── CalendarHeader.jsx  # Header principal
│   │   └── CalendarViews.jsx   # Selector de vistas
│   ├── viewHeader/
│   │   ├── Toolbar.jsx         # Barra de herramientas
│   │   └── ToolbarSection.jsx  # Secciones de la toolbar
│   ├── viewMonth/
│   │   ├── MonthDays.jsx       # Grilla de días del mes
│   │   └── MonthDaysHeader.jsx # Header de días de semana
│   ├── views/
│   │   └── MonthView.jsx       # Vista mensual completa
│   ├── ToastSystem.jsx         # Sistema de notificaciones toast
│   ├── VisualNotificationSettings.jsx # Configuración de notificaciones
│   └── ThemeSwitcher.jsx       # Cambio de temas
├── config/
│   ├── initialConfig.js        # Configuración inicial
│   └── ToolbarConfig.js        # Configuración de toolbar
├── utils/
│   └── dateUtils.js           # Utilidades de fechas
└── css/                       # Estilos modulares organizados
```

### 🎯 Sistema de Hooks

#### `useCalendarContext()`

**Hook principal** que proporciona acceso completo al estado y acciones del calendario:

```jsx
const {
  // 📊 Estado
  currentDate, // Fecha actual
  config, // Configuración del calendario
  events, // Lista de eventos
  activeView, // Vista activa ('month', 'week', 'day')
  selectedEvents, // Eventos seleccionados

  // 🎛️ Controladores
  dateController, // Control de navegación de fechas

  // �️ Acciones Categorizadas
  configActions: {
    updateConfig, // Actualizar configuración
    setTheme, // Cambiar tema
    toggleTheme, // Alternar tema
    setLocale, // Cambiar idioma
    setTimeFormat, // Formato de hora
  },
  navigation: {
    goToToday, // Ir a hoy
    nextMonth, // Siguiente mes
    prevMonth, // Mes anterior
    nextYear, // Siguiente año
    prevYear, // Año anterior
  },
  view: {
    showMonthView, // Mostrar vista mensual
    showWeekView, // Mostrar vista semanal
    showDayView, // Mostrar vista diaria
    setActiveView, // Cambiar vista
  },
  events: {
    addEvent, // Agregar evento
    updateEvent, // Actualizar evento
    deleteEvent, // Eliminar evento
    setEvents, // Establecer eventos
    selectEvent, // Seleccionar evento
  },
  ui: {
    openEventModal, // Abrir modal de evento
    closeEventModal, // Cerrar modal
    setError, // Establecer error
    setLoading, // Establecer carga
    toggleSidebar, // Alternar sidebar
  },
} = useCalendarContext();
```

#### `useCalendarTaskManager()`

**Hook avanzado** para gestión de tareas asíncronas con control de estado:

```jsx
const taskManager = useCalendarTaskManager();

// Ejecutar tarea con manejo de estado automático
await taskManager.executeTask('loadEvents', async () => {
  const events = await fetchEventsFromAPI();
  return events;
});

// Gestión de múltiples tareas
await taskManager.executeTasks([
  ['loadEvents', loadEventsTask],
  ['syncCalendar', syncTask],
  ['updateUI', updateTask],
]);
```

## � API Categorizada

### 🔧 Acciones de Configuración (`configActions`)

```jsx
const { configActions } = useCalendarContext();

// Gestión de temas
configActions.setTheme('dark');
configActions.toggleTheme();

// Internacionalización
configActions.setLocale('es-MX');
configActions.setTimeFormat('24h');
configActions.setFirstDayOfWeek(1); // Lunes

// Configuración personalizada
configActions.updateConfig({
  theme: 'dark',
  locale: 'en-US',
  weekendsVisible: true,
});
```

### 🧭 Acciones de Navegación (`navigation`)

```jsx
const { navigation } = useCalendarContext();

// Navegación básica
navigation.goToToday();
navigation.nextMonth();
navigation.prevMonth();
navigation.nextYear();
navigation.prevYear();

// Navegación avanzada
navigation.nextWeek();
navigation.prevWeek();
navigation.setDate(new Date('2024-12-25'));
navigation.incrementDate(7, 'day');
```

### 👁️ Acciones de Vista (`view`)

```jsx
const { view } = useCalendarContext();

// Cambio de vistas
view.showMonthView();
view.showWeekView();
view.showDayView();
view.showAgendaView();

// Control directo
view.setActiveView('week');
```

### � Acciones de Eventos (`events`)

```jsx
const { events } = useCalendarContext();

// Gestión de eventos (con Promises)
try {
  const newEvent = await events.addEvent({
    title: 'Reunión importante',
    date: new Date(),
    description: 'Descripción del evento',
  });

  await events.updateEvent(newEvent.id, {
    title: 'Reunión actualizada',
  });

  await events.deleteEvent(newEvent.id);
} catch (error) {
  console.error('Error:', error);
}

// Selección de eventos
events.selectEvent(event);
events.clearSelectedEvents();
```

### 🎛️ Acciones de UI (`ui`)

```jsx
const { ui } = useCalendarContext();

// Modales
ui.openEventModal(selectedDate);
ui.closeEventModal();

// Estados de aplicación
ui.setLoading(true);
ui.setError('Error al cargar eventos');
ui.clearError();

// Interfaz
ui.toggleSidebar();
ui.setSidebarOpen(false);
```

## 🔔 Sistema de Notificaciones Visuales

Loopr incluye un sistema completo de notificaciones visuales tipo toast que reemplaza las notificaciones del navegador, ofreciendo mejor control y experiencia de usuario.

### 🎨 Tipos de Notificaciones

```jsx
import { useToast } from '@/contexts/ToastContext.jsx';

const MyComponent = () => {
  const { addToast } = useToast();

  const showNotifications = () => {
    // Notificación de éxito
    addToast({
      type: 'success',
      message: '¡Evento creado exitosamente!',
      duration: 3000,
    });

    // Notificación de error
    addToast({
      type: 'error',
      message: 'Error al guardar el evento',
      duration: 5000,
    });

    // Notificación de advertencia
    addToast({
      type: 'warning',
      message: 'El evento se solapa con otro existente',
      duration: 4000,
    });

    // Notificación informativa
    addToast({
      type: 'info',
      message: 'Sincronizando calendario...',
      duration: 2000,
    });

    // Recordatorio
    addToast({
      type: 'reminder',
      message: 'Reunión en 15 minutos',
      duration: 0, // No se cierra automáticamente
      actions: [
        { text: 'Posponer', action: 'snooze' },
        { text: 'Ver', action: 'view' },
      ],
    });
  };

  return <button onClick={showNotifications}>Mostrar Notificaciones</button>;
};
```

### ⚙️ Configuración de Notificaciones

```jsx
import {
  useToast,
  VisualNotificationManager,
} from '@/contexts/ToastContext.jsx';

const NotificationComponent = () => {
  const { config, updateConfig } = useToast();

  const handleConfigChange = newConfig => {
    updateConfig(newConfig);
  };

  return (
    <div>
      {/* Configuración de posición */}
      <select
        value={config.position}
        onChange={e => handleConfigChange({ position: e.target.value })}
      >
        <option value='top-right'>Superior Derecha</option>
        <option value='top-left'>Superior Izquierda</option>
        <option value='top-center'>Superior Centro</option>
        <option value='bottom-right'>Inferior Derecha</option>
        <option value='bottom-left'>Inferior Izquierda</option>
        <option value='bottom-center'>Inferior Centro</option>
      </select>

      {/* Configuración de comportamiento */}
      <label>
        <input
          type='checkbox'
          checked={config.autoDismiss}
          onChange={e => handleConfigChange({ autoDismiss: e.target.checked })}
        />
        Auto-cerrar notificaciones
      </label>

      <label>
        <input
          type='checkbox'
          checked={config.pauseOnHover}
          onChange={e => handleConfigChange({ pauseOnHover: e.target.checked })}
        />
        Pausar al pasar el mouse
      </label>

      <label>
        <input
          type='checkbox'
          checked={config.soundEnabled}
          onChange={e => handleConfigChange({ soundEnabled: e.target.checked })}
        />
        Sonidos de notificación
      </label>
    </div>
  );
};
```

### 🎵 Sonidos y Efectos

El sistema incluye sonidos personalizados para cada tipo de notificación:

```jsx
// Configuración de sonidos por tipo
const soundConfig = {
  success: { frequency: 800, duration: 200 },
  error: { frequency: 400, duration: 400 },
  warning: { frequency: 600, duration: 300 },
  info: { frequency: 500, duration: 150 },
  reminder: { frequency: 700, duration: 250 },
};

// Los sonidos se pueden deshabilitar globalmente
updateConfig({ soundEnabled: false });
```

### 📱 Notificaciones Programadas

```jsx
import { VisualNotificationManager } from '@/contexts/ToastContext.jsx';

// Programar notificación
VisualNotificationManager.scheduleNotification({
  type: 'reminder',
  message: 'Reunión de equipo',
  scheduledTime: new Date(Date.now() + 15 * 60 * 1000), // 15 minutos
  actions: [
    { text: 'Unirse', action: 'join' },
    { text: 'Posponer 5m', action: 'snooze' },
  ],
});

// Cancelar notificación programada
VisualNotificationManager.cancelScheduledNotification(notificationId);
```

## 🌍 Internacionalización

Soporte completo para múltiples idiomas y configuraciones regionales:

```jsx
const { configActions } = useCalendarContext();

// Configurar idioma
configActions.setLocale('es-MX'); // Español México
configActions.setLocale('en-US'); // Inglés Estados Unidos
configActions.setLocale('fr-FR'); // Francés Francia

// Configurar formatos
configActions.setDateFormat('DD/MM/YYYY');
configActions.setTimeFormat('24h');
configActions.setFirstDayOfWeek(1); // 0=Domingo, 1=Lunes
```

## ⚙️ Configuración Avanzada

### Configuración Inicial

```jsx
const initialConfig = {
  locale: 'es-MX',
  firstDayOfWeek: 1,
  timeFormat: '24h',
  dateFormat: 'DD/MM/YYYY',
  theme: 'dark',
  weekendsVisible: true,
  viewToolbar: {
    start: [{ action: 'today' }, { action: 'month' }, { action: 'week' }],
    center: [{ action: 'title' }],
    end: [{ action: 'prev' }, { action: 'next' }],
  },
};

<CalendarProvider initialConfig={initialConfig}>
  <App />
</CalendarProvider>;
```

### Eventos Iniciales

```jsx
const initialEvents = [
  {
    id: '1',
    title: 'Evento importante',
    date: new Date('2024-01-15'),
    description: 'Descripción del evento',
  },
];

<CalendarProvider initialEvents={initialEvents}>
  <App />
</CalendarProvider>;
```

## 🎯 Ejemplos de Uso

### Componente de Control Personalizado

```jsx
import { useCalendarContext } from '@/context/CalendarContext.jsx';

const CustomControls = () => {
  const { navigation, view, configActions, currentDate } = useCalendarContext();

  return (
    <div className='custom-controls'>
      {/* Navegación */}
      <div className='nav-controls'>
        <button onClick={navigation.prevMonth}>←</button>
        <span>{currentDate.toLocaleDateString()}</span>
        <button onClick={navigation.nextMonth}>→</button>
      </div>

      {/* Selector de vista */}
      <div className='view-controls'>
        <button onClick={view.showMonthView}>Mes</button>
        <button onClick={view.showWeekView}>Semana</button>
        <button onClick={view.showDayView}>Día</button>
      </div>

      {/* Configuración */}
      <div className='config-controls'>
        <button onClick={configActions.toggleTheme}>Cambiar Tema</button>
      </div>
    </div>
  );
};
```

### Gestión de Eventos Avanzada

```jsx
import { useCalendarContext, useCalendarTaskManager } from '@/hooks';
import { useToast } from '@/contexts/ToastContext.jsx';

const EventManager = () => {
  const { events, ui } = useCalendarContext();
  const taskManager = useCalendarTaskManager();
  const { addToast } = useToast();

  const handleAddEvent = async eventData => {
    try {
      ui.setLoading(true);

      const newEvent = await taskManager.executeTask('addEvent', async () => {
        // Validar datos
        if (!eventData.title) throw new Error('Título requerido');

        // Agregar evento
        return await events.addEvent({
          ...eventData,
          id: `event_${Date.now()}`,
        });
      });

      // Notificación de éxito
      addToast({
        type: 'success',
        message: `Evento "${newEvent.title}" creado exitosamente`,
        duration: 3000,
      });

      console.log('Evento agregado:', newEvent);
    } catch (error) {
      // Notificación de error
      addToast({
        type: 'error',
        message: `Error al agregar evento: ${error.message}`,
        duration: 5000,
      });

      ui.setError(`Error al agregar evento: ${error.message}`);
    } finally {
      ui.setLoading(false);
    }
  };

  return (
    <div className='event-manager'>
      <button
        onClick={() =>
          handleAddEvent({
            title: 'Nuevo evento',
            date: new Date(),
          })
        }
      >
        Agregar Evento
      </button>
    </div>
  );
};
```

### Sistema de Notificaciones Completo

```jsx
import {
  ToastProvider,
  useToast,
  VisualNotificationSettings,
} from '@/contexts/ToastContext.jsx';
import { ToastSystem } from '@/components/ToastSystem.jsx';

const NotificationApp = () => {
  const { toasts, removeToast, config } = useToast();

  return (
    <div className='app'>
      {/* Contenido principal */}
      <main>
        <EventManager />
        <VisualNotificationSettings />
      </main>

      {/* Sistema de toasts */}
      <ToastSystem toasts={toasts} onClose={removeToast} config={config} />
    </div>
  );
};

// Configuración completa de la aplicación
const App = () => (
  <ToastProvider
    initialConfig={{
      position: 'top-right',
      autoDismiss: true,
      duration: 4000,
      pauseOnHover: true,
      soundEnabled: true,
      showProgress: true,
    }}
  >
    <CalendarProvider>
      <NotificationApp />
    </CalendarProvider>
  </ToastProvider>
);
```

## 🛠️ Scripts de Desarrollo

```bash
# Desarrollo
npm run dev          # Servidor con hot reload
npm run build        # Build de producción
npm run clean        # Limpiar dist/

# Calidad de código
npm run lint         # ESLint
npm run lint:fix     # Corregir automáticamente
npm run format:check # Verificar formato
npm run format:write # Formatear código
```

## 📊 Características Técnicas

- **📦 Bundle Size**: ~22KB minificado + gzip (incluye sistema de notificaciones)
- **🎯 Compatibilidad**: Navegadores modernos (ES6+)
- **⚡ Rendimiento**: Memoización extensiva, lazy loading
- **♿ Accesibilidad**: ARIA labels, navegación por teclado, notificaciones accesibles
- **🔧 Extensibilidad**: Arquitectura modular y hooks personalizados
- **🧪 Testing**: Estructura preparada para tests unitarios
- **🔔 Notificaciones**: Sistema completo sin dependencias externas
- **🎨 Animaciones**: Transiciones CSS optimizadas y fluidas

## 🤝 Estado del Proyecto

### ✅ Implementado

- ✅ Arquitectura de hooks avanzada
- ✅ Contexto unificado con API categorizada
- ✅ Sistema de acciones organizadas
- ✅ Gestión de tareas asíncronas
- ✅ Componentes principales migrados
- ✅ Control de navegación avanzado
- ✅ Internacionalización completa
- ✅ Sistema de temas dinámico
- ✅ Toolbar configurable
- ✅ **Sistema de notificaciones visuales completo**
- ✅ **Toasts con animaciones y múltiples tipos**
- ✅ **Configuración avanzada de notificaciones**
- ✅ **Sonidos personalizados por tipo**
- ✅ **Notificaciones programadas**
- ✅ **Reemplazo completo de notificaciones del navegador**

### 🚧 En Desarrollo

- 🚧 Vista semanal completa
- 🚧 Vista diaria detallada
- 🚧 Sistema de eventos avanzado
- 🚧 Drag & Drop de eventos
- 🚧 Exportación de calendario

### 📋 Roadmap

- 📋 Tests unitarios completos
- 📋 Storybook para componentes
- 📋 Plugin system
- 📋 TypeScript support
- 📋 PWA capabilities

## 👨‍💻 Autor

**Bert0h-dev** - [GitHub](https://github.com/bert0h-dev)

## 📄 Licencia

ISC License - Ver [LICENSE](LICENSE) para más detalles.

---

**Loopr** - El calendario más avanzado y ligero para aplicaciones web modernas 🚀
