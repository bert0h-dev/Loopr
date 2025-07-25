import { h } from 'preact';
import { CalendarHeader } from '@/components/common/CalendarHeader.jsx';
import { MonthView } from '@/components/viewMonth/MonthView.jsx';
import { useCalendarController } from '@/hooks/useCalendarController';

/**
 * @name CalendarApp
 * @summary
 * Componente principal de la aplicación de calendario
 * Maneja el estado global del calendario y coordina los componentes hijos
 *
 * @returns {JSX.Element} Elemento JSX que representa la aplicación completa del calendario
 */
export const CalendarApp = () => {
  const [currentDate, calendarController] = useCalendarController();

  return (
    <div className='container mt-4'>
      <div className='calendar'>
        <CalendarHeader
          currentDate={currentDate}
          controller={calendarController}
        />
        <MonthView date={currentDate} />
      </div>
    </div>
  );
};
