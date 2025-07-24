import { useMemo } from 'preact/hooks';

/**
 * Utilidades para manejo de fechas en el calendario
 * @module dateUtils
 */

/**
 * @name getWeekDays
 * @summary
 * Obtiene los nombres de los días de la semana en diferentes formatos
 *
 * @param {Object} options - Opciones de configuración
 * @param {number} [options.weekDay=0] - Primer día de la semana (0=Domingo, 1=Lunes, ..., 6=Sábado)
 * @param {string} [options.locale='es-MX'] - Configuración regional para la localización
 *
 * @returns {Array<Object>} Array de objetos con información de cada día de la semana
 * @returns {number} returns[].index - Índice del día en la semana (0-6)
 * @returns {string} returns[].nombre - Nombre completo del día (ej: "Lunes")
 * @returns {string} returns[].abreviatura - Abreviatura del día (ej: "Lun")
 * @returns {string} returns[].narrow - Versión más corta del día (ej: "L")
 * @returns {boolean} returns[].esFinDeSemana - Indica si es sábado o domingo
 *
 * @example
 * const dias = getWeekDays({ weekDay: 1, locale: 'es-ES' });
 * // Retorna: [
 * //   { index: 1, nombre: "Lunes", abreviatura: "Lun", narrow: "L", esFinDeSemana: false },
 * //   { index: 2, nombre: "Martes", abreviatura: "Mar", narrow: "M", esFinDeSemana: false },
 * //   ...
 * // ]
 */
export function getWeekDays(weekDay = 0, locale = 'es-MX') {
  return useMemo(() => {
    // Validar que weekDay esté entre 0-6
    if (weekDay < 0 || weekDay > 6) {
      throw new Error('weekDay debe estar entre 0 (domingo) y 6 (sábado)');
    }

    const dias = [];

    // Generamos los días de la semana empezando desde el primer día especificado
    for (let i = 0; i < 7; i++) {
      const diaIndex = (weekDay + i) % 7;

      // Crear una fecha base para obtener los nombres localizados
      const fechaBase = new Date(2024, 0, 7 + diaIndex); // Semana que empieza en domingo

      const nombre = new Intl.DateTimeFormat(locale, {
        weekday: 'long',
      }).format(fechaBase);

      const abreviatura = new Intl.DateTimeFormat(locale, {
        weekday: 'short',
      }).format(fechaBase);

      const narrow = new Intl.DateTimeFormat(locale, {
        weekday: 'narrow',
      }).format(fechaBase);

      dias.push({
        index: diaIndex,
        nombre: nombre.charAt(0).toUpperCase() + nombre.slice(1),
        abreviatura: abreviatura.charAt(0).toUpperCase() + abreviatura.slice(1),
        narrow: narrow.charAt(0).toUpperCase() + narrow.slice(1),
        esFinDeSemana: diaIndex === 0 || diaIndex === 6,
      });
    }

    return dias;
  }, [weekDay, locale]);
}
