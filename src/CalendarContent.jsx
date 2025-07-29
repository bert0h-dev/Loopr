import { h } from 'preact';
import { CalendarHeader } from '@/components/common/CalendarHeader.jsx';
import { CalendarViews } from '@/components/common/CalendarViews.jsx';

export const CalendarContent = () => {
  return (
    <div className='container'>
      <div className='calendar'>
        <CalendarHeader />
        <CalendarViews />
      </div>
    </div>
  );
};
