/**
 * @fileoverview Utilidades para eventos recurrentes
 * @description Funciones para calcular y generar eventos recurrentes
 */

/**
 * Tipos de recurrencia disponibles
 */
export const RECURRENCE_TYPES = {
  NONE: 'none',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  CUSTOM: 'custom',
};

/**
 * Días de la semana para recurrencia semanal
 */
export const WEEKDAYS_FOR_RECURRENCE = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

/**
 * Configuración por defecto de recurrencia
 */
export const DEFAULT_RECURRENCE = {
  type: RECURRENCE_TYPES.NONE,
  interval: 1, // Cada X días/semanas/meses/años
  endDate: null,
  endAfter: null, // Terminar después de X ocurrencias
  weekdays: [], // Para recurrencia semanal
  monthDay: null, // Para recurrencia mensual (día del mes)
  monthWeek: null, // Para recurrencia mensual (semana del mes)
  monthWeekday: null, // Para recurrencia mensual (día de la semana)
  exceptions: [], // Fechas excluidas
};

/**
 * Calcula las fechas de un evento recurrente
 * @param {Object} event - Evento base
 * @param {Object} recurrence - Configuración de recurrencia
 * @param {Date} startDate - Fecha de inicio para calcular
 * @param {Date} endDate - Fecha de fin para calcular
 * @returns {Array} Array de fechas donde debe ocurrir el evento
 */
export function calculateRecurrenceDates(
  event,
  recurrence,
  startDate,
  endDate
) {
  if (!recurrence || recurrence.type === RECURRENCE_TYPES.NONE) {
    return [new Date(event.date)];
  }

  const dates = [];
  const eventDate = new Date(event.date);
  let currentDate = new Date(eventDate);

  // Asegurar que empezamos desde la fecha de inicio si es posterior al evento
  if (startDate > eventDate) {
    currentDate = new Date(startDate);
    // Ajustar a la siguiente ocurrencia válida
    currentDate = getNextValidDate(currentDate, eventDate, recurrence);
  }

  let occurrenceCount = 0;
  const maxOccurrences = recurrence.endAfter || 100; // Límite de seguridad

  while (currentDate <= endDate && occurrenceCount < maxOccurrences) {
    // Verificar si la fecha está en las excepciones
    if (!isDateInExceptions(currentDate, recurrence.exceptions)) {
      dates.push(new Date(currentDate));
    }

    // Calcular siguiente fecha
    currentDate = getNextRecurrenceDate(currentDate, recurrence);
    occurrenceCount++;

    // Verificar fecha de fin de recurrencia
    if (recurrence.endDate && currentDate > new Date(recurrence.endDate)) {
      break;
    }
  }

  return dates;
}

/**
 * Obtiene la siguiente fecha válida para la recurrencia
 * @param {Date} currentDate - Fecha actual
 * @param {Date} baseDate - Fecha base del evento
 * @param {Object} recurrence - Configuración de recurrencia
 * @returns {Date} Siguiente fecha válida
 */
function getNextValidDate(currentDate, baseDate, recurrence) {
  const current = new Date(currentDate);

  switch (recurrence.type) {
    case RECURRENCE_TYPES.DAILY:
      return getNextDailyDate(current, baseDate, recurrence);

    case RECURRENCE_TYPES.WEEKLY:
      return getNextWeeklyDate(current, baseDate, recurrence);

    case RECURRENCE_TYPES.MONTHLY:
      return getNextMonthlyDate(current, baseDate, recurrence);

    case RECURRENCE_TYPES.YEARLY:
      return getNextYearlyDate(current, baseDate, recurrence);

    default:
      return current;
  }
}

/**
 * Calcula la siguiente fecha de recurrencia
 * @param {Date} currentDate - Fecha actual
 * @param {Object} recurrence - Configuración de recurrencia
 * @returns {Date} Siguiente fecha
 */
function getNextRecurrenceDate(currentDate, recurrence) {
  const nextDate = new Date(currentDate);

  switch (recurrence.type) {
    case RECURRENCE_TYPES.DAILY:
      nextDate.setDate(nextDate.getDate() + recurrence.interval);
      break;

    case RECURRENCE_TYPES.WEEKLY:
      if (recurrence.weekdays && recurrence.weekdays.length > 0) {
        return getNextWeeklyDateWithWeekdays(nextDate, recurrence);
      } else {
        nextDate.setDate(nextDate.getDate() + 7 * recurrence.interval);
      }
      break;

    case RECURRENCE_TYPES.MONTHLY:
      if (recurrence.monthDay) {
        // Día específico del mes
        nextDate.setMonth(nextDate.getMonth() + recurrence.interval);
        nextDate.setDate(recurrence.monthDay);
      } else if (recurrence.monthWeek && recurrence.monthWeekday !== null) {
        // Día específico de una semana específica del mes
        nextDate.setMonth(nextDate.getMonth() + recurrence.interval);
        setToWeekdayOfMonth(
          nextDate,
          recurrence.monthWeek,
          recurrence.monthWeekday
        );
      } else {
        // Mismo día del mes
        const targetDay = currentDate.getDate();
        nextDate.setMonth(nextDate.getMonth() + recurrence.interval);

        // Manejar meses con menos días
        const lastDayOfMonth = new Date(
          nextDate.getFullYear(),
          nextDate.getMonth() + 1,
          0
        ).getDate();
        nextDate.setDate(Math.min(targetDay, lastDayOfMonth));
      }
      break;

    case RECURRENCE_TYPES.YEARLY:
      nextDate.setFullYear(nextDate.getFullYear() + recurrence.interval);
      break;

    default:
      nextDate.setDate(nextDate.getDate() + 1);
  }

  return nextDate;
}

/**
 * Obtiene la siguiente fecha para recurrencia semanal con días específicos
 * @param {Date} currentDate - Fecha actual
 * @param {Object} recurrence - Configuración de recurrencia
 * @returns {Date} Siguiente fecha
 */
function getNextWeeklyDateWithWeekdays(currentDate, recurrence) {
  const current = new Date(currentDate);
  const currentWeekday = current.getDay();

  // Buscar el siguiente día de la semana en la lista
  const sortedWeekdays = [...recurrence.weekdays].sort((a, b) => a - b);

  for (const weekday of sortedWeekdays) {
    if (weekday > currentWeekday) {
      const daysToAdd = weekday - currentWeekday;
      current.setDate(current.getDate() + daysToAdd);
      return current;
    }
  }

  // Si no hay días posteriores en esta semana, ir a la siguiente semana
  const daysToNextWeek = 7 - currentWeekday + sortedWeekdays[0];
  current.setDate(
    current.getDate() + daysToNextWeek + 7 * (recurrence.interval - 1)
  );
  return current;
}

/**
 * Establece una fecha a un día específico de una semana específica del mes
 * @param {Date} date - Fecha a modificar
 * @param {number} week - Semana del mes (1-4, -1 para última)
 * @param {number} weekday - Día de la semana (0-6)
 */
function setToWeekdayOfMonth(date, week, weekday) {
  if (week === -1) {
    // Última ocurrencia del día en el mes
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const lastWeekday = lastDay.getDay();
    const daysBack = (lastWeekday - weekday + 7) % 7;
    date.setDate(lastDay.getDate() - daysBack);
  } else {
    // Semana específica
    date.setDate(1);
    const firstWeekday = date.getDay();
    const daysToAdd = ((weekday - firstWeekday + 7) % 7) + 7 * (week - 1);
    date.setDate(1 + daysToAdd);
  }
}

/**
 * Obtiene la siguiente fecha para recurrencia diaria
 */
function getNextDailyDate(currentDate, baseDate, recurrence) {
  const daysDiff = Math.floor((currentDate - baseDate) / (1000 * 60 * 60 * 24));
  const nextInterval =
    Math.ceil(daysDiff / recurrence.interval) * recurrence.interval;
  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() + nextInterval);
  return nextDate;
}

/**
 * Obtiene la siguiente fecha para recurrencia semanal
 */
function getNextWeeklyDate(currentDate, baseDate, recurrence) {
  const weeksDiff = Math.floor(
    (currentDate - baseDate) / (1000 * 60 * 60 * 24 * 7)
  );
  const nextInterval =
    Math.ceil(weeksDiff / recurrence.interval) * recurrence.interval;
  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() + nextInterval * 7);
  return nextDate;
}

/**
 * Obtiene la siguiente fecha para recurrencia mensual
 */
function getNextMonthlyDate(currentDate, baseDate, recurrence) {
  const monthsDiff =
    (currentDate.getFullYear() - baseDate.getFullYear()) * 12 +
    (currentDate.getMonth() - baseDate.getMonth());
  const nextInterval =
    Math.ceil(monthsDiff / recurrence.interval) * recurrence.interval;
  const nextDate = new Date(baseDate);
  nextDate.setMonth(nextDate.getMonth() + nextInterval);
  return nextDate;
}

/**
 * Obtiene la siguiente fecha para recurrencia anual
 */
function getNextYearlyDate(currentDate, baseDate, recurrence) {
  const yearsDiff = currentDate.getFullYear() - baseDate.getFullYear();
  const nextInterval =
    Math.ceil(yearsDiff / recurrence.interval) * recurrence.interval;
  const nextDate = new Date(baseDate);
  nextDate.setFullYear(nextDate.getFullYear() + nextInterval);
  return nextDate;
}

/**
 * Verifica si una fecha está en la lista de excepciones
 * @param {Date} date - Fecha a verificar
 * @param {Array} exceptions - Array de fechas de excepción
 * @returns {boolean} True si la fecha está en excepciones
 */
function isDateInExceptions(date, exceptions = []) {
  const dateStr = date.toDateString();
  return exceptions.some(
    exception => new Date(exception).toDateString() === dateStr
  );
}

/**
 * Genera un resumen legible de la configuración de recurrencia
 * @param {Object} recurrence - Configuración de recurrencia
 * @returns {string} Descripción textual de la recurrencia
 */
export function getRecurrenceDescription(recurrence) {
  if (!recurrence || recurrence.type === RECURRENCE_TYPES.NONE) {
    return 'No se repite';
  }

  const interval = recurrence.interval || 1;
  let description = '';

  switch (recurrence.type) {
    case RECURRENCE_TYPES.DAILY:
      description = interval === 1 ? 'Diariamente' : `Cada ${interval} días`;
      break;

    case RECURRENCE_TYPES.WEEKLY:
      if (recurrence.weekdays && recurrence.weekdays.length > 0) {
        const weekdayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const selectedDays = recurrence.weekdays
          .map(day => weekdayNames[day])
          .join(', ');
        description =
          interval === 1
            ? `Semanalmente los ${selectedDays}`
            : `Cada ${interval} semanas los ${selectedDays}`;
      } else {
        description =
          interval === 1 ? 'Semanalmente' : `Cada ${interval} semanas`;
      }
      break;

    case RECURRENCE_TYPES.MONTHLY:
      if (recurrence.monthDay) {
        description =
          interval === 1
            ? `Mensualmente el día ${recurrence.monthDay}`
            : `Cada ${interval} meses el día ${recurrence.monthDay}`;
      } else if (recurrence.monthWeek && recurrence.monthWeekday !== null) {
        const weekNames = ['primera', 'segunda', 'tercera', 'cuarta', 'última'];
        const weekdayNames = [
          'domingo',
          'lunes',
          'martes',
          'miércoles',
          'jueves',
          'viernes',
          'sábado',
        ];
        const weekStr =
          recurrence.monthWeek === -1
            ? 'última'
            : weekNames[recurrence.monthWeek - 1];
        const weekdayStr = weekdayNames[recurrence.monthWeekday];
        description =
          interval === 1
            ? `Mensualmente el ${weekStr} ${weekdayStr}`
            : `Cada ${interval} meses el ${weekStr} ${weekdayStr}`;
      } else {
        description =
          interval === 1 ? 'Mensualmente' : `Cada ${interval} meses`;
      }
      break;

    case RECURRENCE_TYPES.YEARLY:
      description = interval === 1 ? 'Anualmente' : `Cada ${interval} años`;
      break;

    default:
      description = 'Personalizado';
  }

  // Agregar información de finalización
  if (recurrence.endDate) {
    const endDate = new Date(recurrence.endDate);
    description += ` hasta ${endDate.toLocaleDateString('es-ES')}`;
  } else if (recurrence.endAfter) {
    description += ` por ${recurrence.endAfter} ocurrencias`;
  }

  return description;
}

/**
 * Valida una configuración de recurrencia
 * @param {Object} recurrence - Configuración de recurrencia
 * @returns {Object} { isValid: boolean, errors: Array }
 */
export function validateRecurrence(recurrence) {
  const errors = [];

  if (!recurrence) {
    return { isValid: true, errors: [] };
  }

  if (recurrence.type === RECURRENCE_TYPES.NONE) {
    return { isValid: true, errors: [] };
  }

  // Validar intervalo
  if (
    !recurrence.interval ||
    recurrence.interval < 1 ||
    recurrence.interval > 999
  ) {
    errors.push('El intervalo debe ser un número entre 1 y 999');
  }

  // Validar recurrencia semanal con días específicos
  if (
    recurrence.type === RECURRENCE_TYPES.WEEKLY &&
    recurrence.weekdays &&
    recurrence.weekdays.length === 0
  ) {
    errors.push('Debe seleccionar al menos un día de la semana');
  }

  // Validar recurrencia mensual
  if (recurrence.type === RECURRENCE_TYPES.MONTHLY) {
    if (
      recurrence.monthDay &&
      (recurrence.monthDay < 1 || recurrence.monthDay > 31)
    ) {
      errors.push('El día del mes debe estar entre 1 y 31');
    }
  }

  // Validar fecha de fin
  if (recurrence.endDate) {
    const endDate = new Date(recurrence.endDate);
    if (endDate <= new Date()) {
      errors.push('La fecha de fin debe ser futura');
    }
  }

  // Validar número de ocurrencias
  if (
    recurrence.endAfter &&
    (recurrence.endAfter < 1 || recurrence.endAfter > 1000)
  ) {
    errors.push('El número de ocurrencias debe estar entre 1 y 1000');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
