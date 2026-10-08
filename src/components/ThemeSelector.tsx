'use client';

import type { FlavorName } from '@catppuccin/palette';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/20/solid';
import { useTranslations } from 'next-intl';
import { FLAVOR_NAMES, FLAVORS } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { useCtpStore } from '@/store';

/**
 * A flavor's own colors, whatever flavor the page is in: the flavor class on
 * the swatch re-points every ctp-* token inside it.
 */
export function FlavorSwatch({ flavor, className }: { flavor: FlavorName; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        flavor,
        'inline-grid size-5 shrink-0 grid-cols-2 overflow-hidden rounded-full bg-ctp-base p-[3px] ring-1 ring-ctp-overlay0/60',
        className
      )}
    >
      <span className="rounded-tl-full bg-ctp-mauve" />
      <span className="rounded-tr-full bg-ctp-teal" />
      <span className="rounded-bl-full bg-ctp-peach" />
      <span className="rounded-br-full bg-ctp-lavender" />
    </span>
  );
}

const ThemeSelector: React.FC = () => {
  const t = useTranslations('navigation');
  const flavor = useCtpStore((state) => state.flavor);
  const swapFlavor = useCtpStore((state) => state.swapFlavor);

  return (
    <Listbox value={flavor} onChange={swapFlavor}>
      <ListboxButton
        aria-label={`${t('theme')}: ${FLAVOR_NAMES[flavor]}`}
        className="flex size-9 items-center justify-center rounded-full bg-ctp-mantle/50 ring-1 ring-ctp-surface1/70 backdrop-blur-sm transition-colors hover:ring-ctp-lavender/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-lavender data-open:ring-ctp-lavender/60"
      >
        <FlavorSwatch flavor={flavor} />
      </ListboxButton>

      <ListboxOptions
        anchor="bottom end"
        transition
        className="z-60 w-52 rounded-xl bg-ctp-mantle/90 p-1.5 shadow-xl shadow-ctp-crust/30 ring-1 ring-ctp-surface1 backdrop-blur-xl transition duration-150 ease-out [--anchor-gap:0.5rem] focus:outline-none data-closed:-translate-y-1 data-closed:opacity-0 motion-reduce:transition-none motion-reduce:data-closed:translate-y-0"
      >
        <p
          aria-hidden="true"
          className="px-2.5 pt-1.5 pb-1 font-nf text-[0.7rem] text-ctp-subtext0"
        >
          <span className="text-ctp-overlay1"># </span>
          {t('theme')}
        </p>
        {FLAVORS.map((name) => (
          <ListboxOption
            key={name}
            value={name}
            className="group flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-ctp-subtext1 select-none data-focus:bg-ctp-surface0/80 data-focus:text-ctp-text data-selected:text-ctp-text"
          >
            <FlavorSwatch flavor={name} />
            <span className="flex-1 font-medium">{FLAVOR_NAMES[name]}</span>
            <span className="font-nf text-[0.7rem] text-ctp-subtext0">
              {name === 'latte' ? t('light') : t('dark')}
            </span>
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

export default ThemeSelector;
