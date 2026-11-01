'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import { parseTagline, taglineText } from '@/lib/tagline';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { cn } from '@/lib/utils';

const TYPE_MS = 70;
const BACK_MS = 40;
/** How long a finished sentence stays up before the next word changes. */
const HOLD_MS = 2600;
/** The beat between a word and the slower word it carries into. */
const CARRY_MS = 450;

interface TypedTaglineProps {
  /** The tagline as written in the Studio: `*lit*` words and `{a|b}` slots. */
  source: string;
  className?: string;
}

/**
 * The hero line with words that retype themselves, like an odometer: the
 * first slot cycles through its options, and each time it comes back round
 * the next slot moves on once. So "systems" turns into "apps" and
 * "platforms" every few seconds, while "money" only becomes "people" after
 * all of them have had their turn. Each change erases only what differs.
 *
 * An invisible copy holding every slot's longest option shares the grid cell
 * with the live line, so the paragraph never changes height mid-word. Screen
 * readers get the first sentence once; without JS or under reduced motion
 * that same sentence simply stays.
 */
export default function TypedTagline({ source, className }: TypedTaglineProps) {
  const runs = useMemo(() => parseTagline(source), [source]);
  const slots = useMemo(
    () =>
      runs.flatMap((run) =>
        run.pieces.flatMap((piece) => (typeof piece === 'string' ? [] : [piece.options]))
      ),
    [runs]
  );
  const reduceMotion = usePrefersReducedMotion();
  const [texts, setTexts] = useState(() => slots.map((options) => options[0] ?? ''));
  const [active, setActive] = useState(0);

  useEffect(() => {
    const live = slots.map((options) => options[0] ?? '');
    setTexts(live);
    setActive(0);
    if (reduceMotion || slots.length === 0) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    // Never resolves once cancelled, which simply parks the loop for GC.
    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        timer = setTimeout(resolve, ms);
      });
    const show = () => {
      if (!cancelled) setTexts([...live]);
    };
    const indices = slots.map(() => 0);

    (async () => {
      while (!cancelled) {
        await sleep(HOLD_MS);
        for (let slot = 0; slot < slots.length && !cancelled; slot++) {
          const options = slots[slot] as string[];
          indices[slot] = ((indices[slot] ?? 0) + 1) % options.length;
          const target = options[indices[slot] ?? 0] ?? '';
          setActive(slot);
          while (!cancelled && !target.startsWith(live[slot] ?? '')) {
            live[slot] = (live[slot] ?? '').slice(0, -1);
            show();
            await sleep(BACK_MS);
          }
          while (!cancelled && live[slot] !== target) {
            live[slot] = target.slice(0, (live[slot] ?? '').length + 1);
            show();
            await sleep(TYPE_MS);
          }
          // Only a slot that wrapped back to its first option moves the next.
          if (indices[slot] !== 0) break;
          await sleep(CARRY_MS);
        }
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [slots, reduceMotion]);

  const longest = slots.map((options) =>
    options.reduce((a, b) => (b.length > a.length ? b : a), '')
  );

  const render = (words: string[], caret: boolean) =>
    runs.map((run, runIndex) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: a fixed parse of one string
      <span key={runIndex} className={cn(run.lit && 'animated-gradient-text')}>
        {run.pieces.map((piece, pieceIndex) =>
          typeof piece === 'string' ? (
            // biome-ignore lint/suspicious/noArrayIndexKey: a fixed parse of one string
            <Fragment key={pieceIndex}>{piece}</Fragment>
          ) : (
            <span key={`slot-${piece.slot}`} className={cn(!run.lit && 'animated-gradient-text')}>
              {words[piece.slot]}
              <span
                className={cn(
                  'ml-0.5 inline-block h-[0.9em] w-[3px] translate-y-[0.1em] rounded-full bg-ctp-lavender align-baseline',
                  caret && piece.slot === active ? 'caret-blink' : 'invisible'
                )}
              />
            </span>
          )
        )}
      </span>
    ));

  return (
    <p className={cn('grid', className)}>
      <span className="sr-only">{taglineText(runs)}</span>
      <span aria-hidden="true" className="invisible col-start-1 row-start-1">
        {render(longest, false)}
      </span>
      <span aria-hidden="true" className="col-start-1 row-start-1">
        {render(texts, !reduceMotion)}
      </span>
    </p>
  );
}
