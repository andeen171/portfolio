import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type Language = 'pt-BR' | 'en-US';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  devtools(
    persist(
      (set) => ({
        language: 'en-US', // Default language
        setLanguage: (language) => set(() => ({ language })),
      }),
      {
        name: 'language-store',
      }
    )
  )
);
