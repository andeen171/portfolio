'use client';

import { CalendarIcon, LockClosedIcon } from '@heroicons/react/20/solid';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { RedactedText } from '@/components/tatakae/Redacted';
import { useHold } from '@/lib/useHold';
import { cn } from '@/lib/utils';
import { useDossier } from '@/store';
import TechChips from './TechChips';

/** How long the cover has to be held down to decrypt the file. */
const HOLD_MS = 1400;

const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const SCANLINES: React.CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(to bottom, color-mix(in oklab, var(--catppuccin-color-text) 6%, transparent) 0 1px, transparent 1px 3px)',
};

/** A few lines of fake memory dump, the same for a name on every render. */
function dump(seed: string): string[] {
  let state = [...seed].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 7);
  const next = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state;
  };
  const byte = () => (next() % 256).toString(16).padStart(2, '0').toUpperCase();
  return Array.from({ length: 5 }, (_, line) => {
    const address = `0x${(0x3f20 + line * 16).toString(16).toUpperCase()}`;
    const bytes = Array.from({ length: 6 }, () => (next() % 5 === 0 ? '██' : byte()));
    return `${address}  ${bytes.join(' ')}`;
  });
}

interface ClassifiedProjectCardProps {
  name: string;
  /** Paragraphs; `[[words]]` are taped over. */
  paragraphs: string[];
  date?: { label: string; iso: string };
  skills?: { _id: string; name?: string | null }[] | null;
  /** Codename of the dossier file the card opens. */
  fileKey: string;
  titleAs?: 'h3' | 'h4';
}

/**
 * A closed-source project in the timeline: no screenshots and no links, just
 * a glitching, flickering terminal of a cover and a description with the
 * good parts taped over. Holding the cover down "decrypts" it and opens its
 * file in the Tatakae dossier; a quick click only says to hold, and the
 * keyboard (Enter or Space) opens it straight away.
 */
export default function ClassifiedProjectCard({
  name,
  paragraphs,
  date,
  skills,
  fileKey,
  titleAs: Title = 'h3',
}: ClassifiedProjectCardProps) {
  const t = useTranslations('projects.classified');
  const tRedacted = useTranslations('tatakae');
  const openDossier = useDossier((state) => state.open);
  const hold = useHold(HOLD_MS, () => openDossier(fileKey));
  const [nudged, setNudged] = useState(false);

  return (
    <article className="group relative overflow-hidden rounded-2xl bg-ctp-mantle/60 shadow-xl shadow-ctp-crust/20 ring-1 ring-ctp-red/30 backdrop-blur-md transition-[box-shadow] duration-300 hover:ring-ctp-red/60">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-linear-to-r from-transparent via-ctp-red/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <button
          type="button"
          aria-haspopup="dialog"
          aria-label={t('open', { name })}
          {...hold.handlers}
          onClick={(event) => {
            if (hold.consumeClick()) return;
            // Enter or Space: no pointer to hold, so the file opens at once.
            if (event.detail === 0) {
              openDossier(fileKey);
              return;
            }
            setNudged(true);
            setTimeout(() => setNudged(false), 1600);
          }}
          className="relative isolate flex min-h-64 cursor-pointer flex-col justify-between overflow-hidden bg-ctp-crust p-5 text-left select-none [-webkit-touch-callout:none] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-red focus-visible:ring-inset sm:p-6 lg:h-full"
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(70%_80%_at_30%_20%,color-mix(in_oklab,var(--catppuccin-color-red)_28%,transparent),transparent_70%)]"
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 -z-10 opacity-20 mix-blend-overlay"
            style={{ backgroundImage: NOISE }}
          />
          <span aria-hidden="true" className="flicker absolute inset-0 -z-10" style={SCANLINES} />

          <span
            aria-hidden="true"
            className="flex items-center gap-2 font-nf text-[0.6875rem] text-ctp-subtext0"
          >
            <LockClosedIcon className="size-3.5 text-ctp-red" />
            <span className="text-ctp-red">~/tatakae/</span>
            {name.toLowerCase()}
            <span className="ml-auto rounded-sm px-1.5 py-0.5 text-[0.5625rem] font-bold tracking-[0.25em] text-ctp-red uppercase ring-1 ring-ctp-red/60">
              {t('restricted')}
            </span>
          </span>

          <span aria-hidden="true" className="my-4 block">
            <span
              data-text={name}
              className="glitch font-nf text-4xl font-bold tracking-[0.2em] text-ctp-text sm:text-5xl"
            >
              {name}
            </span>
            <span className="mt-3 block space-y-0.5 font-nf text-[0.625rem] leading-tight text-ctp-overlay1">
              {dump(name).map((line) => (
                <span key={line} className="block truncate">
                  {line}
                </span>
              ))}
            </span>
          </span>

          <span aria-hidden="true" className="block">
            <span className="block h-1 overflow-hidden rounded-full bg-ctp-surface0">
              <span
                style={{ transitionDuration: hold.charging ? `${HOLD_MS}ms` : '200ms' }}
                className={cn(
                  'block h-full bg-ctp-red transition-[width] ease-linear',
                  hold.charging ? 'w-full' : 'w-0'
                )}
              />
            </span>
            <span
              className={cn(
                'mt-2 block font-nf text-[0.6875rem] tracking-wider uppercase transition-colors',
                hold.charging || nudged ? 'text-ctp-red' : 'text-ctp-subtext0'
              )}
            >
              {hold.charging ? t('decrypting') : nudged ? t('nudge') : t('hold')}
            </span>
          </span>
        </button>

        <div className="flex min-w-0 flex-col p-5 sm:p-6">
          {date && (
            <p className="flex items-center gap-1.5 font-nf text-xs text-ctp-subtext0 latte:text-ctp-subtext1">
              <CalendarIcon aria-hidden className="size-3.5 text-ctp-red" />
              <time dateTime={date.iso}>{date.label}</time>
            </p>
          )}

          <Title className="mt-2 text-xl leading-snug font-bold tracking-[0.15em] text-ctp-text">
            <span data-text={name} className="glitch">
              {name}
            </span>
          </Title>
          <p className="mt-1 flex items-center gap-2 font-nf text-xs text-ctp-red latte:text-ctp-red-800">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-ctp-red motion-safe:animate-pulse"
            />
            {t('status')}
          </p>

          <div className="mt-3 space-y-3 leading-relaxed text-pretty text-ctp-subtext1">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>
                <RedactedText text={paragraph} label={tRedacted('redacted')} />
              </p>
            ))}
          </div>

          <TechChips skills={skills} label={t('stack')} className="mt-4" />

          <p className="mt-auto flex items-center gap-2 pt-5 font-nf text-[0.6875rem] text-ctp-overlay1 latte:text-ctp-subtext1">
            <LockClosedIcon aria-hidden="true" className="size-3.5" />
            {t('closed')}
          </p>
        </div>
      </div>
    </article>
  );
}
