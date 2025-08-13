# 🔧 Variables de Entorno - Loopr

## 📋 Configuración

Las variables de entorno permiten configurar la aplicación sin cambiar el código. Todas las variables de configuración usan el prefijo `VITE_`.

### 🚀 Configuración Inicial

1. **Copia el archivo de ejemplo:**

   ```bash
   cp .env.example .env.local
   ```

2. **Edita `.env.local`** con tus valores específicos

3. **Reinicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

## 📚 Variables Disponibles

### 🏗️ Configuración de la App

| Variable           | Tipo    | Default   | Descripción              |
| ------------------ | ------- | --------- | ------------------------ |
| `VITE_APP_NAME`    | string  | `"Loopr"` | Nombre de la aplicación  |
| `VITE_APP_VERSION` | string  | `"1.0.3"` | Versión de la aplicación |
| `VITE_APP_DEBUG`   | boolean | `false`   | Habilita modo debug      |

### 🌐 Configuración de API

| Variable           | Tipo   | Default                   | Descripción               |
| ------------------ | ------ | ------------------------- | ------------------------- |
| `VITE_API_URL`     | string | `"http://localhost:3001"` | URL base de la API        |
| `VITE_API_TIMEOUT` | number | `5000`                    | Timeout de requests en ms |

### 📅 Configuración del Calendario

| Variable                  | Tipo    | Default   | Descripción                                |
| ------------------------- | ------- | --------- | ------------------------------------------ |
| `VITE_DEFAULT_VIEW`       | string  | `"month"` | Vista por defecto (`month`, `week`, `day`) |
| `VITE_ENABLE_TIME_SLOTS`  | boolean | `true`    | Habilita slots de tiempo                   |
| `VITE_MAX_EVENTS_PER_DAY` | number  | `10`      | Máximo eventos por día                     |

### 🎛️ Feature Flags

| Variable                    | Tipo    | Default | Descripción                |
| --------------------------- | ------- | ------- | -------------------------- |
| `VITE_ENABLE_ANALYTICS`     | boolean | `false` | Habilita analytics         |
| `VITE_ENABLE_NOTIFICATIONS` | boolean | `true`  | Habilita notificaciones    |
| `VITE_ENABLE_THEMES`        | boolean | `true`  | Habilita sistema de themes |

### 🛠️ Configuración de Desarrollo

| Variable                 | Tipo    | Default       | Descripción                       |
| ------------------------ | ------- | ------------- | --------------------------------- |
| `VITE_DEV_PORT`          | number  | `3000`        | Puerto del servidor de desarrollo |
| `VITE_DEV_HOST`          | string  | `"localhost"` | Host del servidor de desarrollo   |
| `VITE_ENABLE_SOURCEMAPS` | boolean | `true`        | Habilita source maps              |

### 📦 Configuración de Build

| Variable             | Tipo    | Default | Descripción                |
| -------------------- | ------- | ------- | -------------------------- |
| `VITE_BUILD_ANALYZE` | boolean | `false` | Genera análisis del bundle |
| `VITE_BUILD_MINIFY`  | boolean | `true`  | Minifica el código         |

## 🛠️ Uso en el Código

### Método 1: Acceso directo

```javascript
// Acceso directo a variables de entorno
const apiUrl = process.env.VITE_API_URL;
const debug = process.env.VITE_APP_DEBUG === 'true';
```

### Método 2: Usando utilidades (Recomendado)

```javascript
import { appConfig } from '@/utils/env.js';

// Configuración tipada y con valores por defecto
const apiUrl = appConfig.api.url;
const debug = appConfig.debug;
```

### Método 3: Usando funciones utilitarias

```javascript
import { getEnvString, getEnvBoolean, getEnvNumber } from '@/utils/env.js';

const apiUrl = getEnvString('VITE_API_URL', 'http://localhost:3001');
const debug = getEnvBoolean('VITE_APP_DEBUG', false);
const timeout = getEnvNumber('VITE_API_TIMEOUT', 5000);
```

## 🔍 Comandos Útiles

### Verificar variables de entorno

```bash
npm run env:check
```

### Build con análisis

```bash
npm run build:analyze
```

### Desarrollo con debug habilitado

```bash
VITE_APP_DEBUG=true npm run dev
```

## 🌍 Configuración por Entorno

### Desarrollo Local

```bash
# .env.local
NODE_ENV=development
VITE_APP_DEBUG=true
VITE_API_URL=http://localhost:3001
VITE_ENABLE_SOURCEMAPS=true
```

### Staging

```bash
# .env.staging
NODE_ENV=production
VITE_APP_DEBUG=false
VITE_API_URL=https://api-staging.loopr.com
VITE_ENABLE_ANALYTICS=true
```

### Producción

```bash
# .env.production
NODE_ENV=production
VITE_APP_DEBUG=false
VITE_API_URL=https://api.loopr.com
VITE_ENABLE_ANALYTICS=true
VITE_BUILD_MINIFY=true
```

## 🔒 Seguridad

### ✅ Variables Públicas (Prefijo VITE\_)

- Se incluyen en el bundle final
- Visibles en el cliente
- Usar para configuración no sensible

### ❌ Variables Privadas (Sin prefijo VITE\_)

- Solo disponibles en build time
- No se incluyen en el bundle
- Usar para keys de API, secrets, etc.

## 🐛 Troubleshooting

### Problema: Variable no se actualiza

**Solución:** Reinicia el servidor de desarrollo:

```bash
npm run dev
```

### Problema: Variable undefined

**Verificaciones:**

1. ¿Tiene el prefijo `VITE_`?
2. ¿Está en `.env.local` o `.env.example`?
3. ¿Reiniciaste el servidor?

### Problema: Valor incorrecto

**Debug:**

```bash
npm run env:check
```

## 💡 Mejores Prácticas

1. **Usar prefijo VITE\_** para variables públicas
2. **Valores por defecto** siempre en el código
3. **Documentar** nuevas variables en este README
4. **No committear** archivos `.env.local`
5. **Validar** variables críticas al inicio
6. **Usar utilidades** en lugar de acceso directo
