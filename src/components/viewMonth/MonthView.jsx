import { h } from 'preact';
import { MonthDaysHeader } from '@/components/viewMonth/MonthDaysHeader.jsx';
import { MonthDays } from '@/components/viewMonth/MonthDays.jsx';
import { useCalendarMonth } from '@/hooks/useCalendarMonth';

/**
 * @name MonthView
 * @summary
 * Componente que renderiza la vista mensual del calendario
 *
 * @param {Object} props - Propiedades del componente
 * @param {Date} props.date - Fecha que determina el mes a mostrar
 *
 * @returns {JSX.Element} Elemento JSX que representa la vista mensual
 */
export const MonthView = ({ date }) => {
  // useCalendarMonth ya usa useMemo internamente, no necesitamos useState + useEffect
  const monthCalendarDays = useCalendarMonth(date);

  return (
    <div className='month-view'>
      <MonthDaysHeader weekDay={0} />
      <MonthDays monthCalendarDays={monthCalendarDays} />
    </div>
  );
};
