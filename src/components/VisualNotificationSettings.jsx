/**
 * @fileoverview Configuración de notificaciones visuales
 * @description Panel de configuración para notificaciones visuales del calendario
 */

import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import {
  useToast,
  REMINDER_TIMES,
  TOAST_POSITIONS,
} from '../contexts/ToastContext.jsx';

/**
 * Configuración de notificaciones visuales
 */
export const VisualNotificationSettings = ({
  visualNotificationManager,
  onClose,
}) => {
  const toast = useToast();
  const [settings, setSettings] = useState({
    enabled: true,
    defaultReminders: [REMINDER_TIMES.FIFTEEN_MINUTES],
    sound: false,
  });

  const [stats, setStats] = useState({
    scheduled: 0,
    supported: true,
  });

  useEffect(() => {
    if (visualNotificationManager) {
      const currentSettings = visualNotificationManager.settings;
      setSettings(prev => ({ ...prev, ...currentSettings }));

      const currentStats = visualNotificationManager.getStats();
      setStats(currentStats);
    }
  }, [visualNotificationManager]);

  const handleToggleNotifications = () => {
    const newSettings = { ...settings, enabled: !settings.enabled };
    setSettings(newSettings);

    if (visualNotificationManager) {
      visualNotificationManager.updateSettings(newSettings);
    }

    toast.success(
      newSettings.enabled
        ? '✅ Notificaciones activadas'
        : '⭕ Notificaciones desactivadas'
    );
  };

  const handleReminderTimeChange = (timeValue, checked) => {
    const reminderTime = parseInt(timeValue);
    let newReminders;

    if (checked) {
      newReminders = [...settings.defaultReminders, reminderTime].sort(
        (a, b) => a - b
      );
    } else {
      newReminders = settings.defaultReminders.filter(
        time => time !== reminderTime
      );
    }

    const newSettings = { ...settings, defaultReminders: newReminders };
    setSettings(newSettings);

    if (visualNotificationManager) {
      visualNotificationManager.updateSettings(newSettings);
    }
  };

  const handleSoundToggle = () => {
    const newSettings = { ...settings, sound: !settings.sound };
    setSettings(newSettings);

    if (visualNotificationManager) {
      visualNotificationManager.updateSettings(newSettings);
    }

    toast.info(
      newSettings.sound ? '🔊 Sonidos activados' : '🔇 Sonidos desactivados'
    );
  };

  const handleTestNotification = () => {
    if (!settings.enabled) {
      toast.error('Las notificaciones están desactivadas');
      return;
    }

    // Mostrar diferentes tipos de notificaciones de prueba
    setTimeout(() => toast.info('📅 Notificación de información'), 0);
    setTimeout(() => toast.success('✅ ¡Todo funciona!'), 1000);
    setTimeout(() => toast.warning('⚠️ Advertencia de prueba'), 2000);
    setTimeout(() => {
      toast.reminder(
        '🔔 Recordatorio de evento\nTu evento comienza en 15 minutos',
        {
          actions: [
            { label: 'Ver', action: 'view' },
            { label: 'Cerrar', action: 'dismiss' },
          ],
        }
      );
    }, 3000);
  };

  const reminderOptions = [
    { value: REMINDER_TIMES.AT_TIME, label: 'En el momento' },
    { value: REMINDER_TIMES.FIVE_MINUTES, label: '5 minutos antes' },
    { value: REMINDER_TIMES.FIFTEEN_MINUTES, label: '15 minutos antes' },
    { value: REMINDER_TIMES.THIRTY_MINUTES, label: '30 minutos antes' },
    { value: REMINDER_TIMES.ONE_HOUR, label: '1 hora antes' },
  ];

  return (
    <div className='notification-settings'>
      <style jsx>{`
        .notification-settings {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          max-width: 600px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
        }

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #e5e7eb;
        }

        .settings-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #6b7280;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .close-button:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .setting-group {
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .setting-group:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .setting-label {
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.1rem;
        }

        .setting-description {
          color: #6b7280;
          font-size: 0.875rem;
          margin-bottom: 16px;
          line-height: 1.5;
        }

        .toggle-switch {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .switch {
          position: relative;
          width: 48px;
          height: 24px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #d1d5db;
          transition: 0.3s;
          border-radius: 24px;
        }

        .slider:before {
          position: absolute;
          content: '';
          height: 20px;
          width: 20px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          transition: 0.3s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: #10b981;
        }

        input:checked + .slider:before {
          transform: translateX(24px);
        }

        .status-badge {
          padding: 8px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 0.875rem;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .status-enabled {
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
        }

        .status-disabled {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .reminder-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .reminder-option {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          border-radius: 8px;
          transition: all 0.2s;
          border: 1px solid #e5e7eb;
        }

        .reminder-option:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        .reminder-option input[type='checkbox'] {
          width: 16px;
          height: 16px;
          accent-color: #10b981;
        }

        .reminder-option label {
          font-size: 0.875rem;
          color: #374151;
          cursor: pointer;
          flex: 1;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 16px;
        }

        .stat-item {
          text-align: center;
          padding: 16px;
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .test-button {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .test-button:hover {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .test-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .feature-highlight {
          background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
          border: 1px solid #a7f3d0;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
        }

        .feature-highlight h4 {
          color: #047857;
          margin: 0 0 8px 0;
          font-size: 1rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .feature-highlight p {
          color: #059669;
          margin: 0;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        @media (max-width: 640px) {
          .notification-settings {
            margin: 0;
            border-radius: 0;
            max-height: 100vh;
          }

          .reminder-options {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className='settings-header'>
        <h2 className='settings-title'>🎨 Notificaciones Visuales</h2>
        <button className='close-button' onClick={onClose}>
          ×
        </button>
      </div>

      {/* Destacar ventajas */}
      <div className='feature-highlight'>
        <h4>✨ Notificaciones Visuales Mejoradas</h4>
        <p>
          Sin permisos del navegador • Siempre visibles • Diseño elegante •
          Control total • Acciones integradas
        </p>
      </div>

      {/* Estado de notificaciones */}
      <div className='setting-group'>
        <label className='setting-label'>🔔 Estado</label>
        <p className='setting-description'>
          Activa las notificaciones visuales para recibir recordatorios
          elegantes de tus eventos
        </p>

        <div className='toggle-switch'>
          <div className='switch'>
            <input
              type='checkbox'
              checked={settings.enabled}
              onChange={handleToggleNotifications}
            />
            <span className='slider'></span>
          </div>
          <span>{settings.enabled ? 'Activadas' : 'Desactivadas'}</span>
        </div>

        <div
          className={`status-badge ${settings.enabled ? 'status-enabled' : 'status-disabled'}`}
        >
          {settings.enabled
            ? '✅ Notificaciones activas'
            : '⭕ Notificaciones desactivadas'}
        </div>
      </div>

      {/* Tiempos de recordatorio */}
      <div className='setting-group'>
        <label className='setting-label'>⏰ Recordatorios por defecto</label>
        <p className='setting-description'>
          Selecciona cuándo quieres recibir recordatorios antes de tus eventos
        </p>

        <div className='reminder-options'>
          {reminderOptions.map(option => (
            <div key={option.value} className='reminder-option'>
              <input
                type='checkbox'
                id={`reminder-${option.value}`}
                checked={settings.defaultReminders.includes(option.value)}
                onChange={e =>
                  handleReminderTimeChange(option.value, e.target.checked)
                }
              />
              <label htmlFor={`reminder-${option.value}`}>{option.label}</label>
            </div>
          ))}
        </div>
      </div>

      {/* Sonido */}
      <div className='setting-group'>
        <label className='setting-label'>🔊 Sonido</label>
        <p className='setting-description'>
          Reproduce tonos suaves cuando aparezcan las notificaciones
        </p>

        <div className='toggle-switch'>
          <div className='switch'>
            <input
              type='checkbox'
              checked={settings.sound}
              onChange={handleSoundToggle}
            />
            <span className='slider'></span>
          </div>
          <span>{settings.sound ? 'Activado' : 'Desactivado'}</span>
        </div>
      </div>

      {/* Estadísticas */}
      <div className='setting-group'>
        <label className='setting-label'>📊 Estadísticas</label>
        <div className='stats-grid'>
          <div className='stat-item'>
            <div className='stat-value'>{stats.scheduled}</div>
            <div className='stat-label'>Programadas</div>
          </div>
          <div className='stat-item'>
            <div className='stat-value'>100%</div>
            <div className='stat-label'>Compatibilidad</div>
          </div>
          <div className='stat-item'>
            <div className='stat-value'>✨</div>
            <div className='stat-label'>Visuales</div>
          </div>
        </div>
      </div>

      {/* Prueba */}
      <div className='setting-group'>
        <label className='setting-label'>🧪 Prueba</label>
        <p className='setting-description'>
          Envía notificaciones de prueba para ver cómo se ven y funcionan
        </p>

        <button
          className='test-button'
          onClick={handleTestNotification}
          disabled={!settings.enabled}
        >
          🚀 Enviar notificaciones de prueba
        </button>
      </div>
    </div>
  );
};
