'use client';

import { useTranslations } from 'next-intl';
import { useTyped } from '@/lib/useTyped';

const TAPE = /\[\[([^\]]+)\]\]/;
const SEALED = /^#(\d{1,2})$/;

/** A permanent bar's width in characters. */
const barWidth = (digits: string) => Math.max(2, Number(digits));

/** How many characters a line takes on the page; a permanent bar counts its width. */
export function tapeLength(text: string): number {
  return text.split(TAPE).reduce((sum, part, index) => {
    const sealed = index % 2 ? SEALED.exec(part) : null;
    return sum + (sealed ? barWidth(sealed[1] ?? '') : part.length);
  }, 0);
}

/**
 * A line of dossier text with its censor tape. `[[words]]` are taped over
 * and only show while the pointer rests on them or they have keyboard focus
 * (nothing keeps them open); `[[#18]]` is a permanent bar 18 characters wide
 * with nothing behind it, for what never leaves the file (a registry number,
 * the company's size). Screen readers read peekable words as plain text and
 * hear "redacted" for the permanent bars.
 *
 * `limit` cuts the line at that many characters, for typing it out (see
 * TypedRedactedText); a cut line is decoration only, so it isn't focusable.
 */
export function RedactedText({ text, limit }: { text: string; limit?: number }) {
  const t = useTranslations('tatakae');
  const typing = limit !== undefined;
  let left = limit ?? Number.POSITIVE_INFINITY;

  return text.split(TAPE).map((part, index) => {
    if (left <= 0) return null;
    const room = left;
    if (index % 2 === 0) {
      left -= part.length;
      return part.slice(0, room);
    }
    const sealed = SEALED.exec(part);
    if (sealed) {
      const width = barWidth(sealed[1] ?? '');
      left -= width;
      return (
        // biome-ignore lint/suspicious/noArrayIndexKey: a fixed split of one string
        <span key={index}>
          <span
            aria-hidden="true"
            className="redaction-bar inline-block h-[1.05em] max-w-full translate-y-[0.15em] rounded-[2px]"
            style={{ width: `${Math.min(width, room)}ch` }}
          />
          {!typing && <span className="sr-only">{t('censored')}</span>}
        </span>
      );
    }
    left -= part.length;
    return (
      <span
        // biome-ignore lint/suspicious/noArrayIndexKey: a fixed split of one string
        key={index}
        // Focus lifts the tape like hover does, so keyboard users can read it too.
        tabIndex={typing ? undefined : 0}
        title={typing ? undefined : t('redacted')}
        className="redaction-bar cursor-help rounded-[2px] px-0.5 text-transparent box-decoration-clone transition-colors duration-200 select-none hover:bg-none hover:bg-ctp-red/15 hover:text-ctp-text hover:shadow-none focus-visible:bg-none focus-visible:bg-ctp-red/15 focus-visible:text-ctp-text focus-visible:shadow-none focus-visible:outline-1 focus-visible:outline-ctp-red motion-reduce:transition-none"
      >
        {part.slice(0, room)}
      </span>
    );
  });
}

/**
 * RedactedText typed out like a teleprinter: the tape goes on as the words
 * come in, then it settles into the regular line. Screen readers get the
 * whole line from the start.
 */
export function TypedRedactedText({
  text,
  delay = 0,
  msPerChar = 16,
}: {
  text: string;
  delay?: number;
  msPerChar?: number;
}) {
  const t = useTranslations('tatakae');
  const total = tapeLength(text);
  const typed = useTyped(total, delay, msPerChar);

  if (typed >= total) return <RedactedText text={text} />;
  return (
    <>
      <span className="sr-only">
        {text.replace(/\[\[#\d{1,2}\]\]/g, t('censored')).replace(/\[\[([^\]]+)\]\]/g, '$1')}
      </span>
      <span aria-hidden="true">
        <RedactedText text={text} limit={typed} />
        {typed > 0 && (
          <span className="caret-blink ml-px inline-block h-[1em] w-[0.5ch] translate-y-[0.15em] bg-ctp-red" />
        )}
      </span>
    </>
  );
}
