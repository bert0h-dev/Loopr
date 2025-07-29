import { h } from 'preact';
import { MonthDaysHeader } from '@/components/viewMonth/MonthDaysHeader.jsx';
import { MonthDays } from '@/components/viewMonth/MonthDays.jsx';
import { useCalendarMonth } from '@/hooks/useCalendarMonth.js';
import { useCalendarDate } from '@/hooks/useCalendarDate.js';
import { useCalendarConfig } from '@/hooks/useCalendarConfig.js';

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
  // Usa la fecha del contexto y tambien toma la configuracion para obtener el el inicio de la semana
  const { currentDate } = useCalendarDate();
  const { config } = useCalendarConfig();

  // Se usa la fecha del contexto si no se propociona una fecha especifica
  const monthDate = date || currentDate;

  // Se obtiene la informacion de los dias del mes
  const monthCalendarDays = useCalendarMonth(monthDate, config.firstDayOfWeek);

  return (
    <div className='month-view'>
      <MonthDaysHeader weekDay={config.firstDayOfWeek} />
      <MonthDays monthCalendarDays={monthCalendarDays} />
    </div>
  );
};
