import { h } from 'preact';
import { MonthView } from '@/components/views/MonthView.jsx';
import { useCalendarContext } from '@/context/CalendarContext.jsx';

/**
 * @name CalendarViews
 * @summary
 * Componente que renderiza la vista activa del calendario
 * Utiliza el Context para determinar qué vista mostrar
 *
 * @returns {JSX.Element} Vista activa del calendario
 */
export const CalendarViews = () => {
  // Acceso directo al contexto unificado
  const { activeView, currentDate } = useCalendarContext();

  switch (activeView) {
    case 'month':
      return <MonthView date={currentDate} />;
    case 'week':
      return (
        <div className='calendar-view week-view'>
          Vista semanal - En desarrollo
        </div>
      );
    case 'day':
      return (
        <div className='calendar-view day-view'>
          Vista diaria - En desarrollo
        </div>
      );
    case 'agenda':
      return (
        <div className='calendar-view agenda-view'>
          Vista agenda - En desarrollo
        </div>
      );
    case 'year':
      return (
        <div className='calendar-view year-view'>
          Vista anual - En desarrollo
        </div>
      );
    default:
      return (
        <div className='calendar-view'>Vista no implementada: {activeView}</div>
      );
  }
};
