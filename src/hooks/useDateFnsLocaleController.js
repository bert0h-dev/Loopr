import { useMemo } from 'preact/hooks';
import { es, enUS, fr, de, it } from 'date-fns/locale';

const localeMap = {
  es,
  'es-ES': es,
  en: enUS,
  'en-US': enUS,
  fr,
  'fr-FR': fr,
  de,
  'de-DE': de,
  it,
  'it-IT': it,
};

/**
 * Hook para obtener el objeto locale de date-fns según el código de locale.
 * @param {string} localeCode - Código de locale (ej: 'es', 'en-US', etc.)
 * @returns {Object} Objeto locale de date-fns correspondiente.
 */
export function useDateFnsLocaleController(localeCode) {
  return useMemo(() => {
    return localeMap[localeCode] || es;
  }, [localeCode]);
}
