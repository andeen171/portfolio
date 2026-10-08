'use client';

import { ArrowUpIcon, ArrowUpRightIcon } from '@heroicons/react/20/solid';
import { CommandLineIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import { type ReactNode, useId } from 'react';
import { PaletteShortcut } from '@/components/CommandPalette';
import { Link } from '@/i18n/routing';
import { NAV_ITEMS } from '@/lib/navigation';
import { SOCIAL_IDS, SOCIALS } from '@/lib/social';
import { cn } from '@/lib/utils';
import { useCommandPalette } from '@/store';

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-lavender';

/** Static class strings, so Tailwind sees every hover accent. */
const SOCIAL_ACCENTS = {
  github: 'group-hover:text-ctp-mauve',
  linkedin: 'group-hover:text-ctp-sapphire',
  x: 'group-hover:text-ctp-sky',
  instagram: 'group-hover:text-ctp-pink',
} as const;

function ColumnTitle({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="font-nf text-xs font-semibold text-ctp-subtext0">
      <span aria-hidden="true" className="text-ctp-teal">
        ~/
      </span>
      {children}
    </h2>
  );
}

const Footer: React.FC = () => {
  const t = useTranslations('footer');
  const tNav = useTranslations('navigation');
  const setOpen = useCommandPalette((state) => state.setOpen);
  const sitemapId = useId();
  const socialId = useId();

  const scrollToTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <footer className="relative mt-16 border-t border-ctp-surface0/80 bg-ctp-mantle/60 backdrop-blur-md sm:mt-24">
      {/* A teal → lavender horizon along the top edge. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-px h-px bg-linear-to-r from-transparent via-ctp-lavender/60 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-ctp-lavender/5 to-transparent"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* The motto, served the way a terminal serves wisdom. */}
        <figure className="mx-auto max-w-3xl py-16 text-center sm:py-20">
          <p aria-hidden="true" className="font-nf text-xs text-ctp-subtext0">
            <span className="text-ctp-mauve">~</span> <span className="text-ctp-teal">❯</span>{' '}
            fortune
          </p>
          <blockquote className="mt-5">
            <p className="text-2xl leading-snug font-semibold tracking-tight text-balance sm:text-4xl">
              <span aria-hidden="true" className="text-ctp-overlay1">
                “
              </span>
              <span className="animated-gradient-text">{t('quote')}</span>
              <span aria-hidden="true" className="text-ctp-overlay1">
                ”
              </span>
            </p>
          </blockquote>
          <figcaption className="mt-4 font-nf text-sm text-ctp-subtext0">
            — Anderson Lopes, 2022
          </figcaption>
        </figure>

        <div className="grid gap-12 border-t border-ctp-surface0/80 py-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Who + the palette */}
          <div className="sm:col-span-2 lg:col-span-5">
            <Link
              href="/"
              aria-label={tNav('homeLink')}
              className={cn('inline-block rounded-lg text-2xl font-extrabold', focusRing)}
            >
              <span className="animated-gradient-text">戦え Andeen</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-pretty text-ctp-subtext1">
              {t('tagline')}
            </p>

            <div className="mt-6">
              <p className="font-nf text-xs text-ctp-subtext0">{t('paletteTip')}</p>
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-haspopup="dialog"
                aria-keyshortcuts="Control+K Meta+K"
                className={cn(
                  'group mt-2.5 inline-flex items-center gap-3 rounded-xl bg-ctp-base/60 py-2 pr-2 pl-3 text-sm text-ctp-subtext1 ring-1 ring-ctp-surface1 transition-colors hover:text-ctp-text hover:ring-ctp-lavender/60',
                  focusRing
                )}
              >
                <CommandLineIcon aria-hidden="true" className="size-4 text-ctp-lavender" />
                {t('paletteCta')}
                <PaletteShortcut className="hidden sm:inline-flex" />
              </button>
            </div>
          </div>

          {/* Sitemap */}
          <nav aria-labelledby={sitemapId} className="lg:col-span-3">
            <ColumnTitle id={sitemapId}>{t('sitemap')}</ColumnTitle>
            <ul className="mt-4 space-y-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className={cn(
                      'group -mx-2 inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ctp-subtext1 transition-colors hover:text-ctp-text',
                      focusRing
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="font-nf text-xs text-ctp-overlay1 transition-colors group-hover:text-ctp-teal"
                    >
                      ❯
                    </span>
                    {tNav(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Social */}
          <section aria-labelledby={socialId} className="lg:col-span-4">
            <ColumnTitle id={socialId}>{t('social')}</ColumnTitle>
            <ul className="mt-4 space-y-1">
              {SOCIAL_IDS.map((id) => {
                const { name, handle, url, Icon } = SOCIALS[id];
                return (
                  <li key={id}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'group -mx-2 flex items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors',
                        focusRing
                      )}
                    >
                      <Icon
                        className={cn(
                          'size-4 shrink-0 text-ctp-subtext0 transition-colors',
                          SOCIAL_ACCENTS[id]
                        )}
                      />
                      <span className="text-ctp-subtext1 transition-colors group-hover:text-ctp-text">
                        {name}
                      </span>
                      <span className="min-w-0 truncate font-nf text-xs text-ctp-subtext0">
                        {handle}
                      </span>
                      <ArrowUpRightIcon
                        aria-hidden="true"
                        className="ml-auto size-4 shrink-0 text-ctp-overlay1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                      />
                      <span className="sr-only">{t('newTab')}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <div className="flex flex-col gap-4 border-t border-ctp-surface0/80 py-6 font-nf text-xs text-ctp-subtext0 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {/* The year is rendered at build time; a client in a new year may differ. */}
            <span suppressHydrationWarning>
              {t('copyright', { year: new Date().getFullYear() })}
            </span>
          </p>
          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <p>
              {t.rich('builtWith', {
                next: (chunks) => <span className="text-ctp-text">{chunks}</span>,
                sanity: (chunks) => <span className="text-ctp-peach">{chunks}</span>,
                ctp: (chunks) => <span className="text-ctp-mauve">{chunks}</span>,
              })}
            </p>
            <button
              type="button"
              onClick={scrollToTop}
              className={cn(
                'inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-ctp-subtext0 transition-colors hover:text-ctp-text',
                focusRing
              )}
            >
              <ArrowUpIcon aria-hidden="true" className="size-3.5" />
              <span className="sr-only sm:not-sr-only">{t('backToTop')}</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
