import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';

/**
 * @name ThemeSwitcher
 * @summary
 * Componente para cambiar entre temas claro/oscuro del sistema Loopr
 *
 * @return {JSX.Element} Componente del selector de tema
 */
export const ThemeSwitcher = () => {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Detectar tema inicial
  useEffect(() => {
    // Verificar si hay un tema guardado en localStorage
    const savedTheme = localStorage.getItem('loopr-theme');

    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      // Detectar preferencia del sistema
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      const systemTheme = prefersDark ? 'dark' : 'light';
      setTheme(systemTheme);
      document.documentElement.setAttribute('data-theme', systemTheme);
    }

    setMounted(true);
  }, []);

  // Escuchar cambios en las preferencias del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = e => {
      // Solo aplicar cambio automático si no hay tema guardado
      if (!localStorage.getItem('loopr-theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = event => {
      if (!event.target.closest('.dropdown')) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDropdown]);

  const handleThemeChange = newTheme => {
    // Agregar clase de transición suave
    document.documentElement.classList.add('theme-transition');

    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('loopr-theme', newTheme);
    setShowDropdown(false);

    // Remover clase de transición después de la animación
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 300);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    handleThemeChange(newTheme);
  };

  const resetToSystem = () => {
    localStorage.removeItem('loopr-theme');
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    const systemTheme = prefersDark ? 'dark' : 'light';
    handleThemeChange(systemTheme);
  };

  // No renderizar hasta que esté montado para evitar hydration mismatch
  if (!mounted) {
    return <div className='w-8 h-8'></div>;
  }

  const themes = [
    {
      id: 'light',
      name: 'Claro',
      icon: '☀️',
      description: 'Tema claro para uso diurno',
    },
    {
      id: 'dark',
      name: 'Oscuro',
      icon: '🌙',
      description: 'Tema oscuro para uso nocturno',
    },
    {
      id: 'light-high-contrast',
      name: 'Alto Contraste Claro',
      icon: '🔆',
      description: 'Tema claro con alto contraste para accesibilidad',
    },
    {
      id: 'dark-high-contrast',
      name: 'Alto Contraste Oscuro',
      icon: '🌚',
      description: 'Tema oscuro con alto contraste para accesibilidad',
    },
  ];

  return (
    <div className='theme-switcher'>
      {/* Botón de toggle rápido */}
      <div className='flex items-center gap-2 mb-3'>
        <button
          onClick={toggleTheme}
          className='btn btn-outline flex items-center gap-2 transition'
          title={`Cambiar a tema ${theme === 'light' ? 'oscuro' : 'claro'}`}
        >
          <span className='text-lg' role='img' aria-label={`Tema ${theme}`}>
            {theme === 'light' ? '☀️' : '🌙'}
          </span>
          <span className='hidden sm:inline'>
            {theme === 'light' ? 'Claro' : 'Oscuro'}
          </span>
        </button>

        <button
          onClick={resetToSystem}
          className='btn btn-ghost text-xs'
          title='Usar preferencia del sistema'
        >
          🔄 Auto
        </button>
      </div>

      {/* Selector detallado */}
      <div className='dropdown relative'>
        <button
          className='btn btn-secondary text-sm'
          onClick={() => setShowDropdown(!showDropdown)}
        >
          🎨 Más opciones
        </button>

        <div
          className={`dropdown-menu absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-lg z-50 min-w-64 ${showDropdown ? 'block' : 'hidden'}`}
        >
          <div className='p-2'>
            <h4 className='font-semibold text-sm mb-2 text-primary'>
              Seleccionar Tema
            </h4>

            {themes.map(themeOption => (
              <button
                key={themeOption.id}
                onClick={() => handleThemeChange(themeOption.id)}
                className={`dropdown-item flex items-center gap-3 w-full p-2 rounded hover:bg-gray-100 ${
                  theme === themeOption.id ? 'bg-primary text-white' : ''
                }`}
                title={themeOption.description}
              >
                <span className='text-lg' role='img'>
                  {themeOption.icon}
                </span>
                <div className='flex-1 text-left'>
                  <div className='font-medium'>{themeOption.name}</div>
                  <div className='text-xs opacity-75'>
                    {themeOption.description}
                  </div>
                </div>
                {theme === themeOption.id && <span className='text-sm'>✓</span>}
              </button>
            ))}

            <div className='border-t my-2'></div>

            <button
              onClick={resetToSystem}
              className='dropdown-item flex items-center gap-3 w-full p-2 rounded hover:bg-gray-100 text-secondary'
            >
              <span className='text-lg'>🔄</span>
              <div className='flex-1 text-left'>
                <div className='font-medium'>Automático</div>
                <div className='text-xs opacity-75'>
                  Usar preferencia del sistema
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Indicador de tema actual */}
      <div className='mt-2 text-xs text-muted'>
        Tema actual:{' '}
        <span className='font-medium'>
          {themes.find(t => t.id === theme)?.name || theme}
        </span>
      </div>
    </div>
  );
};
