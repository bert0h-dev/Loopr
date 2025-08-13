import { h } from 'preact';
import { CalendarContent } from '@/CalendarContent.jsx';
import { CalendarProvider } from '@/context/CalendarContext.jsx';
import { CalendarLoadingSpinner } from '@/presentation/components/modals/CalendarLoadingSpinner.jsx';

/**
 * @name CalendarApp
 * @summary
 * Componente principal de la aplicación de calendario
 * Maneja el estado global del calendario y coordina los componentes hijos
 *
 * @returns {JSX.Element} Elemento JSX que representa la aplicación completa del calendario
 */
export const CalendarApp = ({ config = {}, events = [] }) => {
  return (
    <CalendarProvider initialConfig={config} initialEvents={events}>
      <CalendarContent />
      <CalendarLoadingSpinner />
    </CalendarProvider>
  );
};
