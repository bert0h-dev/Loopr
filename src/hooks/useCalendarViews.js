import { useCalendarContext } from '@/context/CalendarContext.jsx';
import { useMemo } from 'preact/hooks';

/**
 * @name useCalendarViews
 * @summary
 * Hook especializado para manejar las vistas del calendario
 *
 * @returns {Object} Vista activa y métodos para cambiarla
 */
export const useCalendarViews = () => {
  const { activeView, setActiveView } = useCalendarContext();

  const viewActions = useMemo(
    () => ({
      // Cambio de vista
      showMonthView: () => setActiveView('month'),
      showWeekView: () => setActiveView('week'),
      showDayView: () => setActiveView('day'),
      showAgendaView: () => setActiveView('agenda'),

      // Utilidades
      isMonthView: activeView === 'month',
      isWeekView: activeView === 'week',
      isDayView: activeView === 'day',
      isAgendaView: activeView === 'agenda',

      setActiveView,
    }),
    [activeView, setActiveView]
  );

  return { activeView, ...viewActions };
};
