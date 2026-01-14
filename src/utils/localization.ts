import type { InternationalizedArrayString } from '@/sanity/types';

function getLanguageKey(language: 'en-US' | 'pt-BR') {
  switch (language) {
    case 'en-US':
      return 'en';
    case 'pt-BR':
      return 'pt';
  }
}

/**
 * Gets the localized value from a Sanity localized field array
 * @param field The localized field array from Sanity
 * @param language The current language
 * @returns The localized value for the current language, or the first value as fallback
 */
function getLocalizedValue(
  field: InternationalizedArrayString | undefined,
  language: 'en-US' | 'pt-BR'
): string {
  if (!field || !Array.isArray(field) || field.length === 0) {
    return '';
  }

  const languageKey = getLanguageKey(language);

  // Try to find the value for the current language
  const localizedValue = field.find((item) => item._key === languageKey);

  // If found, return it, otherwise return the first value as fallback
  return localizedValue?.value ? localizedValue.value : field[0]!.value!;
}

/**
 * A hook to get a function that returns localized values
 * To be used in components that need to display localized content
 * Now synced with next-intl - components should pass locale from useLocale()
 */
export function useLocalization() {
  return {
    getLocalizedValue,
  };
}
