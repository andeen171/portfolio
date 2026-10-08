'use client';

import {
  animate,
  type MotionValue,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface HeroStat {
  key: string;
  value: number;
  /** Printed after the number, e.g. "+" for "6+ years". */
  suffix?: string;
  label: string;
}

/**
 * - `idle`  the server-rendered final numbers stay as they are
 * - `armed` numbers reset to zero, waiting to scroll into view
 * - `play`  counting up
 */
type Phase = 'idle' | 'armed' | 'play';

/** Below this opacity the row's entrance fade hasn't really been seen yet. */
const UNSEEN_OPACITY = 0.35;

const COLUMNS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
};

function StatValue({ value, phase, delay }: { value: number; phase: Phase; delay: number }) {
  // Starts at the final value so the first client render matches the
  // server's, and the numbers are right without JS.
  const count = useMotionValue(value);
  const rounded: MotionValue<number> = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    if (phase === 'armed') count.jump(0);
    if (phase !== 'play') return;
    const controls = animate(count, value, { duration: 1.6, delay, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [phase, count, value, delay]);

  return <motion.span>{rounded}</motion.span>;
}

/**
 * The hero's headline numbers. They count up the first time they come into
 * view, but only when nobody has seen the final numbers yet: the
 * server-rendered values stay put under reduced motion, and when the row was
 * already visible by the time JS ran (a slow hydration), because snapping
 * from "6+" back to 0 reads as a glitch.
 */
export default function HeroStats({ stats, label }: { stats: HeroStat[]; label: string }) {
  const ref = useRef<HTMLDListElement>(null);
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>('idle');

  useEffect(() => {
    const element = ref.current;
    if (!element || reduceMotion) return;

    const rect = element.getBoundingClientRect();
    const onScreen = rect.bottom > 0 && rect.top < window.innerHeight;
    // The row fades in through `@starting-style`; while that is still near
    // transparent, resetting to zero goes unnoticed.
    const faint = Number.parseFloat(getComputedStyle(element).opacity) < UNSEEN_OPACITY;
    if (onScreen && !faint) return;

    setPhase('armed');
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setPhase('play');
        observer.disconnect();
      },
      { threshold: 0.4 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [reduceMotion]);

  return (
    <dl
      ref={ref}
      aria-label={label}
      className={cn(
        'grid gap-px overflow-hidden rounded-2xl bg-ctp-surface1/50 ring-1 ring-ctp-surface1/60 backdrop-blur-md',
        'transition-[opacity,translate] delay-[650ms] duration-700 ease-out starting:translate-y-3 starting:opacity-0',
        'motion-reduce:transition-none',
        COLUMNS[stats.length]
      )}
    >
      {stats.map((stat, index) => (
        <div
          key={stat.key}
          className="flex flex-col-reverse justify-end gap-1 bg-ctp-mantle/75 px-4 py-3.5 sm:px-5"
        >
          <dt className="font-nf text-[0.6875rem] uppercase leading-snug tracking-wider text-ctp-subtext0">
            {stat.label}
          </dt>
          <dd className="font-nf text-2xl font-bold tabular-nums text-ctp-text sm:text-3xl">
            <StatValue value={stat.value} phase={phase} delay={index * 0.12} />
            {stat.suffix && <span className="text-ctp-teal">{stat.suffix}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
