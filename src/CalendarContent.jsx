import { h } from 'preact';
import { CalendarHeader } from '@/components/common/CalendarHeader.jsx';
import { CalendarViews } from '@/components/common/CalendarViews.jsx';
import { usePerformanceMonitor } from '@/hooks/usePerformance.js';

export const CalendarContent = () => {
  // Monitorear rendimiento del componente principal
  usePerformanceMonitor('CalendarContent');

  return (
    <div className='container'>
      <div className='calendar'>
        <CalendarHeader />
        <CalendarViews />
      </div>
    </div>
  );
};
