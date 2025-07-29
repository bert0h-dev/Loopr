import { h } from 'preact';
import { useCalendarConfig } from '@/hooks/useCalendarConfig.js';
import { ToolbarSection } from '@/components/viewHeader/ToolbarSection.jsx';

/**
 * @name ToolBar
 * @summary
 * Componente de la barra de herramientas del calendario.
 * Muestra los controles de navegación y acciones del calendario.
 *
 * @returns {JSX.Element} Elemento JSX que representa la barra de herramientas del calendario
 */
export const ToolBar = () => {
  // Hook del contexto
  const { config } = useCalendarConfig();
  let startContent = config.viewToolbar.start;
  let centerContent = config.viewToolbar.center;
  let endContent = config.viewToolbar.end;

  // Funcion para renderizar cada una de las secciones de la barra de herramientas
  const renderToolbarSection = (key, section) => {
    return <ToolbarSection key={key} section={section} />;
  };

  return (
    <div className='toolbar header-toolbar'>
      {renderToolbarSection('start', startContent || [])}
      {renderToolbarSection('center', centerContent || [])}
      {renderToolbarSection('end', endContent || [])}
    </div>
  );
};
