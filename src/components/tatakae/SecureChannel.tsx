'use client';

import { ArrowUpRightIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { useProfile } from '@/components/ProfileProvider';
import { SOCIAL_NETWORKS } from '@/lib/social';
import { useTyped } from '@/lib/useTyped';

/**
 * The reward at the bottom of an unlocked file: a small terminal window that
 * opens a "secure channel" and lists the contact links, plus a recognition
 * phrase so a message can say where it came from. A quick, quiet sibling of
 * the contact section, for whoever got this far.
 */
export default function SecureChannel({
  codename,
  onClose,
}: {
  codename: string;
  onClose: () => void;
}) {
  const t = useTranslations('tatakae.channel');
  const { socials } = useProfile();
  const panelRef = useRef<HTMLElement>(null);
  const channels = socials.filter((social) => social.inContact);
  const greeting = t('established');
  const typed = useTyped(greeting.length, 250, 22);
  // The links come in once the greeting is typed, one after another.
  const listAt = 250 + greeting.length * 22 + 150;

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  return (
    <section
      ref={panelRef}
      tabIndex={-1}
      aria-label={t('title')}
      data-print=""
      onKeyDown={(event) => {
        // Esc closes the channel, not the whole dossier behind it.
        if (event.key !== 'Escape') return;
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }}
      className="fixed inset-x-3 bottom-3 z-20 overflow-hidden rounded-xl bg-ctp-crust font-nf text-xs shadow-2xl shadow-ctp-crust ring-1 ring-ctp-green/40 outline-none sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-80"
    >
      <div className="flex items-center gap-2 border-b border-ctp-surface0 px-3 py-2">
        <span aria-hidden="true" className="relative flex size-2">
          <span className="absolute inline-flex size-full rounded-full bg-ctp-green opacity-60 motion-safe:animate-ping" />
          <span className="relative inline-flex size-2 rounded-full bg-ctp-green" />
        </span>
        <h2 className="tracking-[0.2em] text-ctp-subtext1 uppercase">{t('title')}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('close')}
          className="ml-auto rounded-full p-1 text-ctp-overlay2 transition-colors hover:text-ctp-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-green"
        >
          <XMarkIcon aria-hidden="true" className="size-4" />
        </button>
      </div>

      <div className="space-y-3 p-3">
        <p className="text-ctp-green latte:text-ctp-green-900">
          <span className="sr-only">{greeting}</span>
          <span aria-hidden="true">
            {greeting.slice(0, typed)}
            {typed < greeting.length && (
              <span className="caret-blink ml-px inline-block h-[1em] w-[0.5ch] translate-y-[0.15em] bg-current" />
            )}
          </span>
        </p>

        <ul className="space-y-1">
          {channels.map((social, index) => {
            const { name, Icon } = SOCIAL_NETWORKS[social.platform];
            return (
              <li
                key={social.platform}
                data-print=""
                style={{ animationDelay: `${listAt + index * 120}ms` }}
              >
                <a
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2.5 rounded-md px-2 py-1.5 text-ctp-subtext1 transition-colors hover:bg-ctp-surface0/60 hover:text-ctp-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ctp-green"
                >
                  <Icon aria-hidden="true" className="size-3.5 shrink-0" />
                  <span className="w-16 shrink-0">{name}</span>
                  <span className="truncate text-ctp-overlay1 group-hover:text-ctp-subtext0">
                    {social.handle}
                  </span>
                  <ArrowUpRightIcon
                    aria-hidden="true"
                    className="ml-auto size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                  />
                  <span className="sr-only">{t('newTab')}</span>
                </a>
              </li>
            );
          })}
        </ul>

        <p
          data-print=""
          style={{ animationDelay: `${listAt + channels.length * 120 + 100}ms` }}
          className="border-t border-dashed border-ctp-surface1 pt-2 text-[0.6875rem] leading-relaxed text-ctp-overlay1 latte:text-ctp-subtext0"
        >
          {t('password', { codename })}
        </p>
      </div>
    </section>
  );
}
