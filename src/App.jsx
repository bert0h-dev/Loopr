import { h } from 'preact';
import { CalendarApp } from '@/CalendarApp.jsx';
import { appConfig, getEnvString } from '@/utils/env.js';
import {
  ToastProvider,
  DEFAULT_TOAST_CONFIG,
} from '@/contexts/ToastContext.jsx';

/**
 * @name App
 * @summary
 * Componente principal con sistema de notificaciones visuales.
 *
 * @return {JSX.Element} Componente principal.
 */
export const App = () => {
  // Configuracion inicial del calendario usando variables de entorno
  const initialConfig = {
    locale: 'es-MX',
    defaultView: appConfig.calendar.defaultView,
    enableTimeSlots: appConfig.calendar.enableTimeSlots,
    maxEventsPerDay: appConfig.calendar.maxEventsPerDay,
    debug: appConfig.debug,
  };

  // Configuración del sistema de toast
  const toastConfig = {
    ...DEFAULT_TOAST_CONFIG,
    position: 'top-right',
    duration: 4000,
    maxToasts: 3,
  };

  return (
    <ToastProvider config={toastConfig}>
      <div className='app'>
        {appConfig.debug && (
          <div className='debug-bar bg-secondary text-sm p-2 border-b border-secondary flex items-center gap-2'>
            <span className='text-primary font-medium'>🔧</span>
            <span className='text-secondary'>
              {appConfig.name} v{appConfig.version} -{' '}
              {getEnvString('NODE_ENV', 'development')}
            </span>
          </div>
        )}
        <CalendarApp config={initialConfig} />
      </div>
    </ToastProvider>
  );
};
