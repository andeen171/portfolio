'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

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

/**
 * A vertical timeline grouped by year. The year sits in a sticky rail on the
 * left while its entries scroll past, and a beam of light — with a bright
 * head, like the shooting stars behind it — fills the rail as you read.
 */
export const Timeline = ({ data, yearAs: Year = 'h3' }: TimelineProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  // The rail has to follow the content's real height: cards expand, fonts and
  // images load late, and the viewport reflows. A one-off measurement on mount
  // leaves the beam short (or overshooting) after any of those.
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => setHeight(element.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 20%', 'end 40%'],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div className="w-full" ref={containerRef}>
      <div ref={ref} className="relative mx-auto max-w-7xl pb-12">
        {data.map((item, index) => (
          <div
            key={item.id || `${item.title}-${index}`}
            className="flex justify-start pt-14 first:pt-0 md:gap-8 md:pt-28 md:first:pt-2"
          >
            {/* Sticky rail: the node on every screen, the year beside it from md up.
                Each breakpoint renders its own year heading; the other is display:none,
                so assistive tech only ever meets one. */}
            <div className="sticky top-24 z-20 w-0 shrink-0 self-start md:top-32 md:w-44 lg:w-56">
              <div
                aria-hidden
                className="absolute top-0 left-0 flex size-8 items-center justify-center rounded-full bg-ctp-base ring-1 ring-ctp-surface1 md:size-10"
              >
                <div className="size-3 rounded-full bg-linear-to-br from-ctp-teal to-ctp-lavender shadow-[0_0_10px_var(--catppuccin-color-teal)] md:size-3.5" />
              </div>
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
              {/* Phones have no room for a rail column, so the year leads its group. */}
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

        <div
          aria-hidden
          style={{ height }}
          className="pointer-events-none absolute top-0 left-4 z-10 w-0.5 -translate-x-1/2 md:left-5"
        >
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-ctp-surface1 to-transparent mask-[linear-gradient(to_bottom,transparent_0%,black_6%,black_94%,transparent_100%)]" />
          {/* Reduced motion swaps the scroll-linked beam for a still one. Done in
              CSS rather than with useReducedMotion so the server and client
              render the same markup. */}
          <div className="absolute inset-0 hidden rounded-full bg-linear-to-b from-transparent via-ctp-teal/70 to-ctp-lavender/40 motion-reduce:block" />
          <motion.div
            style={{ height: heightTransform, opacity: opacityTransform }}
            className="absolute inset-x-0 top-0 rounded-full bg-linear-to-t from-ctp-teal via-ctp-lavender/70 via-15% to-transparent motion-reduce:hidden"
          />
          <motion.div
            style={{ top: heightTransform, opacity: opacityTransform }}
            className="absolute left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ctp-teal shadow-[0_0_12px_3px_var(--catppuccin-color-teal)] motion-reduce:hidden"
          />
        </div>
      </div>
    </div>
  );
};
