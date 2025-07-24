# 📅 Loopr

Un motor de calendario ligero y extensible construido con **Preact**, que permite renderizar vistas y eventos de forma dinámica con un diseño modular y rendimiento optimizado.

## 🚀 Características

- **🪶 Ligero**: Construido con Preact para un bundle mínimo
- **🔧 Extensible**: Arquitectura modular que permite fácil personalización
- **🌍 Internacionalización**: Soporte completo para diferentes idiomas y regiones
- **📱 Responsivo**: Diseño adaptable para diferentes dispositivos
- **⚡ Performante**: Optimizado con hooks y memoización para evitar re-renderizados innecesarios
- **🎨 Personalizable**: Sistema de estilos CSS modular y flexible

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Modo desarrollo con hot reload
npm run dev

# Compilar para producción
npm run build

# Formatear código
npm run format:write

# Linting
npm run lint:fix
```

## 🛠️ Uso Básico

```javascript
import { h, render } from 'preact';
import { CalendarApp } from 'loopr';

// Renderizar el calendario
render(<CalendarApp />, document.getElementById('app'));
```

## 📋 API del Controlador

El hook `useCalendarController` proporciona métodos para controlar la navegación del calendario:

```javascript
import { useCalendarController } from 'loopr';

const [currentDate, controller] = useCalendarController();

// Métodos disponibles
controller.nextMonth(); // Navegar al siguiente mes
controller.prevMonth(); // Navegar al mes anterior
controller.nextYear(); // Navegar al siguiente año
controller.prevYear(); // Navegar al año anterior
controller.goToToday(); // Ir a la fecha actual
controller.setDate(date); // Establecer fecha específica
controller.getDate(); // Obtener fecha actual

// Sistema de suscripción para cambios de fecha
const unsubscribe = controller.subscribe(newDate => {
  console.log('Fecha cambiada:', newDate);
});
```

## 🏗️ Arquitectura del Proyecto

```
src/
├── CalendarApp.jsx          # Componente principal
├── main.js                  # Punto de entrada
├── index.html              # Template HTML
├── components/
│   ├── common/
│   │   └── CalendarHeader.jsx    # Header con navegación
│   └── viewMonth/
│       ├── MonthView.jsx         # Vista mensual
│       ├── MonthDays.jsx         # Grilla de días
│       └── MonthDaysHeader.jsx   # Header de días de semana
├── hooks/
│   ├── useCalendarController.js  # Controlador principal
│   └── useCalendarMonth.js       # Lógica vista mensual
├── utils/
│   └── dateUtils.js             # Utilidades de fecha
└── css/
    ├── index.css               # Estilos principales
    ├── container.css           # Estilos del contenedor
    └── components/             # Estilos de componentes
```

## 🎨 Personalización de Estilos

Loopr utiliza un sistema de CSS modular. Puedes personalizar los estilos modificando:

- `container.css` - Estilos del contenedor principal
- `components/header.css` - Estilos del header de navegación
- `components/month.css` - Estilos de la vista mensual

## 🌍 Internacionalización

El calendario soporta diferentes idiomas y configuraciones regionales:

```javascript
// Configurar primer día de la semana
const dias = getWeekDays(1, 'es-ES'); // Empezar en lunes, español de España

// Soporte para diferentes locales
useCalendarMonth(date, weekDay, 'en-US'); // Inglés estadounidense
useCalendarMonth(date, weekDay, 'es-MX'); // Español de México
```

## 🔧 Configuración de Desarrollo

El proyecto utiliza:

- **Rollup** para bundling con configuración ESM y CommonJS
- **Babel** para transpilación de JSX
- **PostCSS** para procesamiento de CSS
- **ESLint + Prettier** para calidad de código
- **Livereload** para desarrollo con hot reload

### Scripts Disponibles

- `npm run dev` - Servidor de desarrollo con hot reload
- `npm run build` - Build de producción optimizado
- `npm run clean` - Limpiar directorio dist
- `npm run lint` - Verificar código con ESLint
- `npm run format:check` - Verificar formato con Prettier

## 📊 Sistema de Hooks

### `useCalendarController(defaultDate)`

Hook principal para controlar el estado del calendario con sistema de suscripción.

### `useCalendarMonth(currentDate, weekDay, locale)`

Hook optimizado que calcula todos los días visibles en la vista mensual, incluyendo días de meses adyacentes para completar las semanas.

### `getWeekDays(weekDay, locale)`

Utilidad para obtener nombres localizados de días de la semana con diferentes formatos.

## 🏷️ Características Técnicas

- **Bundle Size**: ~15KB minificado (con Preact)
- **Compatibilidad**: Navegadores modernos con soporte ES6+
- **Dependencias**: Solo Preact como dependencia de runtime
- **Rendimiento**: Memoización extensiva para evitar re-cálculos
- **Accesibilidad**: Controles navegables por teclado y ARIA labels

## 📄 Licencia

ISC License - Ver [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**Bert0h-dev** (humberto.morales.14@hotmail.com)

## 🐛 Reportar Issues

Si encuentras algún problema o tienes sugerencias, por favor [crea un issue](https://github.com/bert0h-dev/Loopr/issues) en GitHub.

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

**Loopr** - Un calendario moderno, ligero y extensible para aplicaciones web 🚀
