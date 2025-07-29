import { h } from 'preact';
import { CalendarApp } from '@/CalendarApp.jsx';

/**
 * @name App
 * @summary
 * Componente principal.
 *
 * @return {JSX.Element} Componente principal.
 */
export const App = () => {
  // Configuracion inicial del calendario
  const initialConfig = {
    locale: 'es-MX',
  };

  return (
    <div className='app'>
      <CalendarApp config={initialConfig} />
    </div>
  );
};
