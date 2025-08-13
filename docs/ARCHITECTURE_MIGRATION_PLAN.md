# 🏗️ Plan de Migración Arquitectónica - Loopr Calendar

## 📋 Análisis de la Arquitectura Actual

### Patrones Implementados Actualmente

- ✅ **Flux/Redux Pattern** - `useReducer` con acciones tipadas
- ✅ **Provider Pattern** - `CalendarProvider` centraliza estado global
- ✅ **Custom Hook Pattern** - Hooks especializados por funcionalidad
- ✅ **Observer Pattern** - Sistema de eventos en `useCalendarController`
- ✅ **Command Pattern** - Acciones del reducer
- ✅ **Facade Pattern** - `useCalendarContext` como punto de acceso
- ✅ **Strategy Pattern** - Múltiples vistas (month, week, day, agenda, year)
- ✅ **Factory Pattern** - `createCategorizedActions`

### Fortalezas Actuales

- ✅ Separación clara entre componentes de UI
- ✅ Estado centralizado y manejable
- ✅ Hooks especializados y reutilizables
- ✅ Sistema de configuración flexible
- ✅ Manejo de errores y loading states

### Áreas de Mejora Identificadas

- 🔴 Lógica de negocio mezclada con presentación
- 🔴 Hooks con múltiples responsabilidades
- 🔴 Falta de entidades de dominio explícitas
- 🔴 Testing complejo debido a dependencias
- 🔴 Dificultad para reutilizar lógica fuera de React

---

## 🎯 Arquitectura Objetivo: MVVM + Clean Architecture

### Principios Fundamentales

1. **Separación de Responsabilidades**
2. **Inversión de Dependencias**
3. **Testabilidad**
4. **Escalabilidad**
5. **Mantenibilidad**

### Capas Propuestas

```
src/
├── presentation/          # 🎨 View Layer (UI)
│   ├── components/
│   │   ├── common/
│   │   ├── views/
│   │   └── modals/
│   ├── hooks/            # Hooks de presentación únicamente
│   └── pages/            # Componentes de página
│
├── application/          # 🧠 ViewModel Layer (Lógica de Aplicación)
│   ├── viewmodels/
│   │   ├── CalendarViewModel.js
│   │   ├── EventViewModel.js
│   │   └── ConfigViewModel.js
│   ├── services/
│   │   ├── CalendarService.js
│   │   ├── EventService.js
│   │   └── NotificationService.js
│   └── use-cases/
│       ├── CreateEventUseCase.js
│       ├── NavigateCalendarUseCase.js
│       └── UpdateConfigUseCase.js
│
├── domain/              # 🏛️ Model Layer (Lógica de Negocio)
│   ├── entities/
│   │   ├── Event.js
│   │   ├── Calendar.js
│   │   └── CalendarConfig.js
│   ├── repositories/    # Interfaces
│   │   ├── IEventRepository.js
│   │   └── IConfigRepository.js
│   ├── services/
│   │   ├── DateService.js
│   │   └── ValidationService.js
│   └── value-objects/
│       ├── DateRange.js
│       └── TimeSlot.js
│
├── infrastructure/      # 🔧 External Layer
│   ├── repositories/    # Implementaciones
│   │   ├── LocalEventRepository.js
│   │   └── LocalConfigRepository.js
│   ├── api/
│   │   └── CalendarAPI.js
│   └── storage/
│       └── LocalStorage.js
│
└── shared/             # 🛠️ Shared Utilities
    ├── constants/
    ├── types/
    ├── utils/
    └── errors/
```

---

## 🗺️ Plan de Migración Gradual

### 📅 Fase 1: Preparación y Fundamentos (Semana 1-2)

#### 1.1 Crear Estructura Base

```bash
mkdir -p src/{domain,application,infrastructure,shared}/{entities,repositories,services,types,constants,utils}
```

#### 1.2 Definir Entidades de Dominio

```javascript
// src/domain/entities/Event.js
export class Event {
  constructor(id, title, date, description = '', type = 'default') {
    this.id = id;
    this.title = title;
    this.date = date;
    this.description = description;
    this.type = type;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static create(data) {
    return new Event(
      data.id || generateId(),
      data.title,
      data.date,
      data.description,
      data.type
    );
  }

  update(data) {
    return new Event(
      this.id,
      data.title ?? this.title,
      data.date ?? this.date,
      data.description ?? this.description,
      data.type ?? this.type
    );
  }
}
```

#### 1.3 Crear Repositorios (Interfaces)

```javascript
// src/domain/repositories/IEventRepository.js
export class IEventRepository {
  async getAll() {
    throw new Error('Not implemented');
  }
  async getById(id) {
    throw new Error('Not implemented');
  }
  async save(event) {
    throw new Error('Not implemented');
  }
  async delete(id) {
    throw new Error('Not implemented');
  }
  async getByDateRange(startDate, endDate) {
    throw new Error('Not implemented');
  }
}
```

### 📅 Fase 2: ViewModels y Casos de Uso (Semana 3-4)

#### 2.1 Crear ViewModels Base

```javascript
// src/application/viewmodels/CalendarViewModel.js
import { useState, useCallback } from 'preact/hooks';

export class CalendarViewModel {
  constructor(eventRepository, configRepository) {
    this.eventRepository = eventRepository;
    this.configRepository = configRepository;
    this.state = {
      currentDate: new Date(),
      activeView: 'month',
      events: [],
      config: {},
      loading: false,
      error: null,
    };
  }

  // Métodos para manipular el estado
  async loadEvents(dateRange) {
    this.setState({ loading: true, error: null });
    try {
      const events = await this.eventRepository.getByDateRange(
        dateRange.start,
        dateRange.end
      );
      this.setState({ events, loading: false });
    } catch (error) {
      this.setState({ error: error.message, loading: false });
    }
  }

  async createEvent(eventData) {
    // Lógica para crear evento
  }

  // ... más métodos
}
```

#### 2.2 Crear Casos de Uso

```javascript
// src/application/use-cases/CreateEventUseCase.js
export class CreateEventUseCase {
  constructor(eventRepository, notificationService) {
    this.eventRepository = eventRepository;
    this.notificationService = notificationService;
  }

  async execute(eventData) {
    // Validar datos
    if (!eventData.title || !eventData.date) {
      throw new Error('Título y fecha son requeridos');
    }

    // Crear entidad
    const event = Event.create(eventData);

    // Guardar
    const savedEvent = await this.eventRepository.save(event);

    // Notificar
    this.notificationService.notify('Evento creado exitosamente');

    return savedEvent;
  }
}
```

### 📅 Fase 3: Implementación de Infrastructure (Semana 5)

#### 3.1 Implementar Repositorios

```javascript
// src/infrastructure/repositories/LocalEventRepository.js
import { IEventRepository } from '../../domain/repositories/IEventRepository.js';

export class LocalEventRepository extends IEventRepository {
  constructor(storage) {
    super();
    this.storage = storage;
    this.STORAGE_KEY = 'loopr_events';
  }

  async getAll() {
    const events = this.storage.getItem(this.STORAGE_KEY) || [];
    return events.map(data => Event.create(data));
  }

  async save(event) {
    const events = await this.getAll();
    const existingIndex = events.findIndex(e => e.id === event.id);

    if (existingIndex >= 0) {
      events[existingIndex] = event;
    } else {
      events.push(event);
    }

    this.storage.setItem(this.STORAGE_KEY, events);
    return event;
  }

  // ... más métodos
}
```

### 📅 Fase 4: Refactorizar Componentes (Semana 6-7)

#### 4.1 Simplificar Componentes

```javascript
// src/presentation/components/CalendarApp.jsx
import { useCalendarViewModel } from '../hooks/useCalendarViewModel.js';

export const CalendarApp = ({ config = {}, events = [] }) => {
  const viewModel = useCalendarViewModel({ config, events });

  return (
    <div className='calendar-app'>
      {viewModel.loading && <LoadingSpinner />}
      {viewModel.error && <ErrorMessage error={viewModel.error} />}

      <CalendarHeader
        currentDate={viewModel.currentDate}
        activeView={viewModel.activeView}
        onNavigate={viewModel.navigate}
        onViewChange={viewModel.changeView}
      />

      <CalendarContent
        events={viewModel.events}
        currentDate={viewModel.currentDate}
        activeView={viewModel.activeView}
        onEventCreate={viewModel.createEvent}
        onEventUpdate={viewModel.updateEvent}
      />
    </div>
  );
};
```

#### 4.2 Crear Hook de ViewModel

```javascript
// src/presentation/hooks/useCalendarViewModel.js
import { useState, useEffect } from 'preact/hooks';
import { CalendarViewModel } from '../../application/viewmodels/CalendarViewModel.js';

export const useCalendarViewModel = initialConfig => {
  const [viewModel] = useState(
    () =>
      new CalendarViewModel(
        container.get('eventRepository'),
        container.get('configRepository')
      )
  );

  const [state, setState] = useState(viewModel.state);

  useEffect(() => {
    viewModel.subscribe(setState);
    return () => viewModel.unsubscribe(setState);
  }, [viewModel]);

  return {
    ...state,
    // Métodos del ViewModel
    navigate: viewModel.navigate.bind(viewModel),
    changeView: viewModel.changeView.bind(viewModel),
    createEvent: viewModel.createEvent.bind(viewModel),
    updateEvent: viewModel.updateEvent.bind(viewModel),
    deleteEvent: viewModel.deleteEvent.bind(viewModel),
  };
};
```

### 📅 Fase 5: Testing y Optimización (Semana 8)

#### 5.1 Estructura de Tests

```
tests/
├── unit/
│   ├── domain/
│   │   ├── entities/
│   │   └── services/
│   ├── application/
│   │   ├── viewmodels/
│   │   └── use-cases/
│   └── infrastructure/
│       └── repositories/
├── integration/
│   └── viewmodels/
└── e2e/
    └── calendar-flows/
```

#### 5.2 Ejemplo de Test

```javascript
// tests/unit/application/use-cases/CreateEventUseCase.test.js
import { CreateEventUseCase } from '../../../../src/application/use-cases/CreateEventUseCase.js';

describe('CreateEventUseCase', () => {
  let useCase;
  let mockEventRepository;
  let mockNotificationService;

  beforeEach(() => {
    mockEventRepository = {
      save: jest.fn(),
    };
    mockNotificationService = {
      notify: jest.fn(),
    };

    useCase = new CreateEventUseCase(
      mockEventRepository,
      mockNotificationService
    );
  });

  it('should create event successfully', async () => {
    // Arrange
    const eventData = {
      title: 'Test Event',
      date: new Date('2025-08-15'),
      description: 'Test description',
    };

    mockEventRepository.save.mockResolvedValue(eventData);

    // Act
    const result = await useCase.execute(eventData);

    // Assert
    expect(mockEventRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Event',
        date: eventData.date,
      })
    );
    expect(mockNotificationService.notify).toHaveBeenCalledWith(
      'Evento creado exitosamente'
    );
  });
});
```

---

## 🔄 Mapeo de Migración

### Archivos Actuales → Nueva Estructura

| Archivo Actual                    | Nueva Ubicación                                   | Cambios                             |
| --------------------------------- | ------------------------------------------------- | ----------------------------------- |
| `src/context/CalendarContext.jsx` | `src/application/viewmodels/CalendarViewModel.js` | Convertir a clase, separar lógica   |
| `src/hooks/useCalendarActions.js` | `src/application/use-cases/`                      | Dividir en casos de uso específicos |
| `src/hooks/useCalendarReducer.js` | `src/application/viewmodels/`                     | Integrar en ViewModels              |
| `src/config/initialConfig.js`     | `src/domain/entities/CalendarConfig.js`           | Convertir a entidad                 |
| `src/components/views/`           | `src/presentation/components/views/`              | Simplificar, solo UI                |

### Hooks a Refactorizar

| Hook Actual              | Destino             | Responsabilidad              |
| ------------------------ | ------------------- | ---------------------------- |
| `useCalendarController`  | `CalendarViewModel` | Navegación y estado de fecha |
| `useCalendarTaskManager` | `Use Cases`         | Operaciones asíncronas       |
| `useCalendarViews`       | `CalendarViewModel` | Manejo de vistas             |
| `useCalendarConfig`      | `ConfigViewModel`   | Configuración                |
| `useCalendarUI`          | `Presentation Hook` | Solo estado de UI            |

---

## 🚀 Beneficios Esperados

### Inmediatos

- ✅ **Mejor separación de responsabilidades**
- ✅ **Código más testeable**
- ✅ **Lógica reutilizable**
- ✅ **Mantenimiento simplificado**

### A Mediano Plazo

- ✅ **Escalabilidad mejorada**
- ✅ **Onboarding más fácil para desarrolladores**
- ✅ **Debugging simplificado**
- ✅ **Performance optimizado**

### A Largo Plazo

- ✅ **Arquitectura adaptable**
- ✅ **Integración con APIs externas**
- ✅ **Migración a otros frameworks**
- ✅ **Extensibilidad para nuevas funcionalidades**

---

## 📚 Recursos y Referencias

### Patrones de Diseño

- [MVVM Pattern](https://docs.microsoft.com/en-us/xamarin/xamarin-forms/enterprise-application-patterns/mvvm)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)

### Implementación en React

- [React Hooks + MVVM](https://dev.to/remi_london/react-mvvm-architecture-using-hooks-5b5f)
- [Clean Architecture React](https://github.com/eduardomoroni/react-clean-architecture)

### Testing

- [Testing ViewModels](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Unit Testing Use Cases](https://blog.cleancoder.com/uncle-bob/2017/10/03/TestContravariance.html)

---

## 🎯 Próximos Pasos

1. **Revisar y aprobar** este plan de migración
2. **Crear rama** de desarrollo: `feature/architecture-migration`
3. **Implementar Fase 1** (Fundamentos)
4. **Revisar progreso** después de cada fase
5. **Ajustar plan** según necesidades específicas

### Comandos para Iniciar

```bash
# Crear rama de desarrollo
git checkout -b feature/architecture-migration

# Crear estructura base
mkdir -p src/{domain,application,infrastructure,shared}/{entities,repositories,services,use-cases,viewmodels}

# Instalar dependencias de testing (si es necesario)
npm install --save-dev @testing-library/preact jest
```

---

**¿Estás listo para comenzar la migración? 🚀**

_Este documento será actualizado conforme avance la implementación._
