import { h } from 'preact';
import { useCalendarContext } from '@/context/CalendarContext.jsx';
import { createLazyComponent, LoadingSpinner } from '@/utils/lazyComponent.js';

// Crear componentes lazy para cada vista
const LazyMonthView = createLazyComponent(
  () =>
    import('@/components/views/MonthView.jsx').then(module => ({
      default: module.MonthView,
    })),
  <LoadingSpinner />
);

const LazyWeekView = createLazyComponent(
  () =>
    import('@/components/views/WeekView.jsx').then(module => ({
      default: module.WeekView,
    })),
  <div className='loading-spinner'>
    <div className='spinner'></div>
    <span>Cargando vista semanal...</span>
  </div>
);

const LazyDayView = createLazyComponent(
  () =>
    import('@/components/views/DayView.jsx').then(module => ({
      default: module.DayView,
    })),
  <div className='loading-spinner'>
    <div className='spinner'></div>
    <span>Cargando vista diaria...</span>
  </div>
);

const LazyAgendaView = createLazyComponent(
  () =>
    import('@/components/views/AgendaView.jsx').then(module => ({
      default: module.AgendaView,
    })),
  <div className='loading-spinner'>
    <div className='spinner'></div>
    <span>Cargando agenda...</span>
  </div>
);

const LazyYearView = createLazyComponent(
  () =>
    import('@/components/views/YearView.jsx').then(module => ({
      default: module.YearView,
    })),
  <div className='loading-spinner'>
    <div className='spinner'></div>
    <span>Cargando vista anual...</span>
  </div>
);

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
      return <LazyMonthView date={currentDate} />;
    case 'week':
      return <LazyWeekView date={currentDate} />;
    case 'day':
      return <LazyDayView date={currentDate} />;
    case 'agenda':
      return <LazyAgendaView date={currentDate} />;
    case 'year':
      return <LazyYearView date={currentDate} />;
    default:
      return (
        <div className='calendar-view'>Vista no implementada: {activeView}</div>
      );
  }
};
