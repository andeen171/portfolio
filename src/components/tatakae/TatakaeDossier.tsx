'use client';

import {
  ArrowLeftIcon,
  ChevronRightIcon,
  EyeSlashIcon,
  LockClosedIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { useProfile } from '@/components/ProfileProvider';
import TechChips from '@/components/projects/TechChips';
import type { AppLocale, ClassifiedFile } from '@/lib/profile';
import { cn } from '@/lib/utils';
import { useDossier } from '@/store';
import { RedactedText } from './Redacted';
import ScrambleText from './ScrambleText';

// Faint CRT scanlines, so the file reads as a screen in a dark room.
const SCANLINES: React.CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(to bottom, color-mix(in oklab, var(--catppuccin-color-text) 4%, transparent) 0 1px, transparent 1px 4px)',
};

const label =
  'font-nf text-[0.6875rem] tracking-[0.2em] text-ctp-overlay1 uppercase latte:text-ctp-subtext1';

function Stamp({ children, className }: { children: string; className?: string }) {
  return (
    <span
      className={cn(
        'rounded-sm px-2 py-0.5 font-nf text-[0.625rem] font-bold tracking-[0.25em] text-ctp-red uppercase ring-1 ring-ctp-red/60 latte:text-ctp-red-800',
        className
      )}
    >
      {children}
    </span>
  );
}

const fileNumber = (index: number) => String(index + 1).padStart(3, '0');

/**
 * The Tatakae dossier: the closed-source side of Anderson's work, hidden
 * behind easter eggs (holding the 戦え in the logo, decrypting a classified
 * project, or asking the command palette by name). A briefing, the
 * company's facts and an index of files; each file opens in place. What
 * matters most is blacked out until hovered or clicked.
 */
export default function TatakaeDossier() {
  const t = useTranslations('tatakae');
  const locale = useLocale() as AppLocale;
  const { tatakae } = useProfile();
  const view = useDossier((state) => state.view);
  const open = useDossier((state) => state.open);
  const close = useDossier((state) => state.close);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (view && !dialog.open) dialog.showModal();
    if (!view && dialog.open) dialog.close();
  }, [view]);

  const fileIndex = tatakae.files.findIndex((file) => file.codename === view);
  const file = tatakae.files[fileIndex];
  const redacted = t('redacted');
  const title = tatakae.title || t('title');

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: the click handles the backdrop; Esc closes it natively
    <dialog
      ref={dialogRef}
      aria-label={file ? file.codename : title}
      className="dossier m-auto max-h-[min(100dvh-2rem,54rem)] w-[min(100%-2rem,46rem)] overflow-y-auto rounded-2xl border-0 bg-ctp-mantle p-0 text-ctp-text shadow-2xl shadow-ctp-crust ring-1 ring-ctp-red/40"
      onClose={close}
      onClick={(event) => {
        // The dialog's own box is fully covered by its content, so a click
        // that lands on the dialog itself is a click on the backdrop.
        if (event.target === event.currentTarget) close();
      }}
    >
      {view && (
        <div className="relative isolate">
          <div aria-hidden="true" className="absolute inset-0 -z-10" style={SCANLINES} />

          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-ctp-surface0 bg-ctp-mantle/95 px-5 py-3 backdrop-blur-sm">
            <span className={cn(label, 'flex items-center gap-2')}>
              <span aria-hidden="true" className="text-sm tracking-normal text-ctp-red">
                戦え
              </span>
              {t('dossier')}
            </span>
            <span className="flex items-center gap-3">
              <Stamp className="-rotate-3">{t('classified')}</Stamp>
              <button
                type="button"
                onClick={close}
                aria-label={t('close')}
                className="rounded-full p-1 text-ctp-overlay2 transition-colors hover:text-ctp-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-red"
              >
                <XMarkIcon aria-hidden="true" className="size-5" />
              </button>
            </span>
          </div>

          <div className="p-5 sm:p-8">
            <p className="font-nf text-xs text-ctp-green latte:text-ctp-green-900">
              <span aria-hidden="true">&gt; </span>
              <ScrambleText text={t('access')} />
            </p>

            {file ? (
              <FileView
                file={file}
                number={fileNumber(fileIndex)}
                locale={locale}
                redacted={redacted}
                onBack={() => open('index')}
              />
            ) : (
              <>
                <h2
                  data-text={title}
                  className="glitch mt-4 font-nf text-3xl font-bold tracking-wide text-ctp-text sm:text-4xl"
                >
                  {title}
                </h2>

                <div className="mt-5 space-y-4 text-base leading-relaxed text-pretty text-ctp-subtext1">
                  {tatakae.lede.map((paragraph, index) => (
                    <p key={paragraph} className={cn(index === 0 && 'text-ctp-text')}>
                      <RedactedText text={paragraph} label={redacted} />
                    </p>
                  ))}
                </div>

                {tatakae.facts.length > 0 && (
                  <dl className="mt-6 grid grid-cols-[auto_minmax(0,1fr)] gap-x-5 gap-y-2 rounded-xl bg-ctp-crust/50 px-4 py-4 font-nf text-xs ring-1 ring-ctp-surface0">
                    {tatakae.facts.map((fact) => (
                      <div key={fact.label} className="contents">
                        <dt className="tracking-wider text-ctp-overlay1 uppercase latte:text-ctp-subtext1">
                          {fact.label}
                        </dt>
                        <dd className="text-ctp-text">
                          <RedactedText text={fact.value} label={redacted} />
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}

                <h3 className={cn(label, 'mt-8')}>{t('files')}</h3>
                <ol className="mt-3 space-y-2">
                  {tatakae.files.map((entry, index) => (
                    <li key={entry.key}>
                      <button
                        type="button"
                        onClick={() => open(entry.codename)}
                        className="group grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-xl bg-ctp-crust/50 px-4 py-3 text-left ring-1 ring-ctp-surface0 transition hover:bg-ctp-crust hover:ring-ctp-red/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-red"
                      >
                        <span className="font-nf text-xs text-ctp-overlay1">
                          {fileNumber(index)}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-nf text-lg font-bold tracking-[0.12em]">
                            {entry.codename}
                          </span>
                          {entry.status && (
                            <span className="flex items-center gap-2 font-nf text-[0.6875rem] text-ctp-red latte:text-ctp-red-800">
                              <span
                                aria-hidden="true"
                                className="size-1.5 rounded-full bg-ctp-red motion-safe:animate-pulse"
                              />
                              {entry.status}
                            </span>
                          )}
                        </span>
                        <span className="flex items-center gap-1 font-nf text-xs text-ctp-subtext0 transition-colors group-hover:text-ctp-red">
                          {t('openFile')}
                          <ChevronRightIcon aria-hidden="true" className="size-4" />
                        </span>
                      </button>
                    </li>
                  ))}
                  {/* Unnamed on purpose: the files not ready to be shown. */}
                  <li className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-xl border border-dashed border-ctp-surface1 px-4 py-3">
                    <span className="font-nf text-xs text-ctp-overlay1">
                      {fileNumber(tatakae.files.length)}
                    </span>
                    <span className="min-w-0">
                      <span
                        aria-hidden="true"
                        className="redaction-bar block h-5 w-32 rounded-sm"
                      />
                      <span className="mt-1 block font-nf text-[0.6875rem] text-ctp-subtext0 latte:text-ctp-subtext1">
                        {t('sealedBody')}
                      </span>
                    </span>
                    <span className="flex items-center gap-1.5 font-nf text-xs text-ctp-overlay1">
                      <LockClosedIcon aria-hidden="true" className="size-3.5" />
                      {t('sealed')}
                    </span>
                  </li>
                </ol>
              </>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}

function FileView({
  file,
  number,
  locale,
  redacted,
  onBack,
}: {
  file: ClassifiedFile;
  number: string;
  locale: AppLocale;
  redacted: string;
  onBack: () => void;
}) {
  const t = useTranslations('tatakae');
  const since = file.since ? new Date(file.since) : null;
  const opened =
    since && !Number.isNaN(since.getTime())
      ? t('since', {
          date: new Intl.DateTimeFormat(locale, {
            month: 'short',
            year: 'numeric',
            timeZone: 'UTC',
          }).format(since),
        })
      : '';

  return (
    <article className="mt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          // The file replaces the index button that opened it; keep focus inside.
          // biome-ignore lint/a11y/noAutofocus: focus would otherwise drop to the dialog's start
          autoFocus
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-full font-nf text-xs text-ctp-subtext0 transition-colors hover:text-ctp-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-red latte:text-ctp-subtext1"
        >
          <ArrowLeftIcon aria-hidden="true" className="size-3.5" />
          {t('back')}
        </button>
        <span className="flex items-center gap-3">
          <span className={cn(label, 'flex items-center gap-1.5')}>
            <LockClosedIcon aria-hidden="true" className="size-3.5 text-ctp-red" />
            {t('file', { number })}
          </span>
          <Stamp>{t('confidential')}</Stamp>
        </span>
      </div>

      <p className={cn(label, 'mt-6')}>{t('codename')}</p>
      <h2
        data-text={file.codename}
        className="glitch mt-1 font-nf text-4xl font-bold tracking-[0.12em] text-ctp-text sm:text-5xl"
      >
        <ScrambleText text={file.codename} />
      </h2>
      {file.name && (
        <p className="mt-3 text-lg font-semibold text-balance text-ctp-subtext1">
          <RedactedText text={file.name} label={redacted} />
        </p>
      )}

      {(file.status || opened) && (
        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-nf text-xs">
          {file.status && (
            <span className="flex items-center gap-2 text-ctp-red latte:text-ctp-red-800">
              <span aria-hidden="true" className="relative flex size-2">
                <span className="absolute inline-flex size-full rounded-full bg-ctp-red opacity-60 motion-safe:animate-ping" />
                <span className="relative inline-flex size-2 rounded-full bg-ctp-red" />
              </span>
              {file.status}
            </span>
          )}
          {opened && <span className="text-ctp-subtext0 latte:text-ctp-subtext1">{opened}</span>}
        </p>
      )}

      <div className="mt-6 space-y-4 leading-relaxed text-pretty text-ctp-subtext1">
        {file.summary.map((paragraph) => (
          <p key={paragraph}>
            <RedactedText text={paragraph} label={redacted} />
          </p>
        ))}
      </div>

      <TechChips skills={file.skills} label={t('stack')} className="mt-6" />

      <p className="mt-6 flex items-center gap-2 border-t border-ctp-surface0 pt-4 font-nf text-[0.6875rem] text-ctp-overlay1 latte:text-ctp-subtext1">
        <EyeSlashIcon aria-hidden="true" className="size-3.5" />
        {t('private')}
      </p>
    </article>
  );
}
