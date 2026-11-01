'use client';

import { XMarkIcon } from '@heroicons/react/20/solid';
import { useTranslations } from 'next-intl';
import { type FormEvent, useEffect, useId, useRef, useState } from 'react';
import { useProfile } from '@/components/ProfileProvider';
import type { ClassifiedFile } from '@/lib/profile';
import { useTyped } from '@/lib/useTyped';
import { cn } from '@/lib/utils';
import { useDossier } from '@/store';
import ClassifiedCover, { COVER, clueKey } from './ClassifiedCover';
import { sameKey } from './TatakaeDossier';

/** Ticks of silence after each line of the script, like a remote host answering. */
const PAUSE = 14;
/** How long "decrypting" runs before the file opens. */
const DECRYPT_MS = 1600;

/**
 * The gate in front of a locked file, reached by holding its project card:
 * a remote session that types out its handshake and asks for the key, next
 * to the project's cover, whose memory dump holds the answer. The dossier
 * stays out of sight until the key is right; then the session decrypts the
 * file and the dossier opens straight onto it.
 */
export default function AccessGate() {
  const t = useTranslations('tatakae.gate');
  const { tatakae } = useProfile();
  const gate = useDossier((state) => state.gate);
  const closeGate = useDossier((state) => state.closeGate);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const file = tatakae.files.find((entry) => entry.codename === gate);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (gate && !dialog.open) dialog.showModal();
    if (!gate && dialog.open) dialog.close();
  }, [gate]);

  return (
    <dialog
      ref={dialogRef}
      aria-label={file ? t('title', { file: file.codename }) : undefined}
      className="dossier m-0 h-dvh max-h-none w-screen max-w-none overflow-y-auto bg-transparent p-0 text-ctp-text [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      onClose={closeGate}
    >
      {file && <Session key={file.codename} file={file} />}
    </dialog>
  );
}

function Session({ file }: { file: ClassifiedFile }) {
  const t = useTranslations('tatakae.gate');
  const tDossier = useTranslations('tatakae');
  const closeGate = useDossier((state) => state.closeGate);
  const openDossier = useDossier((state) => state.open);
  const unlock = useDossier((state) => state.unlock);
  const inputId = useId();
  const [typedKey, setTypedKey] = useState('');
  const [attempts, setAttempts] = useState<string[]>([]);
  const [granted, setGranted] = useState(false);

  const script = t('script', { file: file.codename, path: file.codename.toLowerCase() }).split(
    '\n'
  );
  const total = script.reduce((sum, line) => sum + line.length + PAUSE, 0);
  const typed = useTyped(total, 500, 18);
  const ready = typed >= total;
  let left = typed;
  const lines = script.map((line) => {
    const shown = line.slice(0, Math.max(0, left));
    left -= line.length + PAUSE;
    return shown;
  });
  const typing = lines.findLastIndex((line) => line.length > 0);

  useEffect(() => {
    if (!granted) return;
    const timer = setTimeout(() => {
      unlock(file.codename);
      closeGate();
      openDossier(file.codename);
    }, DECRYPT_MS);
    return () => clearTimeout(timer);
  }, [granted, file.codename, unlock, closeGate, openDossier]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!typedKey.trim()) return;
    setAttempts((list) => [...list, typedKey]);
    if (sameKey(typedKey, file.accessKey)) setGranted(true);
    else setTypedKey('');
  };

  return (
    <div className="grid min-h-full place-items-center p-4 sm:p-8">
      <div className="relative w-full max-w-5xl">
        <button
          type="button"
          onClick={closeGate}
          aria-label={t('close')}
          className="absolute -top-1 right-0 z-10 rounded-full p-1.5 text-ctp-overlay2 transition-colors hover:text-ctp-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-red sm:-top-9"
        >
          <XMarkIcon aria-hidden="true" className="size-5" />
        </button>

        <div className="grid gap-5 pt-8 sm:pt-0 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          {/* The remote session. */}
          <div className="flex min-h-80 flex-col overflow-hidden rounded-xl bg-ctp-crust shadow-2xl shadow-ctp-crust ring-1 ring-ctp-surface1">
            <div className="flex items-center gap-2 border-b border-ctp-surface0 px-4 py-2.5">
              <span aria-hidden="true" className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-ctp-red/80" />
                <span className="size-2.5 rounded-full bg-ctp-yellow/80" />
                <span className="size-2.5 rounded-full bg-ctp-green/80" />
              </span>
              <span className="ml-2 font-nf text-[0.6875rem] text-ctp-overlay1">{t('window')}</span>
            </div>

            <div
              role="log"
              className="flex-1 space-y-1 p-5 font-nf text-sm leading-6 text-ctp-green latte:text-ctp-green-900"
            >
              {/* Screen readers get the whole script at once; the typing is for the eyes. */}
              <p className="sr-only">{script.join('. ')}</p>
              <div aria-hidden="true">
                {lines.map(
                  (line, index) =>
                    line && (
                      <p
                        key={script[index]}
                        className={cn(
                          index === 0 && 'text-ctp-subtext1',
                          index === script.length - 1 && 'text-ctp-red latte:text-ctp-red-800'
                        )}
                      >
                        {line}
                        {index === typing && !ready && (
                          <span className="caret-blink ml-px inline-block h-[1em] w-[0.55ch] translate-y-[0.15em] bg-current" />
                        )}
                      </p>
                    )
                )}
              </div>

              {attempts.map((attempt, index) => {
                const last = index === attempts.length - 1;
                return (
                  <div key={`${index}-${attempt}`}>
                    <p className="text-ctp-subtext1">
                      {t('prompt')}&gt; {attempt.trim().toUpperCase()}
                    </p>
                    {last && granted ? (
                      <p className="text-ctp-green latte:text-ctp-green-900">
                        {t('granted', { file: file.codename })}
                      </p>
                    ) : (
                      <p className="text-ctp-red latte:text-ctp-red-800">
                        {t('denied', { count: index + 1 })}
                      </p>
                    )}
                  </div>
                );
              })}

              {granted && (
                <span
                  aria-hidden="true"
                  className="mt-2 block h-1.5 overflow-hidden rounded-full bg-ctp-surface0"
                >
                  <span className="gate-fill block h-full bg-ctp-green" />
                </span>
              )}

              {ready && !granted && (
                <form onSubmit={submit} className="flex items-center gap-2">
                  <label htmlFor={inputId} className="shrink-0 text-ctp-subtext1">
                    <span className="sr-only">{tDossier('keyLabel')}</span>
                    <span aria-hidden="true">{t('prompt')}&gt;</span>
                  </label>
                  <input
                    // biome-ignore lint/a11y/noAutofocus: the gate exists to take this one input
                    autoFocus
                    id={inputId}
                    value={typedKey}
                    onChange={(event) => setTypedKey(event.target.value)}
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    className="min-w-0 flex-1 border-0 bg-transparent p-0 font-nf text-sm tracking-[0.2em] text-ctp-text uppercase caret-ctp-green outline-none focus:ring-0"
                  />
                </form>
              )}
            </div>
          </div>

          {/* The cover, where the key hides in plain sight. */}
          <div className="flex flex-col gap-3">
            <div
              className={cn(
                COVER,
                'flex-1 rounded-xl shadow-2xl shadow-ctp-crust ring-1 ring-ctp-red/40'
              )}
            >
              <ClassifiedCover name={file.codename} accessKey={clueKey(file.accessKey)}>
                <span className="block font-nf text-[0.6875rem] tracking-wider text-ctp-subtext0 uppercase">
                  &gt; {t('hint')}
                </span>
              </ClassifiedCover>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
