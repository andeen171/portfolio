'use client';

import { ArrowLeftIcon } from '@heroicons/react/20/solid';
import { CommandLineIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import { PaletteShortcut } from '@/components/CommandPalette';
import SectionHeading from '@/components/ui/SectionHeading';
import { Link, usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { useCommandPalette } from '@/store';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-lavender focus-visible:ring-offset-2 focus-visible:ring-offset-ctp-base';

/** One line of the fake session; decorative, the heading carries the meaning. */
function Line({ children }: { children: React.ReactNode }) {
  return <p className="wrap-anywhere">{children}</p>;
}

/** The hero's prompt, so the whole site is one shell session. */
function Prompt() {
  return (
    <>
      <span className="text-ctp-green">anderson</span>
      <span className="text-ctp-overlay1">@</span>
      <span className="text-ctp-blue">arch</span> <span className="text-ctp-mauve">~</span>{' '}
      <span className="text-ctp-teal">❯</span>{' '}
    </>
  );
}

// Unmatched URLs get this view through app/global-not-found.tsx. A client
// component so it can echo the path that was asked for.
export default function NotFound() {
  const t = useTranslations('notFound');
  const pathname = usePathname();
  const setOpen = useCommandPalette((state) => state.setOpen);

  return (
    <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-2xl flex-col justify-center px-4 pt-28 pb-12 sm:px-6">
      <SectionHeading as="h1" eyebrow={t('eyebrow')} title={t('title')} />
      <p className="mx-auto mt-4 max-w-md text-center text-pretty text-ctp-subtext1">
        {t('description')}
      </p>

      <div
        aria-hidden="true"
        className="mt-10 overflow-hidden rounded-2xl bg-ctp-mantle/70 shadow-2xl shadow-ctp-crust/50 ring-1 ring-ctp-surface1/70 backdrop-blur-md latte:shadow-ctp-overlay0/25"
      >
        <div className="relative flex items-center gap-2 border-b border-ctp-surface0 bg-ctp-crust/50 px-4 py-2.5">
          <span className="size-3 rounded-full bg-ctp-red/80" />
          <span className="size-3 rounded-full bg-ctp-yellow/80" />
          <span className="size-3 rounded-full bg-ctp-green/80" />
          <span className="absolute inset-x-20 truncate text-center font-nf text-xs text-ctp-subtext0 latte:text-ctp-subtext1">
            anderson@arch: ~
          </span>
        </div>
        <div className="space-y-1.5 p-5 font-nf text-sm leading-relaxed text-ctp-text sm:p-6">
          <Line>
            <Prompt />
            cd {pathname}
          </Line>
          <Line>
            <span className="text-ctp-red">cd:</span> {t('error')}:{' '}
            <span className="text-ctp-peach">{pathname}</span>
          </Line>
          <Line>
            <Prompt />
            <span className="caret-blink inline-block h-[1.1em] w-[0.55em] translate-y-[0.2em] bg-ctp-lavender" />
          </Line>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
        <Link
          href="/"
          className={cn(
            // Latte's lavender and teal are too light under white text; their
            // darker shades keep the hue at AA.
            'inline-flex items-center justify-center gap-2 rounded-full bg-ctp-lavender px-5 py-2.5 text-sm font-semibold text-ctp-base shadow-lg shadow-ctp-lavender/20 transition-colors hover:bg-ctp-teal latte:bg-ctp-lavender-900 latte:hover:bg-ctp-blue-800',
            focusRing
          )}
        >
          <ArrowLeftIcon aria-hidden="true" className="size-4" />
          {t('home')}
          <span aria-hidden="true" className="font-nf text-xs font-normal opacity-90">
            cd ~
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-keyshortcuts="Control+K Meta+K"
          className={cn(
            'inline-flex items-center justify-center gap-2.5 rounded-full bg-ctp-mantle/60 py-2.5 pr-2.5 pl-4 text-sm font-medium text-ctp-text ring-1 ring-ctp-surface1 backdrop-blur-sm transition-colors hover:ring-ctp-lavender/60',
            focusRing
          )}
        >
          <CommandLineIcon aria-hidden="true" className="size-4 text-ctp-lavender" />
          {t('palette')}
          <PaletteShortcut className="hidden sm:inline-flex" />
        </button>
      </div>
    </div>
  );
}
