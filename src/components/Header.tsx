'use client';

import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { Bars3Icon, CommandLineIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion, useReducedMotion } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useId, useState } from 'react';
import { PaletteShortcut } from '@/components/CommandPalette';
import LanguageSelector, { LANGUAGES } from '@/components/LanguageSelector';
import ThemeSelector, { FlavorSwatch } from '@/components/ThemeSelector';
import { Link, usePathname } from '@/i18n/routing';
import { isActivePath, NAV_ITEMS } from '@/lib/navigation';
import { FLAVOR_NAMES, FLAVORS } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { useCommandPalette, useCtpStore } from '@/store';

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-lavender';

/** Logo: the wordmark plus a blinking terminal caret. */
function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-baseline font-extrabold', className)}>
      <span className="animated-gradient-text">戦え Andeen</span>
      <span
        aria-hidden="true"
        className="caret-blink ml-0.5 inline-block h-[0.85em] w-[0.45em] translate-y-[0.1em] rounded-[1px] bg-ctp-lavender/80"
      />
    </span>
  );
}

function PaletteTrigger() {
  const t = useTranslations('navigation');
  const setOpen = useCommandPalette((state) => state.setOpen);

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={t('openPalette')}
      aria-keyshortcuts="Control+K Meta+K"
      aria-haspopup="dialog"
      className={cn(
        'group flex size-10 items-center justify-center gap-2 rounded-full bg-ctp-mantle/50 text-ctp-subtext1 ring-1 ring-ctp-surface1/70 backdrop-blur-sm transition-colors hover:text-ctp-text hover:ring-ctp-lavender/60 md:h-9 md:w-auto md:justify-start md:pr-1.5 md:pl-3',
        focusRing
      )}
    >
      <CommandLineIcon aria-hidden="true" className="size-5 text-ctp-lavender md:size-4" />
      <span aria-hidden="true" className="hidden pr-8 font-nf text-xs whitespace-nowrap xl:inline">
        {t('search')}
      </span>
      <PaletteShortcut className="hidden md:inline-flex" />
    </button>
  );
}

function DesktopNav({ pathname }: { pathname: string }) {
  const t = useTranslations('navigation');
  const reduceMotion = useReducedMotion();

  return (
    <nav aria-label={t('primary')} className="hidden lg:block">
      <ul className="flex items-center gap-0.5 rounded-full bg-ctp-mantle/50 p-1 ring-1 ring-ctp-surface1/60 backdrop-blur-md">
        {NAV_ITEMS.map((item) => {
          const active = isActivePath(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.key} className="relative">
              {active && (
                // Slides between links as the route changes.
                <motion.span
                  layoutId="nav-active"
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-ctp-surface0 shadow-sm ring-1 ring-ctp-surface1"
                  transition={
                    reduceMotion ? { duration: 0 } : { type: 'spring', bounce: 0.18, duration: 0.5 }
                  }
                />
              )}
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                  active ? 'text-ctp-text' : 'text-ctp-subtext0 hover:text-ctp-text',
                  focusRing
                )}
              >
                <Icon
                  aria-hidden="true"
                  className={cn('size-4', active ? 'text-ctp-lavender' : 'text-ctp-overlay1')}
                />
                {t(item.key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function MobileMenu({ pathname }: { pathname: string }) {
  const t = useTranslations('navigation');
  const locale = useLocale();
  const flavor = useCtpStore((state) => state.flavor);
  const swapFlavor = useCtpStore((state) => state.swapFlavor);
  const themeLabelId = useId();
  const languageLabelId = useId();

  return (
    <Popover className="lg:hidden">
      {({ open }) => (
        <>
          <PopoverButton
            aria-label={t('openMenu')}
            className={cn(
              'flex size-10 items-center justify-center rounded-full bg-ctp-mantle/50 text-ctp-text ring-1 ring-ctp-surface1/70 backdrop-blur-sm transition-colors hover:ring-ctp-lavender/60 data-open:ring-ctp-lavender/60',
              focusRing
            )}
          >
            {open ? (
              <XMarkIcon aria-hidden="true" className="size-5 text-ctp-lavender" />
            ) : (
              <Bars3Icon aria-hidden="true" className="size-5 text-ctp-lavender" />
            )}
          </PopoverButton>

          {/* Anchored (portaled) so its backdrop blur samples the page, not
              just the header's own blurred layer. */}
          <PopoverPanel
            anchor="bottom end"
            transition
            className="z-60 w-[min(22rem,calc(100vw-1.5rem))] origin-top-right rounded-2xl bg-ctp-mantle/90 p-2 shadow-2xl shadow-ctp-crust/40 ring-1 ring-ctp-surface1 backdrop-blur-xl transition duration-200 ease-out [--anchor-gap:0.75rem] data-closed:scale-95 data-closed:opacity-0 motion-reduce:transition-none motion-reduce:data-closed:scale-100 latte:shadow-ctp-overlay0/25"
          >
            {({ close }) => (
              <>
                <nav aria-label={t('primary')}>
                  <p
                    aria-hidden="true"
                    className="px-3 pt-2 pb-1 font-nf text-[0.7rem] text-ctp-subtext0"
                  >
                    <span className="text-ctp-teal">~/</span>
                    {t('menu').toLowerCase()}
                  </p>
                  <ul>
                    {NAV_ITEMS.map((item, index) => {
                      const active = isActivePath(pathname, item.href);
                      const Icon = item.icon;
                      return (
                        <li key={item.key}>
                          <Link
                            href={item.href}
                            onClick={() => close()}
                            aria-current={active ? 'page' : undefined}
                            className={cn(
                              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-base font-medium transition-colors',
                              active
                                ? 'bg-ctp-surface0/80 text-ctp-text ring-1 ring-ctp-surface1'
                                : 'text-ctp-subtext1 hover:bg-ctp-surface0/50 hover:text-ctp-text',
                              focusRing
                            )}
                          >
                            <span
                              aria-hidden="true"
                              className="w-5 font-nf text-[0.7rem] text-ctp-overlay1"
                            >
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <Icon
                              aria-hidden="true"
                              className={cn(
                                'size-5',
                                active ? 'text-ctp-lavender' : 'text-ctp-overlay1'
                              )}
                            />
                            <span className="flex-1">{t(item.key)}</span>
                            <span aria-hidden="true" className="font-nf text-xs text-ctp-subtext0">
                              {item.href === '/' ? '~' : `~${item.href}`}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                <div className="mt-2 border-t border-ctp-surface0 px-1 pt-3 pb-1">
                  <p
                    id={themeLabelId}
                    className="px-2 pb-2 font-nf text-[0.7rem] text-ctp-subtext0"
                  >
                    <span aria-hidden="true" className="text-ctp-overlay1">
                      #{' '}
                    </span>
                    {t('theme')}
                  </p>
                  <ul aria-labelledby={themeLabelId} className="grid grid-cols-4 gap-1.5">
                    {FLAVORS.map((name) => (
                      <li key={name}>
                        <button
                          type="button"
                          aria-pressed={flavor === name}
                          onClick={() => swapFlavor(name)}
                          className={cn(
                            'flex w-full flex-col items-center gap-1.5 rounded-xl px-1 py-2 font-nf text-[0.65rem] transition-colors',
                            flavor === name
                              ? 'bg-ctp-surface0/80 text-ctp-text ring-1 ring-ctp-lavender/60'
                              : 'text-ctp-subtext0 hover:bg-ctp-surface0/50 hover:text-ctp-text',
                            focusRing
                          )}
                        >
                          <FlavorSwatch flavor={name} className="size-6" />
                          {FLAVOR_NAMES[name]}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="px-1 pt-3 pb-1">
                  <p
                    id={languageLabelId}
                    className="px-2 pb-2 font-nf text-[0.7rem] text-ctp-subtext0"
                  >
                    <span aria-hidden="true" className="text-ctp-overlay1">
                      #{' '}
                    </span>
                    {t('language')}
                  </p>
                  <ul aria-labelledby={languageLabelId} className="grid grid-cols-2 gap-1.5">
                    {LANGUAGES.map((language) => {
                      const current = language.code === locale;
                      return (
                        <li key={language.code}>
                          <Link
                            href={pathname}
                            locale={language.code}
                            lang={language.code}
                            hrefLang={language.code}
                            replace
                            onClick={() => close()}
                            aria-current={current ? 'true' : undefined}
                            className={cn(
                              'flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm transition-colors',
                              current
                                ? 'bg-ctp-surface0/80 text-ctp-text ring-1 ring-ctp-lavender/60'
                                : 'text-ctp-subtext1 hover:bg-ctp-surface0/50 hover:text-ctp-text',
                              focusRing
                            )}
                          >
                            {language.label}
                            <span
                              aria-hidden="true"
                              className="font-nf text-[0.65rem] text-ctp-subtext0"
                            >
                              {language.short}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </>
            )}
          </PopoverPanel>
        </>
      )}
    </Popover>
  );
}

const Header: React.FC = () => {
  const t = useTranslations('navigation');
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300 motion-reduce:transition-none',
        scrolled
          ? 'border-ctp-surface0/80 bg-ctp-base/85 shadow-lg shadow-ctp-crust/10 backdrop-blur-xl'
          : 'border-transparent'
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-6 lg:px-8">
        <Link
          href="/"
          aria-label={t('homeLink')}
          className={cn(
            'mr-auto justify-self-start rounded-lg text-xl transition-transform duration-300 hover:scale-[1.03] motion-reduce:transition-none motion-reduce:hover:scale-100 sm:text-2xl',
            focusRing
          )}
        >
          <Wordmark />
        </Link>

        <DesktopNav pathname={pathname} />

        <div className="flex items-center gap-2 justify-self-end">
          <PaletteTrigger />
          <div className="hidden items-center gap-2 lg:flex">
            <LanguageSelector />
            <ThemeSelector />
          </div>
          <MobileMenu pathname={pathname} />
        </div>
      </div>
    </header>
  );
};

export default Header;
