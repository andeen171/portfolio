'use client';

import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';

const GLYPHS = 'アイウエオカキクケコサシスセソタチツテト戦え0123456789#%&@$';
const DURATION_MS = 1100;

/**
 * Text that "decrypts" the first time it scrolls into view: every letter
 * churns through katakana and symbols, then settles left to right. Renders
 * the real text on the server, without JS and under reduced motion; screen
 * readers only ever get the real text.
 */
export default function ScrambleText({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const [shown, setShown] = useState(text);

  useEffect(() => {
    setShown(text);
    const element = ref.current;
    if (reduceMotion || !element) return;

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const settled = Math.floor(((now - start) / DURATION_MS) * text.length);
          setShown(
            [...text]
              .map((char, index) =>
                index < settled || char === ' '
                  ? char
                  : (GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? char)
              )
              .join('')
          );
          if (settled < text.length) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 }
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [text, reduceMotion]);

  return (
    <>
      <span className="sr-only">{text}</span>
      <span ref={ref} aria-hidden="true">
        {shown}
      </span>
    </>
  );
}
