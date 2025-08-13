# 🔧 Mejoras en Resolución de Módulos - Loopr

## 🎯 Objetivos Implementados

Esta actualización mejora significativamente la capacidad de resolución de módulos de Rollup, haciendo el desarrollo más eficiente y el código más mantenible.

## ✨ Nuevas Características

### 1. **Alias Avanzados**

#### 🎯 **Alias Principales**

```javascript
// Antes (solo básico)
import { something } from '../../../utils/env.js';

// Ahora (alias múltiples)
import { something } from '@/utils/env.js'; // Raíz del proyecto
import { Hook } from '@/hooks/useCalendar.js'; // Hooks específicos
import { CONSTANTS } from '@/constants/calendar.js'; // Constantes
import { styles } from '@/styles/index.css'; // Estilos
```

#### 📁 **Estructura de Alias**

```
@/              → src/
@/components/   → src/components/
@/utils/        → src/utils/
@/hooks/        → src/hooks/
@/constants/    → src/constants/
@/styles/       → src/css/
@/assets/       → src/assets/
@/context/      → src/context/
@/types/        → src/types/
~               → src/ (alias alternativo)
```

### 2. **Extensiones Soportadas**

#### 📄 **Orden de Prioridad**

```javascript
extensions: [
  '.mjs', // ES modules nativos
  '.js', // JavaScript estándar
  '.jsx', // JSX React/Preact
  '.ts', // TypeScript (preparado)
  '.tsx', // TypeScript JSX (preparado)
  '.json', // Archivos JSON
  '.css', // Hojas de estilo
  '.scss', // SASS
  '.sass', // SASS (sintaxis indentada)
  '.less', // LESS
  '.styl', // Stylus
];
```

#### 💡 **Ejemplos de Uso**

```javascript
// Sin extensión - se resuelve automáticamente
import { useCalendar } from '@/hooks/useCalendar'; // → .js
import config from '@/config/app'; // → .json
import styles from '@/styles/calendar'; // → .css

// Con extensión específica
import { CONSTANTS } from '@/constants/calendar.js';
import appData from '@/config/app.json';
```

### 3. **Compatibilidad React/Preact**

#### 🔄 **Alias Automáticos**

```javascript
// Automáticamente traduce React a Preact
import React from 'react'; // → preact/compat
import { render } from 'react-dom'; // → preact/compat
import { Fragment } from 'react'; // → preact/compat
```

#### ⚡ **Beneficios**

- ✅ Migración más fácil desde React
- ✅ Compatibilidad con librerías de React
- ✅ Bundle size optimizado con Preact

### 4. **Importación de Assets**

#### 🖼️ **Imágenes y Recursos**

```javascript
// Plugin @rollup/plugin-url maneja automáticamente
import logo from '@/assets/logo.png'; // Base64 si < 8KB
import icon from '@/assets/icon.svg'; // URL si > 8KB
import font from '@/assets/fonts/custom.woff2'; // URL optimizada

// Uso en componentes
const Logo = () => <img src={logo} alt='Loopr' />;
```

#### 📁 **Tipos Soportados**

- **Imágenes**: PNG, JPG, JPEG, GIF, SVG, WebP, AVIF
- **Fuentes**: WOFF, WOFF2, TTF, EOT
- **Límite Base64**: 8KB (configurable)

### 5. **Importación de JSON**

#### 📋 **Uso Directo**

```javascript
// Importación directa de configuración
import appConfig from '@/config/app.json';
import { eventTypes } from '@/config/app.json';

// Uso en código
console.log(appConfig.app.name); // "Loopr Calendar"
console.log(appConfig.eventTypes[0].name); // "Personal"
```

#### 🔧 **Configuración Optimizada**

- ✅ Tree shaking habilitado
- ✅ Named exports disponibles
- ✅ Compresión en producción

### 6. **Resolución Mejorada**

#### 🎯 **Configuración Avanzada**

```javascript
// Múltiples estrategias de resolución
moduleDirectories: ['node_modules', 'src'];
mainFields: ['browser', 'module', 'jsnext:main', 'main'];
exportConditions: ['browser', 'import', 'module', 'default'];
```

#### 💡 **Beneficios**

- ✅ Mejor compatibilidad con librerías
- ✅ Resolución más inteligente
- ✅ Soporte para ES modules modernos

## 🛠️ Plugins Agregados

### 📦 **Nuevas Dependencias**

```json
{
  "@rollup/plugin-json": "Importación de JSON",
  "@rollup/plugin-url": "Manejo de assets/URLs",
  "@rollup/plugin-image": "Optimización de imágenes"
}
```

### ⚙️ **Configuración**

```javascript
// JSON con optimizaciones
json({
  compact: isProduction, // Compresión en producción
  namedExports: true, // Named exports habilitados
  preferConst: true, // Usar const en lugar de var
});

// URLs con límites inteligentes
url({
  limit: 8192, // 8KB límite para base64
  fileName: 'assets/[name][extname]',
  publicPath: './',
});

// Imágenes optimizadas
image({
  include: ['**/*.png', '**/*.jpg', '**/*.svg'],
  exclude: ['node_modules/**'],
});
```

## 🎨 Ejemplos Prácticos

### 1. **Hook Personalizado**

```javascript
// src/hooks/useCalendar.js
import { useState, useEffect } from 'preact/hooks';
import { appConfig } from '@/utils/env.js';

export const useCalendar = config => {
  // Hook con configuración avanzada
  // Usar alias @/utils/ para imports limpios
};
```

### 2. **Constantes Organizadas**

```javascript
// src/constants/calendar.js
import { appConfig } from '@/utils/env.js';

export const CALENDAR_VIEWS = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
};

// Configuración dinámica basada en env vars
export const TIME_CONFIG = {
  MAX_EVENTS: appConfig.calendar.maxEventsPerDay,
};
```

### 3. **Configuración JSON**

```javascript
// src/config/index.js
import appData from '@/config/app.json';
import { appConfig } from '@/utils/env.js';

// Fusión de configuración JSON + env vars
export const appConfiguration = {
  ...appData.app,
  name: appConfig.name || appData.app.name,
  features: {
    ...appData.features,
    analytics: appConfig.features.analytics,
  },
};
```

## 🎯 Beneficios Obtenidos

### ✅ **Developer Experience**

- 🚀 **Imports más limpios** - Sin `../../../`
- 🎯 **Autocompletado mejorado** - IDEs entienden los alias
- 🔍 **Debugging más fácil** - Paths claros en stack traces
- ⚡ **Refactoring seguro** - Cambios de estructura más fáciles

### ✅ **Mantenibilidad**

- 📁 **Organización clara** - Cada tipo de archivo en su alias
- 🔄 **Escalabilidad** - Fácil agregar nuevos módulos
- 🎭 **Consistencia** - Patrones de import uniformes
- 📚 **Documentación** - Estructura autodocumentada

### ✅ **Performance**

- 📦 **Tree shaking mejorado** - Eliminación de código muerto
- 🗜️ **Compresión automática** - Assets optimizados
- ⚡ **Resolución más rápida** - Menos búsquedas de archivos
- 🎯 **Bundle splitting** - Preparado para code splitting

### ✅ **Compatibilidad**

- 🔄 **React → Preact** - Migración transparente
- 📱 **Multi-formato** - ESM + CJS support
- 🌐 **Cross-platform** - Funciona en cualquier entorno
- 🔮 **Future-proof** - Preparado para TypeScript

## 📊 Comparación Antes/Después

### 🔴 **Antes**

```javascript
// Imports verbosos
import { appConfig } from '../../../utils/env.js';
import { CalendarApp } from '../../components/CalendarApp.jsx';
import { useCalendar } from '../../../hooks/useCalendar.js';

// Sin soporte para JSON
const config = require('./config.json'); // ❌ No funciona

// Sin optimización de assets
import logo from './assets/logo.png'; // ❌ Siempre como URL
```

### 🟢 **Después**

```javascript
// Imports limpios
import { appConfig } from '@/utils/env.js';
import { CalendarApp } from '@/components/CalendarApp.jsx';
import { useCalendar } from '@/hooks/useCalendar.js';

// JSON nativo
import config from '@/config/app.json'; // ✅ Funciona perfectamente

// Assets optimizados
import logo from '@/assets/logo.png'; // ✅ Base64 si es pequeño
```

## 🚀 Próximos Pasos

Con esta base sólida de resolución de módulos, ahora podemos implementar:

1. 🎨 **CSS Modules** - Estilos con scope automático
2. 📘 **TypeScript** - Migración gradual y opcional
3. ⚡ **Code Splitting** - Chunks dinámicos por rutas
4. 🔄 **Hot Module Replacement** - Recarga instantánea
5. 📦 **Bundle Analyzer** - Visualización avanzada

## 🎯 Configuración Recomendada

### **Para nuevos archivos:**

```javascript
// Usar siempre alias para imports internos
import {} from '@/path/to/module';

// Extensiones opcionales para archivos del proyecto
import component from '@/components/Button'; // → Button.jsx
import styles from '@/styles/button'; // → button.css
import config from '@/config/feature'; // → feature.json
```

### **Para organización:**

```
src/
├── components/     → @/components/
├── hooks/         → @/hooks/
├── utils/         → @/utils/
├── constants/     → @/constants/
├── context/       → @/context/
├── css/           → @/styles/
├── assets/        → @/assets/
└── config/        → @/config/
```

¡Tu sistema de resolución de módulos ahora es de nivel profesional! 🎉
