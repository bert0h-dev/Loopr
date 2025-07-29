import { h } from 'preact';
import { MonthDaysHeader } from '@/components/viewMonth/MonthDaysHeader.jsx';
import { MonthDays } from '@/components/viewMonth/MonthDays.jsx';
import { useCalendarMonth } from '@/hooks/useCalendarMonth.js';
import { useCalendarContext } from '@/context/CalendarContext.jsx';

/**
 * @name MonthView
 * @summary
 * Componente que renderiza la vista mensual del calendario
 * Usa Context API para acceder al estado global del calendario
 *
 * @param {Object} props - Propiedades del componente
 * @param {Date} props.date - Fecha que determina el mes a mostrar
 *
 * @returns {JSX.Element} Elemento JSX que representa la vista mensual
 */
export const MonthView = ({ date }) => {
  // Acceso unificado al contexto del calendario
  const { currentDate, config } = useCalendarContext();

  // Se usa la fecha del contexto si no se proporciona una fecha específica
  const monthDate = date || currentDate;

  // Se obtiene la información de los días del mes
  const monthCalendarDays = useCalendarMonth(monthDate, config.firstDayOfWeek);

  return (
    <div className='month-view'>
      <MonthDaysHeader weekDay={config.firstDayOfWeek} />
      <MonthDays monthCalendarDays={monthCalendarDays} />
    </div>
  );
};
