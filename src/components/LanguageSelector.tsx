'use client';

import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/20/solid';
import { LanguageIcon } from '@heroicons/react/24/outline';
import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/routing';

/** Each language named in itself, as a visitor looking for theirs expects. */
export const LANGUAGES = [
  { code: 'en-US', label: 'English', short: 'EN' },
  { code: 'pt-BR', label: 'Português', short: 'PT' },
] as const;

const LanguageSelector: React.FC = () => {
  const t = useTranslations('navigation');
  const router = useRouter();
  const [, startTransition] = useTransition();
  const pathname = usePathname();
  const locale = useLocale();
  const current = LANGUAGES.find((language) => language.code === locale) ?? LANGUAGES[0];

  const switchLanguage = (newLocale: string) => {
    startTransition(() => {
      router.replace({ pathname }, { locale: newLocale });
    });
  };

  return (
    <Listbox value={locale} onChange={switchLanguage}>
      <ListboxButton
        aria-label={`${t('language')}: ${current.label}`}
        className="flex h-9 items-center gap-1.5 rounded-full bg-ctp-mantle/50 px-2.5 text-ctp-subtext1 ring-1 ring-ctp-surface1/70 backdrop-blur-sm transition-colors hover:text-ctp-text hover:ring-ctp-lavender/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-lavender data-open:text-ctp-text data-open:ring-ctp-lavender/60"
      >
        <LanguageIcon aria-hidden="true" className="size-4 text-ctp-lavender" />
        <span className="font-nf text-xs font-medium">{current.short}</span>
      </ListboxButton>

      <ListboxOptions
        anchor="bottom end"
        transition
        className="z-60 w-48 rounded-xl bg-ctp-mantle/90 p-1.5 shadow-xl shadow-ctp-crust/30 ring-1 ring-ctp-surface1 backdrop-blur-xl transition duration-150 ease-out [--anchor-gap:0.5rem] focus:outline-none data-closed:-translate-y-1 data-closed:opacity-0 motion-reduce:transition-none motion-reduce:data-closed:translate-y-0"
      >
        <p
          aria-hidden="true"
          className="px-2.5 pt-1.5 pb-1 font-nf text-[0.7rem] text-ctp-subtext0"
        >
          <span className="text-ctp-overlay1"># </span>
          {t('language')}
        </p>
        {LANGUAGES.map((language) => (
          <ListboxOption
            key={language.code}
            value={language.code}
            lang={language.code}
            className="group flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-ctp-subtext1 select-none data-focus:bg-ctp-surface0/80 data-focus:text-ctp-text data-selected:text-ctp-text"
          >
            <span className="flex-1 font-medium">{language.label}</span>
            <span className="font-nf text-[0.7rem] text-ctp-subtext0">{language.code}</span>
            <CheckIcon
              aria-hidden="true"
              className="invisible size-4 text-ctp-lavender group-data-selected:visible"
            />
          </ListboxOption>
        ))}
      </ListboxOptions>
    </Listbox>
  );
};

export default LanguageSelector;
