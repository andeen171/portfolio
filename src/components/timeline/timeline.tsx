'use client';

import { motion, useMotionValue, useMotionValueEvent, useScroll, useTransform } from 'motion/react';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface TimelineEntry {
  id?: string;
  title: string;
  /** A short caption under the year, e.g. "3 projects". */
  meta?: string;
  content: React.ReactNode;
}

interface TimelineProps {
  data: TimelineEntry[];
  /** Year heading level: h2 on a page under its h1, h3 in a home section. */
  yearAs?: 'h2' | 'h3';
}

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/**
 * A vertical timeline grouped by year. The year sits in a sticky column on
 * the left while its entries scroll past.
 *
 * Beside it runs a rail that stays put on screen: a map of the whole list,
 * with a dot for each year at the point where that year starts. A comet
 * fills the rail as you read, so it moves at a fraction of the page's speed
 * and you can see how far through the list you are. Each dot lights up as its
 * year reaches the top, and the latest one glows.
 */
export const Timeline = ({ data, yearAs: Year = 'h3' }: TimelineProps) => {
  const listRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  // Where each year starts, as a share of the scroll it takes to read the
  // list. Unknown until measured, so the dots only render on the client.
  const [stops, setStops] = useState<number[] | null>(null);
  const [reached, setReached] = useState(0);
  const stopsRef = useRef<number[]>([]);
  const progress = useMotionValue(0);
  const { scrollY } = useScroll();

  /**
   * Reading progress: 0 until the list's top reaches the rail's sticky line,
   * then 1 once its bottom is on screen. A short list (one that fits on
   * screen) still gets half its own height to fill over, and the span never
   * outruns the page, so the rail always fills by the time the page ends.
   * Measured live, so content loading or expanding above or inside the list
   * can't skew it.
   */
  const update = useCallback(() => {
    const list = listRef.current;
    const rail = railRef.current;
    if (!list || !rail) return;
    const rect = list.getBoundingClientRect();
    const line = Number.parseFloat(getComputedStyle(rail).top) || 0;
    const viewport = window.innerHeight;
    const pageEnd =
      document.documentElement.scrollHeight - viewport + line - (rect.top + window.scrollY);
    const span = Math.max(
      1,
      Math.min(Math.max(rect.height - (viewport - line), rect.height / 2), pageEnd)
    );
    const value = clamp((line - rect.top) / span);
    progress.set(value);
    setReached(value > 0 ? stopsRef.current.filter((stop) => stop <= value + 0.001).length : 0);
    return span;
  }, [progress]);

  // The stops follow the content's real layout: cards expand, fonts and
  // images load late, and the viewport reflows.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const span = update();
      if (!span) return;
      const groups = list.querySelectorAll<HTMLElement>('[data-timeline-group]');
      // A year starts where its heading does: below the group's top padding.
      const next = Array.from(groups, (group) =>
        clamp((group.offsetTop + Number.parseFloat(getComputedStyle(group).paddingTop)) / span)
      );
      stopsRef.current = next;
      setStops(next);
      update();
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [update]);

  useMotionValueEvent(scrollY, 'change', update);

  const head = useTransform(progress, (value) => `${value * 100}%`);

  return (
    <div className="w-full">
      <div ref={listRef} className="relative mx-auto max-w-7xl pb-12">
        {data.map((item, index) => (
          <div
            key={item.id || `${item.title}-${index}`}
            data-timeline-group
            className="flex justify-start pt-14 first:pt-0 md:gap-8 md:pt-28 md:first:pt-2"
          >
            {/* Sticky year column from md up. Each breakpoint renders its own
                year heading; the other is display:none, so assistive tech
                only ever meets one. */}
            <div className="sticky top-24 z-20 w-0 shrink-0 self-start md:top-32 md:w-44 lg:w-56">
              <div className="hidden pl-16 md:block">
                <Year className="animated-gradient-text font-nf text-4xl leading-10 font-extrabold tracking-tight lg:text-5xl lg:leading-10">
                  {item.title}
                </Year>
                {item.meta && (
                  <p className="mt-2 font-nf text-xs text-ctp-subtext0 latte:text-ctp-subtext1">
                    <span aria-hidden className="text-ctp-overlay1">
                      {'// '}
                    </span>
                    {item.meta}
                  </p>
                )}
              </div>
            </div>

            <div className="relative w-full min-w-0 pl-12 md:pl-0">
              {/* Phones have no room for a year column, so the year leads its group. */}
              <div className="mb-5 flex h-8 items-baseline gap-3 md:hidden">
                <Year className="animated-gradient-text font-nf text-2xl leading-8 font-extrabold">
                  {item.title}
                </Year>
                {item.meta && (
                  <p className="font-nf text-xs text-ctp-subtext0 latte:text-ctp-subtext1">
                    <span aria-hidden className="text-ctp-overlay1">
                      {'// '}
                    </span>
                    {item.meta}
                  </p>
                )}
              </div>
              {item.content}
            </div>
          </div>
        ))}

        {/* The rail: sticky in a column that spans the list, as tall as the
            screen allows (and no taller than the list). Its track starts level
            with the middle of the year heading beside it. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-4 z-10 w-0.5 -translate-x-1/2 md:left-5"
        >
          <div
            ref={railRef}
            className="sticky top-24 h-[min(100%,calc(100svh-10rem))] md:top-32 md:h-[min(100%,calc(100svh-12rem))]"
          >
            <div className="absolute inset-x-0 top-4 bottom-0 md:top-5">
              <div className="absolute inset-0 rounded-full bg-linear-to-b from-ctp-surface1 via-ctp-surface1 to-transparent" />
              {/* Reduced motion keeps a still rail: the dots still light up as
                  their years pass, but nothing streams down it. Done in CSS so
                  the server and client render the same markup. */}
              <motion.div
                style={{ scaleY: progress }}
                className="absolute inset-0 origin-top rounded-full bg-linear-to-b from-ctp-lavender/30 via-ctp-lavender/70 to-ctp-teal motion-reduce:hidden"
              />
              <motion.div
                style={{ top: head }}
                className="absolute left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ctp-teal shadow-[0_0_14px_4px_var(--catppuccin-color-teal)] motion-reduce:hidden"
              />
              {stops?.map((stop, index) => {
                const lit = index < reached;
                const current = index === reached - 1;
                return (
                  <span
                    // One per year group, in order; the list never reorders.
                    // biome-ignore lint/suspicious/noArrayIndexKey: positional markers
                    key={index}
                    style={{ top: `${stop * 100}%` }}
                    className={cn(
                      'absolute left-1/2 grid size-3.5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ctp-base ring-2 transition-[box-shadow,scale] duration-500 md:size-4',
                      lit ? 'ring-ctp-teal/70' : 'ring-ctp-surface1',
                      current && 'scale-125 shadow-[0_0_12px_2px_var(--catppuccin-color-teal)]'
                    )}
                  >
                    <span
                      className={cn(
                        'size-1.5 rounded-full transition-colors duration-500 md:size-2',
                        lit ? 'bg-linear-to-br from-ctp-teal to-ctp-lavender' : 'bg-ctp-surface2'
                      )}
                    />
                    {current && (
                      <span className="absolute inset-0 rounded-full ring-1 ring-ctp-teal/60 motion-safe:animate-ping" />
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
