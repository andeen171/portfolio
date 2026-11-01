'use client';

import { LockClosedIcon } from '@heroicons/react/20/solid';
import { useTranslations } from 'next-intl';

const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const SCANLINES: React.CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(to bottom, color-mix(in oklab, var(--catppuccin-color-text) 6%, transparent) 0 1px, transparent 1px 3px)',
};

const hex = (byte: number) => byte.toString(16).padStart(2, '0').toUpperCase();

/**
 * A few lines of fake memory dump, the same for a name on every render. The
 * third line isn't noise: it's the dossier page's access key, byte by byte
 * in ASCII, for whoever thinks to decode it.
 */
function dump(seed: string, key: string): string[] {
  let state = [...seed].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 7);
  const next = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state;
  };
  return Array.from({ length: 5 }, (_, line) => {
    const address = `0x${(0x3f20 + line * 16).toString(16).toUpperCase()}`;
    const bytes =
      line === 2 && key
        ? [...key].map((char) => hex(char.charCodeAt(0)))
        : Array.from({ length: 8 }, () => (next() % 5 === 0 ? '██' : hex(next() % 256)));
    return `${address}  ${bytes.join(' ')}`;
  });
}

/**
 * The key as it can appear in a clue: in an HTML comment and a hex dump.
 * One that can't go there as is (not printable ASCII, or with a "--" that
 * would end the comment) leaves no clue rather than a wrong one.
 */
export const clueKey = (key: string) =>
  /^[\x21-\x7e]+$/.test(key) && !key.includes('--') ? key : '';

/** The box a cover sits in; callers add their own size and behaviour. */
export const COVER =
  'relative isolate flex min-h-64 flex-col justify-between overflow-hidden bg-ctp-crust p-5 text-left sm:p-6';

/**
 * A classified project's cover: a flickering, glitching terminal with the
 * codename and a few lines of memory dump, one of which is the access key in
 * hex. Phrasing content only, so it can sit inside the card's button; extra
 * lines (a progress bar, a hint) go below it in `children`.
 */
export default function ClassifiedCover({
  name,
  accessKey,
  children,
}: {
  name: string;
  accessKey: string;
  children?: React.ReactNode;
}) {
  const t = useTranslations('projects.classified');
  return (
    <>
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
          {dump(name, accessKey).map((line) => (
            <span key={line} className="block truncate">
              {line}
            </span>
          ))}
        </span>
      </span>
      {children}
    </>
  );
}
