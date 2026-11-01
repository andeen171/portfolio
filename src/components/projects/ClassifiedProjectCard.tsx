'use client';

import { CalendarIcon, LockClosedIcon } from '@heroicons/react/20/solid';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useProfile } from '@/components/ProfileProvider';
import ClassifiedCover, { COVER, clueKey } from '@/components/tatakae/ClassifiedCover';
import { RedactedText } from '@/components/tatakae/Redacted';
import { useHold } from '@/lib/useHold';
import { cn } from '@/lib/utils';
import { useDossier } from '@/store';
import TechChips from './TechChips';

/** How long the cover has to be held down to decrypt the file. */
const HOLD_MS = 1400;

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
  const { tatakae } = useProfile();
  const rawKey = tatakae.files.find((file) => file.codename === fileKey)?.accessKey ?? '';
  const accessKey = clueKey(rawKey);
  const openDossier = useDossier((state) => state.open);
  const openGate = useDossier((state) => state.openGate);
  const unlocked = useDossier((state) => state.unlocked.includes(fileKey));
  // A locked file asks for its key at the gate first, without showing the dossier.
  const openFile = () => (rawKey && !unlocked ? openGate(fileKey) : openDossier(fileKey));
  const hold = useHold(HOLD_MS, openFile);
  const [nudged, setNudged] = useState(false);

  return (
    <article className="group relative overflow-hidden rounded-2xl bg-ctp-mantle/60 shadow-xl shadow-ctp-crust/20 ring-1 ring-ctp-red/30 backdrop-blur-md transition-[box-shadow] duration-300 hover:ring-ctp-red/60">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-linear-to-r from-transparent via-ctp-red/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      {/* The other place the key hides: a comment in the markup, for whoever
          opens the dev tools or views the source. */}
      {accessKey && (
        <span
          hidden
          // biome-ignore lint/security/noDangerouslySetInnerHtml: a fixed comment around a key stripped to printable ASCII
          dangerouslySetInnerHTML={{
            __html: `<!-- 戦え :: tatakae://${fileKey.toLowerCase().replace(/[^\w-]/g, '')} :: key=${accessKey} -->`,
          }}
        />
      )}

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
              openFile();
              return;
            }
            setNudged(true);
            setTimeout(() => setNudged(false), 1600);
          }}
          className={cn(
            COVER,
            'cursor-pointer select-none [-webkit-touch-callout:none] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-red focus-visible:ring-inset rounded-t-2xl lg:h-full lg:rounded-r-none lg:rounded-l-2xl'
          )}
        >
          <ClassifiedCover name={name} accessKey={accessKey} />

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
                <RedactedText text={paragraph} />
              </p>
            ))}
          </div>

          <TechChips skills={skills} label={t('stack')} className="mt-4" />

          <p className="mt-auto flex items-center gap-2 pt-5 font-nf text-[0.6875rem] text-ctp-overlay1 latte:text-ctp-subtext1">
            <LockClosedIcon aria-hidden="true" className="size-3.5" />
            <span>
              <RedactedText text={t('closed')} />
            </span>
          </p>
        </div>
      </div>
    </article>
  );
}
