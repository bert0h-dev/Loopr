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
import { CalendarApp } from '@/CalendarApp.jsx';

const App = () => (
  <CalendarProvider
    initialConfig={{ theme: 'dark', locale: 'es-MX' }}
    initialEvents={[]}
  >
    <CalendarApp />
  </CalendarProvider>
);

render(<App />, document.getElementById('app'));
```

### Usando el Contexto del Calendario

```jsx
import { useCalendarContext } from '@/context/CalendarContext.jsx';

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

  return (
    <div>
      <button onClick={() => navigation.nextMonth()}>Siguiente Mes</button>
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
│   └── views/
│       └── MonthView.jsx       # Vista mensual completa
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

const EventManager = () => {
  const { events, ui } = useCalendarContext();
  const taskManager = useCalendarTaskManager();

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

      console.log('Evento agregado:', newEvent);
    } catch (error) {
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

- **📦 Bundle Size**: ~18KB minificado + gzip
- **🎯 Compatibilidad**: Navegadores modernos (ES6+)
- **⚡ Rendimiento**: Memoización extensiva, lazy loading
- **♿ Accesibilidad**: ARIA labels, navegación por teclado
- **🔧 Extensibilidad**: Arquitectura modular y hooks personalizados
- **🧪 Testing**: Estructura preparada para tests unitarios

## 🤝 Estado del Proyecto

### ✅ Implementado

- ✅ Arquitectura de hooks avanzada
- ✅ Contexto unificado con API categorizada
- ✅ Sistema de acciones organizadas
- ✅ Gestión de tareas asíncronas
- ✅ Componentes principales migrados
- ✅ Control de navegación avanzado
- ✅ Internacionalización completa
- ✅ Sistema de temas
- ✅ Toolbar configurable

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
