import { h } from 'preact';
import { useState } from 'preact/hooks';
import {
  RECURRENCE_TYPES,
  DEFAULT_RECURRENCE,
  getRecurrenceDescription,
  validateRecurrence,
} from '../utils/recurrence.js';
import { REMINDER_TIMES } from '../contexts/ToastContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';

/**
 * @name EventModal
 * @summary
 * Modal para crear y editar eventos del calendario
 *
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSave - Función para guardar el evento
 * @param {Object} props.event - Evento a editar (null para nuevo evento)
 * @param {Date} props.selectedDate - Fecha seleccionada
 * @return {JSX.Element} Componente del modal de eventos
 */
export const EventModal = ({
  isOpen,
  onClose,
  onSave,
  event = null,
  selectedDate,
}) => {
  const toast = useToast();

  const [formData, setFormData] = useState(() => ({
    title: event?.title || '',
    description: event?.description || '',
    type: event?.type || 'personal',
    time: event?.time || '09:00',
    duration: event?.duration || 60,
    location: event?.location || '',
    isAllDay: event?.isAllDay || false,
    // Nuevos campos para recurrencia
    recurrence: event?.recurrence || { ...DEFAULT_RECURRENCE },
    // Nuevos campos para notificaciones visuales
    reminders: event?.reminders || [REMINDER_TIMES.FIFTEEN_MINUTES],
    enableNotifications: event?.enableNotifications !== false, // Por defecto activado
  }));

  const [showRecurrenceOptions, setShowRecurrenceOptions] = useState(
    event?.recurrence?.type !== RECURRENCE_TYPES.NONE
  );
  const [showReminderOptions, setShowReminderOptions] = useState(
    event?.reminders?.length > 0 || false
  );

  const [errors, setErrors] = useState({});

  const eventTypes = [
    { value: 'personal', label: 'Personal', icon: '👤', color: 'primary' },
    { value: 'work', label: 'Trabajo', icon: '💼', color: 'warning' },
    { value: 'meeting', label: 'Reunión', icon: '👥', color: 'success' },
    { value: 'holiday', label: 'Vacaciones', icon: '🏖️', color: 'error' },
    { value: 'reminder', label: 'Recordatorio', icon: '🔔', color: 'gray' },
  ];

  const durations = [
    { value: 15, label: '15 minutos' },
    { value: 30, label: '30 minutos' },
    { value: 60, label: '1 hora' },
    { value: 90, label: '1.5 horas' },
    { value: 120, label: '2 horas' },
    { value: 240, label: '4 horas' },
    { value: 480, label: '8 horas' },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleRecurrenceChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      recurrence: {
        ...prev.recurrence,
        [field]: value,
      },
    }));
  };

  const handleWeekdayChange = (weekday, checked) => {
    setFormData(prev => {
      const weekdays = prev.recurrence.weekdays || [];
      const newWeekdays = checked
        ? [...weekdays, weekday]
        : weekdays.filter(day => day !== weekday);

      return {
        ...prev,
        recurrence: {
          ...prev.recurrence,
          weekdays: newWeekdays,
        },
      };
    });
  };

  const handleReminderChange = (reminderTime, checked) => {
    setFormData(prev => {
      const reminders = checked
        ? [...prev.reminders, reminderTime]
        : prev.reminders.filter(time => time !== reminderTime);

      return {
        ...prev,
        reminders: reminders.sort((a, b) => a - b),
      };
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    }

    if (formData.title.length > 100) {
      newErrors.title = 'El título no puede tener más de 100 caracteres';
    }

    if (formData.description.length > 500) {
      newErrors.description =
        'La descripción no puede tener más de 500 caracteres';
    }

    // Validar recurrencia si está habilitada
    if (
      showRecurrenceOptions &&
      formData.recurrence.type !== RECURRENCE_TYPES.NONE
    ) {
      const recurrenceValidation = validateRecurrence(formData.recurrence);
      if (!recurrenceValidation.isValid) {
        newErrors.recurrence = recurrenceValidation.errors[0];
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    const eventData = {
      id: event?.id || Date.now().toString(),
      ...formData,
      date: selectedDate,
      createdAt: event?.createdAt || new Date(),
      updatedAt: new Date(),
      // Limpiar recurrencia si no está habilitada
      recurrence: showRecurrenceOptions
        ? formData.recurrence
        : { ...DEFAULT_RECURRENCE },
      // Limpiar recordatorios si no están habilitados
      reminders: showReminderOptions ? formData.reminders : [],
    };

    // Las notificaciones visuales se programarán automáticamente en CalendarApp
    onSave(eventData);
    onClose();

    // Reset form
    setFormData({
      title: '',
      description: '',
      type: 'personal',
      time: '09:00',
      duration: 60,
      location: '',
      isAllDay: false,
      recurrence: { ...DEFAULT_RECURRENCE },
      reminders: [REMINDER_TIMES.FIFTEEN_MINUTES],
      enableNotifications: true,
    });
  };

  const formatDate = date => {
    return date?.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      {/* Overlay */}
      <div
        className='fixed inset-0 bg-black bg-opacity-50 transition-opacity'
        onClick={onClose}
      />

      {/* Modal */}
      <div className='flex min-h-full items-center justify-center p-4'>
        <div className='relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto'>
          {/* Header */}
          <div className='flex items-center justify-between p-6 border-b border-gray-200'>
            <h3 className='text-lg font-semibold text-gray-900'>
              {event ? '✏️ Editar Evento' : '📅 Nuevo Evento'}
            </h3>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-600 transition-colors'
              aria-label='Cerrar modal'
            >
              <span className='text-xl'>✕</span>
            </button>
          </div>

          {/* Fecha seleccionada */}
          {selectedDate && (
            <div className='px-6 py-3 bg-gray-50 border-b border-gray-200'>
              <p className='text-sm text-gray-600'>
                📅{' '}
                <span className='font-medium'>{formatDate(selectedDate)}</span>
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className='p-6 space-y-4'>
            {/* Título */}
            <div className='form-group'>
              <label className='form-label'>Título *</label>
              <input
                type='text'
                value={formData.title}
                onChange={e => handleInputChange('title', e.target.value)}
                className={`form-control ${errors.title ? 'form-error' : ''}`}
                placeholder='Nombre del evento'
                maxLength={100}
              />
              {errors.title && (
                <p className='form-error-text'>{errors.title}</p>
              )}
            </div>

            {/* Tipo de evento */}
            <div className='form-group'>
              <label className='form-label'>Tipo de evento</label>
              <div className='grid grid-cols-2 gap-2'>
                {eventTypes.map(type => (
                  <button
                    key={type.value}
                    type='button'
                    onClick={() => handleInputChange('type', type.value)}
                    className={`
                      p-2 rounded-md border text-sm flex items-center gap-2 transition-all
                      ${
                        formData.type === type.value
                          ? `bg-${type.color}-100 border-${type.color}-300 text-${type.color}-700`
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }
                    `}
                  >
                    <span>{type.icon}</span>
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Todo el día */}
            <div className='form-group'>
              <label className='flex items-center gap-2 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={formData.isAllDay}
                  onChange={e =>
                    handleInputChange('isAllDay', e.target.checked)
                  }
                  className='form-checkbox'
                />
                <span className='form-label mb-0'>Todo el día</span>
              </label>
            </div>

            {/* Hora y duración (solo si no es todo el día) */}
            {!formData.isAllDay && (
              <div className='grid grid-cols-2 gap-3'>
                <div className='form-group'>
                  <label className='form-label'>Hora</label>
                  <input
                    type='time'
                    value={formData.time}
                    onChange={e => handleInputChange('time', e.target.value)}
                    className='form-control'
                  />
                </div>

                <div className='form-group'>
                  <label className='form-label'>Duración</label>
                  <select
                    value={formData.duration}
                    onChange={e =>
                      handleInputChange('duration', parseInt(e.target.value))
                    }
                    className='form-control'
                  >
                    {durations.map(duration => (
                      <option key={duration.value} value={duration.value}>
                        {duration.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Ubicación */}
            <div className='form-group'>
              <label className='form-label'>📍 Ubicación (opcional)</label>
              <input
                type='text'
                value={formData.location}
                onChange={e => handleInputChange('location', e.target.value)}
                className='form-control'
                placeholder='Agregar ubicación...'
              />
            </div>

            {/* === SECCIÓN DE RECURRENCIA === */}
            <div className='border-t pt-4 mt-4'>
              <div className='form-group'>
                <label className='flex items-center gap-2 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={showRecurrenceOptions}
                    onChange={e => {
                      setShowRecurrenceOptions(e.target.checked);
                      if (!e.target.checked) {
                        handleInputChange('recurrence', {
                          ...DEFAULT_RECURRENCE,
                        });
                      }
                    }}
                    className='form-checkbox'
                  />
                  <span className='form-label mb-0'>🔄 Repetir evento</span>
                </label>
              </div>

              {showRecurrenceOptions && (
                <div className='ml-6 space-y-3 bg-gray-50 p-4 rounded-lg'>
                  {/* Tipo de recurrencia */}
                  <div className='form-group'>
                    <label className='form-label'>Frecuencia</label>
                    <select
                      value={formData.recurrence.type}
                      onChange={e =>
                        handleRecurrenceChange('type', e.target.value)
                      }
                      className='form-control'
                    >
                      <option value={RECURRENCE_TYPES.NONE}>No repetir</option>
                      <option value={RECURRENCE_TYPES.DAILY}>
                        Diariamente
                      </option>
                      <option value={RECURRENCE_TYPES.WEEKLY}>
                        Semanalmente
                      </option>
                      <option value={RECURRENCE_TYPES.MONTHLY}>
                        Mensualmente
                      </option>
                      <option value={RECURRENCE_TYPES.YEARLY}>
                        Anualmente
                      </option>
                    </select>
                  </div>

                  {/* Intervalo */}
                  {formData.recurrence.type !== RECURRENCE_TYPES.NONE && (
                    <div className='form-group'>
                      <label className='form-label'>Cada</label>
                      <div className='flex items-center gap-2'>
                        <input
                          type='number'
                          min='1'
                          max='999'
                          value={formData.recurrence.interval}
                          onChange={e =>
                            handleRecurrenceChange(
                              'interval',
                              parseInt(e.target.value) || 1
                            )
                          }
                          className='form-control w-20'
                        />
                        <span className='text-sm text-gray-600'>
                          {formData.recurrence.type ===
                            RECURRENCE_TYPES.DAILY && 'día(s)'}
                          {formData.recurrence.type ===
                            RECURRENCE_TYPES.WEEKLY && 'semana(s)'}
                          {formData.recurrence.type ===
                            RECURRENCE_TYPES.MONTHLY && 'mes(es)'}
                          {formData.recurrence.type ===
                            RECURRENCE_TYPES.YEARLY && 'año(s)'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Días de la semana para recurrencia semanal */}
                  {formData.recurrence.type === RECURRENCE_TYPES.WEEKLY && (
                    <div className='form-group'>
                      <label className='form-label'>Días de la semana</label>
                      <div className='flex flex-wrap gap-2'>
                        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(
                          (day, index) => (
                            <label
                              key={index}
                              className='flex items-center gap-1 cursor-pointer'
                            >
                              <input
                                type='checkbox'
                                checked={formData.recurrence.weekdays?.includes(
                                  index
                                )}
                                onChange={e =>
                                  handleWeekdayChange(index, e.target.checked)
                                }
                                className='form-checkbox'
                              />
                              <span className='text-sm'>{day}</span>
                            </label>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Finalización */}
                  <div className='form-group'>
                    <label className='form-label'>Terminar</label>
                    <div className='space-y-2'>
                      <label className='flex items-center gap-2 cursor-pointer'>
                        <input
                          type='radio'
                          name='endType'
                          value='never'
                          checked={
                            !formData.recurrence.endDate &&
                            !formData.recurrence.endAfter
                          }
                          onChange={() => {
                            handleRecurrenceChange('endDate', null);
                            handleRecurrenceChange('endAfter', null);
                          }}
                          className='form-radio'
                        />
                        <span className='text-sm'>Nunca</span>
                      </label>

                      <label className='flex items-center gap-2 cursor-pointer'>
                        <input
                          type='radio'
                          name='endType'
                          value='date'
                          checked={!!formData.recurrence.endDate}
                          onChange={() => {
                            handleRecurrenceChange('endAfter', null);
                            const nextMonth = new Date();
                            nextMonth.setMonth(nextMonth.getMonth() + 1);
                            handleRecurrenceChange(
                              'endDate',
                              nextMonth.toISOString().split('T')[0]
                            );
                          }}
                          className='form-radio'
                        />
                        <span className='text-sm'>En fecha</span>
                        {formData.recurrence.endDate && (
                          <input
                            type='date'
                            value={formData.recurrence.endDate}
                            onChange={e =>
                              handleRecurrenceChange('endDate', e.target.value)
                            }
                            className='form-control ml-2 text-sm'
                          />
                        )}
                      </label>

                      <label className='flex items-center gap-2 cursor-pointer'>
                        <input
                          type='radio'
                          name='endType'
                          value='count'
                          checked={!!formData.recurrence.endAfter}
                          onChange={() => {
                            handleRecurrenceChange('endDate', null);
                            handleRecurrenceChange('endAfter', 10);
                          }}
                          className='form-radio'
                        />
                        <span className='text-sm'>Después de</span>
                        {formData.recurrence.endAfter && (
                          <div className='flex items-center gap-1 ml-2'>
                            <input
                              type='number'
                              min='1'
                              max='1000'
                              value={formData.recurrence.endAfter}
                              onChange={e =>
                                handleRecurrenceChange(
                                  'endAfter',
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className='form-control w-16 text-sm'
                            />
                            <span className='text-sm text-gray-600'>
                              ocurrencias
                            </span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Resumen de recurrencia */}
                  {formData.recurrence.type !== RECURRENCE_TYPES.NONE && (
                    <div className='bg-blue-50 p-3 rounded border'>
                      <p className='text-sm text-blue-800'>
                        <strong>Resumen:</strong>{' '}
                        {getRecurrenceDescription(formData.recurrence)}
                      </p>
                    </div>
                  )}

                  {/* Error de validación de recurrencia */}
                  {errors.recurrence && (
                    <div className='bg-red-50 p-3 rounded border border-red-200'>
                      <p className='text-sm text-red-700'>
                        ❌ {errors.recurrence}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* === SECCIÓN DE NOTIFICACIONES === */}
            <div className='border-t pt-4 mt-4'>
              <div className='form-group'>
                <label className='flex items-center gap-2 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={showReminderOptions}
                    onChange={e => {
                      setShowReminderOptions(e.target.checked);
                      if (!e.target.checked) {
                        handleInputChange('reminders', []);
                        handleInputChange('enableNotifications', false);
                      }
                    }}
                    className='form-checkbox'
                  />
                  <span className='form-label mb-0'>🔔 Recordatorios</span>
                </label>
              </div>

              {showReminderOptions && (
                <div className='ml-6 space-y-3 bg-gray-50 p-4 rounded-lg'>
                  {/* Estado de permisos */}
                  {!notificationManager.isAvailable() && (
                    <div className='bg-yellow-50 border border-yellow-200 p-3 rounded'>
                      <p className='text-sm text-yellow-800'>
                        {notificationManager.getSettings().permission ===
                        'denied'
                          ? '⚠️ Las notificaciones están bloqueadas. Habilítalas en la configuración del navegador.'
                          : '🔔 Habilita las notificaciones para recibir recordatorios.'}
                      </p>
                      {notificationManager.getSettings().permission !==
                        'denied' && (
                        <button
                          type='button'
                          onClick={async () => {
                            await notificationManager.requestPermission();
                            setFormData({ ...formData }); // Forzar re-render
                          }}
                          className='btn btn-sm btn-warning mt-2'
                        >
                          Habilitar notificaciones
                        </button>
                      )}
                    </div>
                  )}

                  {/* Recordatorios predefinidos */}
                  <div className='form-group'>
                    <label className='form-label'>
                      Recordar antes del evento
                    </label>
                    <div className='space-y-2'>
                      {Object.entries(REMINDER_TIMES).map(([key, minutes]) => {
                        const labels = {
                          AT_TIME: 'En el momento',
                          FIVE_MINUTES: '5 minutos antes',
                          FIFTEEN_MINUTES: '15 minutos antes',
                          THIRTY_MINUTES: '30 minutos antes',
                          ONE_HOUR: '1 hora antes',
                          TWO_HOURS: '2 horas antes',
                          ONE_DAY: '1 día antes',
                          ONE_WEEK: '1 semana antes',
                        };

                        return (
                          <label
                            key={key}
                            className='flex items-center gap-2 cursor-pointer'
                          >
                            <input
                              type='checkbox'
                              checked={formData.reminders.includes(minutes)}
                              onChange={e =>
                                handleReminderChange(minutes, e.target.checked)
                              }
                              className='form-checkbox'
                            />
                            <span className='text-sm'>{labels[key]}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Configuración adicional */}
                  <div className='form-group'>
                    <label className='flex items-center gap-2 cursor-pointer'>
                      <input
                        type='checkbox'
                        checked={formData.enableNotifications}
                        onChange={e =>
                          handleInputChange(
                            'enableNotifications',
                            e.target.checked
                          )
                        }
                        className='form-checkbox'
                      />
                      <span className='text-sm'>
                        Habilitar notificaciones del navegador
                      </span>
                    </label>
                  </div>

                  {/* Resumen de recordatorios */}
                  {formData.reminders.length > 0 && (
                    <div className='bg-green-50 p-3 rounded border'>
                      <p className='text-sm text-green-800'>
                        <strong>Recordatorios configurados:</strong>{' '}
                        {formData.reminders.length}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Ubicación */}
            <div className='form-group'>
              <label className='form-label'>Ubicación</label>
              <input
                type='text'
                value={formData.location}
                onChange={e => handleInputChange('location', e.target.value)}
                className='form-control'
                placeholder='Lugar del evento (opcional)'
              />
            </div>

            {/* Descripción */}
            <div className='form-group'>
              <label className='form-label'>Descripción</label>
              <textarea
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                className={`form-control resize-none ${errors.description ? 'form-error' : ''}`}
                rows={3}
                placeholder='Detalles adicionales (opcional)'
                maxLength={500}
              />
              {errors.description && (
                <p className='form-error-text'>{errors.description}</p>
              )}
              <p className='form-help'>
                {formData.description.length}/500 caracteres
              </p>
            </div>

            {/* Botones */}
            <div className='flex gap-3 pt-4 border-t border-gray-200'>
              <button
                type='button'
                onClick={onClose}
                className='btn btn-secondary flex-1'
              >
                Cancelar
              </button>
              <button type='submit' className='btn btn-primary flex-1'>
                {event ? 'Guardar Cambios' : 'Crear Evento'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
