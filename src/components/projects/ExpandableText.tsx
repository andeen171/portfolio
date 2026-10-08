'use client';

import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

// Body copy is text-sm on a 1.5rem line; the pre-hydration clamp uses it.
const LINE_REM = 1.5;

interface ExpandableTextProps {
  paragraphs: string[];
  /** Lines shown while collapsed. */
  lines?: number;
  moreLabel: string;
  lessLabel: string;
  className?: string;
}

/**
 * Long Sanity copy, clamped to a few lines with a toggle to read the rest.
 *
 * The height animates between two measured pixel values — not a guessed
 * max-height — so expanding is smooth whatever the length, and a
 * ResizeObserver keeps it right when the card reflows. The clamped text stays
 * in the DOM, so screen readers always get all of it.
 */
export default function ExpandableText({
  paragraphs,
  lines = 3,
  moreLabel,
  lessLabel,
  className,
}: ExpandableTextProps) {
  const id = useId();
  const innerRef = useRef<HTMLDivElement>(null);
  const [fullHeight, setFullHeight] = useState<number | null>(null);
  const [collapsedHeight, setCollapsedHeight] = useState(0);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;

    const measure = () => {
      const lineHeight = Number.parseFloat(getComputedStyle(inner).lineHeight) || 24;
      const budget = lines * lineHeight;
      // Cut at the bottom of the last whole line that fits the budget. The gap
      // between paragraphs isn't a multiple of the line height, so the budget
      // alone could land mid-line and leave half a row of glyphs showing.
      let cut = 0;
      for (const child of inner.children) {
        const paragraph = child as HTMLElement;
        const rows = Math.round(paragraph.offsetHeight / lineHeight);
        for (let row = 1; row <= rows; row++) {
          const bottom = paragraph.offsetTop + row * lineHeight;
          if (bottom > budget + 1) break;
          cut = bottom;
        }
      }
      setCollapsedHeight(cut || budget);
      setFullHeight(inner.offsetHeight);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(inner);
    return () => observer.disconnect();
  }, [lines]);

  // Until measured (SSR, first paint) the clamp is a plain max-height of the
  // same number of lines.
  const measured = fullHeight !== null;
  const canExpand = measured && fullHeight > collapsedHeight + 2;
  const clipped = !measured || (canExpand && !expanded);

  if (paragraphs.length === 0) return null;

  return (
    <div className={className}>
      <div
        id={id}
        style={
          measured
            ? { height: clipped ? collapsedHeight : fullHeight }
            : { maxHeight: `${lines * LINE_REM}rem` }
        }
        className={cn(
          'overflow-hidden transition-[height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
          clipped &&
            canExpand &&
            'mask-[linear-gradient(to_bottom,#000_calc(100%_-_1.5rem),transparent)]'
        )}
      >
        <div ref={innerRef} className="relative space-y-3 text-sm/6 text-pretty text-ctp-subtext1">
          {paragraphs.map((paragraph, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: a static list whose paragraphs may repeat
            <p key={index} className="whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {canExpand && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded((value) => !value)}
          className="mt-2 -ml-1 inline-flex items-center gap-1 rounded-md px-1 py-0.5 font-nf text-xs font-medium text-ctp-subtext0 latte:text-ctp-subtext1 transition-colors hover:text-ctp-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-lavender"
        >
          {expanded ? lessLabel : moreLabel}
          <ChevronDownIcon
            aria-hidden
            className={cn(
              'size-4 transition-transform duration-300 motion-reduce:transition-none',
              expanded && 'rotate-180'
            )}
          />
        </button>
      )}
    </div>
  );
}
