import { Language } from '@/store/language';

interface LocalizedField {
  _key: string;
  value: string;
}

/**
 * Gets the localized value from a Sanity localized field array
 * @param field The localized field array from Sanity
 * @param language The current language
 * @returns The localized value for the current language, or the first value as fallback
 */
export function getLocalizedValue(field: LocalizedField[], language: Language): string {
  if (!field || !Array.isArray(field) || field.length === 0) {
    return '';
  }

  // Try to find the value for the current language
  const localizedValue = field.find((item) => item._key === language);

  // If found, return it, otherwise return the first value as fallback
  return localizedValue ? localizedValue.value : field[0]!.value;
}

/**
 * A hook to get a function that returns localized values
 * To be used in components that need to display localized content
 */
export function useLocalization() {
  return {
    getLocalizedValue,
  };
}
