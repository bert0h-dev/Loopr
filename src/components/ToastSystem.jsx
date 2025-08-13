/**
 * @fileoverview Componente Toast para notificaciones visuales
 * @description Toast con animaciones y múltiples tipos
 */

import { h, Fragment } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { TOAST_TYPES } from '../contexts/ToastContext.jsx';

/**
 * Formatea timestamp para mostrar
 */
function formatTimestamp(timestamp) {
  const now = new Date();
  const diff = now - timestamp;

  if (diff < 60000) {
    return 'Ahora';
  } else if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `Hace ${minutes}m`;
  } else if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `Hace ${hours}h`;
  } else {
    return timestamp.toLocaleDateString();
  }
}

/**
 * Componente individual de Toast
 */
export const Toast = ({ toast, onClose, config, position = 'top-right' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const progressRef = useRef();
  const timeoutRef = useRef();

  // Animación de entrada
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Control de auto-dismiss
  useEffect(() => {
    if (!config.autoDismiss || isPaused) return;

    const duration = config.duration || 5000;
    const interval = 100;
    let elapsed = 0;

    const updateProgress = () => {
      if (isPaused) return;

      elapsed += interval;
      const remaining = Math.max(0, duration - elapsed);
      const progressPercent = (remaining / duration) * 100;

      setProgress(progressPercent);

      if (remaining <= 0) {
        handleDismiss();
      }
    };

    timeoutRef.current = setInterval(updateProgress, interval);

    return () => {
      if (timeoutRef.current) {
        clearInterval(timeoutRef.current);
      }
    };
  }, [config.autoDismiss, config.duration, isPaused, toast.id]);

  // Función para manejar cierre
  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onClose(toast.id), 300);
  };

  // Función para pausar/reanudar
  const handleMouseEnter = () => {
    if (config.pauseOnHover) {
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (config.pauseOnHover) {
      setIsPaused(false);
    }
  };

  // Función para obtener clases CSS
  const getToastClasses = () => {
    const baseClass = 'toast';
    const visibleClass = isVisible ? 'toast--visible' : '';
    const typeClass = `toast--${toast.type}`;
    const positionClass = `toast--${position}`;

    return `${baseClass} ${typeClass} ${positionClass} ${visibleClass}`.trim();
  };

  return h(
    'div',
    {
      className: getToastClasses(),
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      role: 'alert',
      'aria-live': 'polite',
    },
    [
      // Contenido del toast
      h('div', { className: 'toast__content' }, [
        h('div', { className: 'toast__message' }, toast.message),
        toast.timestamp &&
          h(
            'div',
            { className: 'toast__timestamp' },
            formatTimestamp(toast.timestamp)
          ),
      ]),

      // Botón de cerrar
      h(
        'button',
        {
          onClick: handleDismiss,
          className: 'toast__close',
          'aria-label': 'Cerrar notificación',
        },
        '×'
      ),

      // Barra de progreso
      config.autoDismiss &&
        config.showProgress !== false &&
        h('div', {
          className: 'toast__progress',
          style: { width: `${progress}%` },
        }),
    ]
  );
};

/**
 * Contenedor de toasts
 */
export const ToastContainer = ({ toasts, onClose, config }) => {
  return h(
    'div',
    {
      className: `toast-container toast-container--${config.position}`,
    },
    toasts.map(toast =>
      h(Toast, {
        key: toast.id,
        toast: toast,
        onClose: onClose,
        config: config,
        position: config.position,
      })
    )
  );
};

/**
 * Componente principal que incluye estilos
 */
export const ToastSystem = ({ toasts, onClose, config }) => {
  return h(Fragment, null, [
    h(
      'style',
      { jsx: true },
      `
      .toast-container {
        position: fixed;
        z-index: 1000;
        pointer-events: none;
        max-width: 400px;
        width: 100%;
      }

      .toast-container--top-right {
        top: 1rem;
        right: 1rem;
      }

      .toast-container--top-left {
        top: 1rem;
        left: 1rem;
      }

      .toast-container--top-center {
        top: 1rem;
        left: 50%;
        transform: translateX(-50%);
      }

      .toast-container--bottom-right {
        bottom: 1rem;
        right: 1rem;
      }

      .toast-container--bottom-left {
        bottom: 1rem;
        left: 1rem;
      }

      .toast-container--bottom-center {
        bottom: 1rem;
        left: 50%;
        transform: translateX(-50%);
      }

      .toast {
        pointer-events: auto;
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 1rem;
        margin-bottom: 0.5rem;
        background: white;
        border-radius: 0.5rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border-left: 4px solid #e5e7eb;
        position: relative;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        overflow: hidden;
      }

      .toast--visible {
        opacity: 1;
        transform: translateX(0);
      }

      .toast--success {
        background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
        border-left-color: #10b981;
      }

      .toast--error {
        background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
        border-left-color: #ef4444;
      }

      .toast--warning {
        background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
        border-left-color: #f59e0b;
      }

      .toast--info {
        background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
        border-left-color: #3b82f6;
      }

      .toast--reminder {
        background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
        border-left-color: #8b5cf6;
      }

      .toast__content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .toast__message {
        font-size: 0.875rem;
        font-weight: 500;
        color: #1f2937;
        line-height: 1.25;
      }

      .toast__timestamp {
        font-size: 0.75rem;
        color: #6b7280;
        font-weight: 400;
      }

      .toast__close {
        background: none;
        border: none;
        color: #6b7280;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 0.25rem;
        transition: all 0.2s;
        font-size: 1.125rem;
        line-height: 1;
        min-width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .toast__close:hover {
        background: rgba(0, 0, 0, 0.05);
        color: #374151;
      }

      .toast__progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: currentColor;
        transition: width 0.1s linear;
        opacity: 0.3;
      }

      /* Posición izquierda */
      .toast-container--top-left .toast,
      .toast-container--bottom-left .toast {
        transform: translateX(-100%);
      }

      .toast-container--top-left .toast--visible,
      .toast-container--bottom-left .toast--visible {
        transform: translateX(0);
      }

      /* Posición centro */
      .toast-container--top-center .toast,
      .toast-container--bottom-center .toast {
        transform: translateY(-20px) scale(0.95);
      }

      .toast-container--top-center .toast--visible,
      .toast-container--bottom-center .toast--visible {
        transform: translateY(0) scale(1);
      }

      /* Animación de salida */
      .toast--removing {
        opacity: 0;
        transform: translateX(100%);
        margin-bottom: 0;
        padding-top: 0;
        padding-bottom: 0;
        transition: all 0.3s ease-in;
      }

      .toast-container--top-left .toast--removing,
      .toast-container--bottom-left .toast--removing {
        transform: translateX(-100%);
      }

      .toast-container--top-center .toast--removing,
      .toast-container--bottom-center .toast--removing {
        transform: translateY(-20px) scale(0.95);
      }

      /* Modo oscuro */
      @media (prefers-color-scheme: dark) {
        .toast {
          background: #1f2937;
          border-left-color: #374151;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .toast--success {
          background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
          border-left-color: #10b981;
        }

        .toast--error {
          background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%);
          border-left-color: #ef4444;
        }

        .toast--warning {
          background: linear-gradient(135deg, #78350f 0%, #92400e 100%);
          border-left-color: #f59e0b;
        }

        .toast--info {
          background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
          border-left-color: #3b82f6;
        }

        .toast--reminder {
          background: linear-gradient(135deg, #581c87 0%, #6b21a8 100%);
          border-left-color: #8b5cf6;
        }

        .toast__message {
          color: #f9fafb;
        }

        .toast__timestamp {
          color: #9ca3af;
        }

        .toast__close {
          color: #9ca3af;
        }

        .toast__close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #f3f4f6;
        }
      }
    `
    ),

    h(ToastContainer, { toasts, onClose, config }),
  ]);
};

export default ToastSystem;
