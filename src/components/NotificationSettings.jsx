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
export const NotificationSettings = ({
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
          max-width: 500px;
          width: 100%;
        }
        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .settings-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }
        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #6b7280;
        }
        .setting-group {
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid #e5e7eb;
        }
        .setting-label {
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
          display: block;
        }
        .toggle-switch {
          display: flex;
          align-items: center;
          gap: 12px;
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
      `}</style>

      <div className='settings-header'>
        <h2 className='settings-title'>🎨 Notificaciones Visuales</h2>
        <button className='close-button' onClick={onClose}>
          ×
        </button>
      </div>

      <div className='setting-group'>
        <label className='setting-label'>Estado</label>
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
      </div>
    </div>
  );
};
