import { h } from 'preact';
import { useCalendarContext } from '@/context/CalendarContext.jsx';

/**
 * LoadingSpinner que se integra automáticamente con el estado del calendario
 * Se muestra cuando ui.loading es true y se oculta automáticamente cuando es false
 */
export const CalendarLoadingSpinner = ({
  message = 'Cargando...',
  forceHidden = false, // Para ocultar manualmente si es necesario
}) => {
  const { ui } = useCalendarContext();

  // No mostrar si está forzadamente oculto o si no está cargando
  if (forceHidden || !ui.loading) return null;

  return (
    <div className='modal-overlay'>
      <div className='modal-back'></div>
      <div className='modal-container'>
        <div className='spinner-text-wrapper'>
          <div className='dots-wrapper'>
            <div className='dot'></div>
            <div className='dot delay-1'></div>
            <div className='dot delay-2'></div>
          </div>
          <p className='spinner-text'>{message}</p>
        </div>
      </div>
    </div>
  );
};
