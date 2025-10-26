import { useLanguageStore } from '@/store/language';
import { en } from './en';
import { ptBr } from './pt-br';

export const translations = {
  'en-US': en,
  'pt-BR': ptBr,
};

export function useTranslations(): Translations {
  const language = useLanguageStore((state) => state.language);
  return translations[language];
}

export type Translations = typeof en;
