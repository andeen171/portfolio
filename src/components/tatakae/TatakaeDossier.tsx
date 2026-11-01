'use client';

import { EyeSlashIcon, LockClosedIcon, LockOpenIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { useLocale, useTranslations } from 'next-intl';
import { type FormEvent, type ReactNode, useEffect, useId, useRef, useState } from 'react';
import { useProfile } from '@/components/ProfileProvider';
import TechChips from '@/components/projects/TechChips';
import type { AppLocale, ClassifiedFile } from '@/lib/profile';
import { cn } from '@/lib/utils';
import { useDossier } from '@/store';
import { RedactedText } from './Redacted';
import ScrambleText from './ScrambleText';

const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const label =
  'font-nf text-[0.625rem] tracking-[0.22em] text-ctp-overlay1 uppercase latte:text-ctp-subtext1';

const pad = (n: number) => String(n).padStart(2, '0');

/** Keys compare without case or stray spaces: "ttk-0321 " opens TTK-0321. */
const sameKey = (typed: string, key: string) =>
  typed.replace(/\s+/g, '').toUpperCase() === key.replace(/\s+/g, '').toUpperCase();

function Section({
  numeral,
  title,
  children,
}: {
  numeral: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-8">
      <h3 className="flex items-center gap-3 font-nf text-xs font-bold tracking-[0.25em] text-ctp-subtext1 uppercase">
        <span className="text-ctp-red">{numeral}.</span>
        {title}
        <span aria-hidden="true" className="h-px flex-1 bg-ctp-surface1" />
      </h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** A form field of the record: label on the left, a dotted rule under the value. */
function Field({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div className="grid gap-x-6 gap-y-0.5 border-b border-dotted border-ctp-surface2 py-2 sm:grid-cols-[10rem_minmax(0,1fr)]">
      <dt className={label}>{name}</dt>
      <dd className="font-nf text-sm text-ctp-text">{children}</dd>
    </div>
  );
}

/**
 * The Tatakae dossier: the closed-source side of Anderson's work, kept like
 * a paper file in a folder. Easter eggs open it (resting on the logo's 戦え,
 * holding a classified project, or naming it in the command palette).
 *
 * Page 1 is the record: vague identification fields, notes and the list of
 * attachments. Each classified file is a further page; one with an access
 * key stays locked until the visitor types it in, and the key is hidden on
 * that project's card (see ClassifiedProjectCard). The last tab is sealed
 * for good. Tape that peeks on hover and permanent bars are in RedactedText.
 */
export default function TatakaeDossier() {
  const t = useTranslations('tatakae');
  const locale = useLocale() as AppLocale;
  const { tatakae } = useProfile();
  const view = useDossier((state) => state.view);
  const unlocked = useDossier((state) => state.unlocked);
  const open = useDossier((state) => state.open);
  const close = useDossier((state) => state.close);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (view && !dialog.open) dialog.showModal();
    if (!view && dialog.open) dialog.close();
  }, [view]);

  const files = tatakae.files;
  const fileIndex = files.findIndex((file) => file.codename === view);
  const file = files[fileIndex];
  const isOpen = (entry: ClassifiedFile) => !entry.accessKey || unlocked.includes(entry.codename);
  // The sealed page counts: the file admits it exists.
  const total = files.length + 2;
  const page = file ? fileIndex + 2 : 1;
  const title = tatakae.title || t('title');

  const tab = (active: boolean) =>
    cn(
      'flex shrink-0 items-center gap-1.5 rounded-t-lg px-3 py-2 font-nf text-[0.625rem] tracking-[0.18em] uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-red',
      active
        ? 'bg-ctp-base text-ctp-text'
        : 'bg-ctp-crust/70 text-ctp-subtext0 hover:text-ctp-text latte:text-ctp-subtext1'
    );

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: the click handles the backdrop; Esc closes it natively
    <dialog
      ref={dialogRef}
      aria-label={file ? `${title}: ${file.codename}` : title}
      className="dossier m-auto max-h-[min(100dvh-2rem,56rem)] w-[min(100%-1.5rem,48rem)] overflow-y-auto rounded-2xl border-0 bg-ctp-mantle p-0 text-ctp-text shadow-2xl shadow-ctp-crust ring-1 ring-ctp-red/30"
      onClose={close}
      onClick={(event) => {
        // The content covers the dialog's own box, so a click that lands on
        // the dialog itself is a click on the backdrop.
        if (event.target === event.currentTarget) close();
      }}
    >
      {view && (
        <div className="px-2 pb-2 sm:px-3 sm:pb-3">
          {/* Folder tabs: the record, one per file, and one sealed for good. */}
          <div className="flex items-end gap-1 pt-3 pr-1 pl-2">
            <nav aria-label={t('pages')} className="flex min-w-0 items-end gap-1 overflow-x-auto">
              <button
                type="button"
                aria-current={!file ? 'page' : undefined}
                onClick={() => open('index')}
                className={tab(!file)}
              >
                <span className="text-ctp-red">01</span>
                {t('record')}
              </button>
              {files.map((entry, index) => (
                <button
                  key={entry.key}
                  type="button"
                  aria-current={entry === file ? 'page' : undefined}
                  onClick={() => open(entry.codename)}
                  className={tab(entry === file)}
                >
                  <span className="text-ctp-red">{pad(index + 2)}</span>
                  {entry.codename}
                  {isOpen(entry) ? (
                    <LockOpenIcon aria-hidden="true" className="size-3" />
                  ) : (
                    <>
                      <LockClosedIcon aria-hidden="true" className="size-3 text-ctp-red" />
                      <span className="sr-only">({t('locked')})</span>
                    </>
                  )}
                </button>
              ))}
              <span
                title={t('sealed')}
                className="flex shrink-0 cursor-not-allowed items-center gap-1.5 rounded-t-lg bg-ctp-crust/40 px-3 py-2 font-nf text-[0.625rem] tracking-[0.18em] text-ctp-overlay0 uppercase"
              >
                <span>{pad(files.length + 2)}</span>
                <span
                  aria-hidden="true"
                  className="redaction-bar inline-block h-3 w-10 rounded-[2px]"
                />
                <span className="sr-only">{t('sealed')}</span>
                <LockClosedIcon aria-hidden="true" className="size-3" />
              </span>
            </nav>
            <button
              type="button"
              onClick={close}
              aria-label={t('close')}
              className="mb-1 ml-auto shrink-0 rounded-full p-1.5 text-ctp-overlay2 transition-colors hover:text-ctp-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-red"
            >
              <XMarkIcon aria-hidden="true" className="size-5" />
            </button>
          </div>

          {/* The sheet of paper. */}
          <div className="relative isolate overflow-hidden rounded-xl rounded-tl-none bg-ctp-base px-5 py-7 ring-1 ring-ctp-surface0 sm:px-10 sm:py-10">
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 opacity-[0.07] mix-blend-overlay"
              style={{ backgroundImage: NOISE }}
            />
            {/* Rubber stamp, slightly crooked as stamps are. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-8 right-5 -rotate-[9deg] rounded-md border-2 border-ctp-red/70 px-3 py-1 font-nf text-xs font-bold tracking-[0.3em] text-ctp-red/80 uppercase sm:right-10 sm:text-sm"
            >
              {t('stamp')}
            </span>

            <p className="font-nf text-[0.6875rem] text-ctp-green latte:text-ctp-green-900">
              <span aria-hidden="true">&gt; </span>
              <ScrambleText text={t('access')} />
            </p>

            {!file && <RecordPage title={title} onOpen={open} isOpen={isOpen} />}
            {file && isOpen(file) && <FilePage file={file} page={page} locale={locale} />}
            {file && !isOpen(file) && <LockedPage file={file} page={page} />}

            <div className="mt-10 flex items-center justify-between gap-4 border-t border-ctp-surface1 pt-4 font-nf text-[0.625rem] tracking-[0.18em] text-ctp-overlay1 uppercase latte:text-ctp-subtext1">
              <span>{t('footer')}</span>
              <span className="shrink-0">{t('pageOf', { n: pad(page), total: pad(total) })}</span>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}

function RecordPage({
  title,
  onOpen,
  isOpen,
}: {
  title: string;
  onOpen: (view: string) => void;
  isOpen: (file: ClassifiedFile) => boolean;
}) {
  const t = useTranslations('tatakae');
  const { tatakae } = useProfile();
  const locked = tatakae.files.some((file) => !isOpen(file));

  return (
    <>
      <p className={cn(label, 'mt-6')}>{t('subject')}</p>
      <h2
        data-text={title}
        className="glitch mt-1 max-w-[80%] font-nf text-3xl font-bold tracking-[0.08em] uppercase sm:text-4xl"
      >
        {title}
      </h2>

      {tatakae.facts.length > 0 && (
        <Section numeral="I" title={t('identification')}>
          <dl>
            {tatakae.facts.map((fact) => (
              <Field key={fact.label} name={fact.label}>
                <RedactedText text={fact.value} />
              </Field>
            ))}
          </dl>
        </Section>
      )}

      {tatakae.lede.length > 0 && (
        <Section numeral="II" title={t('notes')}>
          <div className="space-y-4 text-[0.9375rem] leading-relaxed text-pretty text-ctp-subtext1">
            {tatakae.lede.map((paragraph, index) => (
              <p key={paragraph} className={cn(index === 0 && 'font-nf text-ctp-text')}>
                <RedactedText text={paragraph} />
              </p>
            ))}
          </div>
        </Section>
      )}

      <Section numeral="III" title={t('attachments')}>
        <ol className="space-y-2">
          {tatakae.files.map((file, index) => (
            <li key={file.key}>
              <button
                type="button"
                onClick={() => onOpen(file.codename)}
                className="group flex w-full items-center gap-4 rounded-lg border border-ctp-surface1 px-4 py-3 text-left font-nf text-sm transition-colors hover:border-ctp-red/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-red"
              >
                <span className="text-xs text-ctp-overlay1">
                  {t('page', { n: pad(index + 2) })}
                </span>
                <span className="font-bold tracking-[0.15em]">{file.codename}</span>
                <span
                  className={cn(
                    'ml-auto flex items-center gap-1.5 text-[0.6875rem] tracking-wider uppercase',
                    isOpen(file)
                      ? 'text-ctp-green latte:text-ctp-green-900'
                      : 'text-ctp-red latte:text-ctp-red-800'
                  )}
                >
                  {isOpen(file) ? (
                    <LockOpenIcon aria-hidden="true" className="size-3.5" />
                  ) : (
                    <LockClosedIcon aria-hidden="true" className="size-3.5" />
                  )}
                  {isOpen(file) ? t('released') : t('locked')}
                </span>
              </button>
            </li>
          ))}
          <li className="flex items-center gap-4 rounded-lg border border-dashed border-ctp-surface1 px-4 py-3 font-nf text-sm text-ctp-overlay1">
            <span className="text-xs">{t('page', { n: pad(tatakae.files.length + 2) })}</span>
            <span
              aria-hidden="true"
              className="redaction-bar inline-block h-4 w-24 rounded-[2px]"
            />
            <span className="ml-auto flex items-center gap-1.5 text-[0.6875rem] tracking-wider uppercase">
              <LockClosedIcon aria-hidden="true" className="size-3.5" />
              {t('sealed')}
            </span>
          </li>
        </ol>
        {locked && (
          <p className="mt-4 border-l-2 border-ctp-red/60 pl-3 font-nf text-xs leading-relaxed text-ctp-subtext0 italic latte:text-ctp-subtext1">
            {t('hint')}
          </p>
        )}
      </Section>
    </>
  );
}

function LockedPage({ file, page }: { file: ClassifiedFile; page: number }) {
  const t = useTranslations('tatakae');
  const unlock = useDossier((state) => state.unlock);
  const inputId = useId();
  const [typed, setTyped] = useState('');
  const [wrong, setWrong] = useState(0);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (sameKey(typed, file.accessKey)) unlock(file.codename);
    else setWrong((count) => count + 1);
  };

  return (
    <div className="flex flex-col items-center py-8 text-center">
      <LockClosedIcon aria-hidden="true" className="size-10 text-ctp-red" />
      <p className={cn(label, 'mt-5')}>{t('page', { n: pad(page) })}</p>
      <h2
        data-text={file.codename}
        className="glitch mt-1 font-nf text-4xl font-bold tracking-[0.2em] sm:text-5xl"
      >
        {file.codename}
      </h2>
      <p className="mt-3 font-nf text-xs tracking-[0.2em] text-ctp-red uppercase latte:text-ctp-red-800">
        {t('lockedTitle')}
      </p>
      <p className="mt-4 max-w-sm text-sm text-pretty text-ctp-subtext1">{t('lockedBody')}</p>

      <form onSubmit={submit} className="mt-6 flex w-full max-w-sm flex-col gap-2">
        <label htmlFor={inputId} className={cn(label, 'text-left')}>
          {t('keyLabel')}
        </label>
        <div className="flex gap-2">
          <input
            // biome-ignore lint/a11y/noAutofocus: the project card opens the dossier straight onto this page, and the only thing to do here is type the key
            autoFocus
            id={inputId}
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            aria-invalid={wrong > 0 || undefined}
            aria-describedby={wrong > 0 ? `${inputId}-error` : undefined}
            placeholder="████-████"
            className="min-w-0 flex-1 rounded-lg border-0 bg-ctp-crust px-3 py-2 font-nf text-sm tracking-[0.2em] text-ctp-text uppercase ring-1 ring-ctp-surface1 placeholder:text-ctp-overlay0 focus:ring-2 focus:ring-ctp-red"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-ctp-red/15 px-4 font-nf text-xs font-bold tracking-[0.15em] text-ctp-red uppercase ring-1 ring-ctp-red/50 transition-colors hover:bg-ctp-red/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-red latte:text-ctp-red-800"
          >
            {t('decrypt')}
          </button>
        </div>
        {wrong > 0 && (
          <p
            // A fresh node per attempt, so the alert is announced every time.
            key={wrong}
            id={`${inputId}-error`}
            role="alert"
            className="text-left font-nf text-xs text-ctp-red latte:text-ctp-red-800"
          >
            {t('wrongKey', { count: wrong })}
          </p>
        )}
      </form>

      <p className="mt-8 max-w-sm border-l-2 border-ctp-red/60 pl-3 text-left font-nf text-xs leading-relaxed text-ctp-subtext0 italic latte:text-ctp-subtext1">
        {t('hint')}
      </p>
    </div>
  );
}

function FilePage({
  file,
  page,
  locale,
}: {
  file: ClassifiedFile;
  page: number;
  locale: AppLocale;
}) {
  const t = useTranslations('tatakae');
  const since = file.since ? new Date(file.since) : null;
  const opened =
    since && !Number.isNaN(since.getTime())
      ? new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
          since
        )
      : '';

  return (
    <article>
      <p className={cn(label, 'mt-6')}>{t('page', { n: pad(page) })}</p>
      <h2
        data-text={file.codename}
        className="glitch mt-1 font-nf text-4xl font-bold tracking-[0.2em] sm:text-5xl"
      >
        <ScrambleText text={file.codename} />
      </h2>

      <Section numeral="I" title={t('identification')}>
        <dl>
          <Field name={t('codename')}>{file.codename}</Field>
          {file.name && (
            <Field name={t('nature')}>
              <RedactedText text={file.name} />
            </Field>
          )}
          {file.status && (
            <Field name={t('status')}>
              <span className="flex items-center gap-2 text-ctp-red latte:text-ctp-red-800">
                <span aria-hidden="true" className="relative flex size-2">
                  <span className="absolute inline-flex size-full rounded-full bg-ctp-red opacity-60 motion-safe:animate-ping" />
                  <span className="relative inline-flex size-2 rounded-full bg-ctp-red" />
                </span>
                {file.status}
              </span>
            </Field>
          )}
          {opened && <Field name={t('since')}>{opened}</Field>}
        </dl>
      </Section>

      {file.summary.length > 0 && (
        <Section numeral="II" title={t('report')}>
          <div className="space-y-4 text-[0.9375rem] leading-relaxed text-pretty text-ctp-subtext1">
            {file.summary.map((paragraph) => (
              <p key={paragraph}>
                <RedactedText text={paragraph} />
              </p>
            ))}
          </div>
        </Section>
      )}

      {file.skills.length > 0 && (
        <Section numeral="III" title={t('stack')}>
          <TechChips skills={file.skills} label={t('stack')} />
        </Section>
      )}

      <p className="mt-8 flex items-center gap-2 font-nf text-[0.6875rem] text-ctp-overlay1 latte:text-ctp-subtext1">
        <EyeSlashIcon aria-hidden="true" className="size-3.5" />
        {t('private')}
      </p>
    </article>
  );
}
