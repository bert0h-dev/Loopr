import { h } from 'preact';
import { MonthView } from '@/components/views/MonthView.jsx';
import { useCalendarViews } from '@/hooks/useCalendarViews.js';
import { useCalendarDate } from '@/hooks/useCalendarDate.js';

/**
 * @name CalendarViews
 * @summary
 * Componente que renderiza la vista activa del calendario
 * Utiliza el Context para determinar qué vista mostrar
 *
 * @returns {JSX.Element} Vista activa del calendario
 */
export const CalendarViews = () => {
  const { activeView } = useCalendarViews();
  const { currentDate } = useCalendarDate();

  switch (activeView) {
    case 'month':
      return <MonthView date={currentDate} />;
    default:
      return <div className='calendar-view'>Vista no implementada</div>;
  }
};
