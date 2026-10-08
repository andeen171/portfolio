'use client';

import { useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';
import Typed from 'typed.js';
import { cn } from '@/lib/utils';

interface TypedTextProps {
  /** Shown on the server, without JS and under reduced motion; typing starts by erasing it. */
  initial: string;
  /** Everything else to cycle through after `initial`. */
  strings: string[];
  typeSpeed?: number;
  backSpeed?: number;
  backDelay?: number;
  /** Classes for the visible text and cursor (e.g. the gradient). */
  className?: string;
}

/**
 * typed.js in a box that never changes size: an invisible copy of the longest
 * string shares the grid cell with the live text, so the block is always as
 * tall as its longest line-wrapped state and nothing below it jumps while
 * characters come and go. Decorative: callers give the element an accessible
 * name of its own.
 */
export default function TypedText({
  initial,
  strings,
  typeSpeed = 40,
  backSpeed = 30,
  backDelay = 2200,
  className,
}: TypedTextProps) {
  const textRef = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();
  // A stable dependency: callers pass fresh arrays on every render.
  const key = strings.join('\u0000');

  useEffect(() => {
    const element = textRef.current;
    if (reduceMotion || !element) return;
    // typed.js treats the element's current text as the first string and
    // starts by backspacing it, so the server-rendered value hands over
    // seamlessly.
    const typed = new Typed(element, {
      strings: key.split('\u0000'),
      typeSpeed,
      backSpeed,
      backDelay,
      startDelay: 0,
      loop: true,
      smartBackspace: true,
      contentType: 'null',
    });
    return () => {
      typed.destroy();
      // destroy() empties the element. Put the initial text back so a re-run
      // (new strings after a locale switch, Strict Mode's remount) starts
      // from it again instead of from a blank line.
      element.textContent = initial;
    };
  }, [initial, key, reduceMotion, typeSpeed, backSpeed, backDelay]);

  const longest = [initial, ...strings].reduce((a, b) => (b.length > a.length ? b : a));

  return (
    <span aria-hidden="true" className="grid">
      {/* The trailing bar stands in for the typed.js cursor. */}
      <span className="invisible col-start-1 row-start-1">{longest}|</span>
      <span className={cn('col-start-1 row-start-1', className)}>
        <span ref={textRef}>{initial}</span>
      </span>
    </span>
  );
}
