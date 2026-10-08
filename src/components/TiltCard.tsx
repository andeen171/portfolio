'use client';

import { type HTMLAttributes, useEffect, useRef, useState } from 'react';

/** Maximum tilt, in degrees, at the card's edges. */
const MAX_TILT = 14;
/** A touch that travels further than this is a scroll/swipe, not a tap. */
const TAP_SLOP = 10;

const POINTER_PROPERTIES = ['--pointer-x', '--pointer-y', '--rotate-x', '--rotate-y'] as const;

/** Drops the inline pointer properties so the stylesheet's resting values apply. */
function clearPointer(element: HTMLElement | null) {
  for (const name of POINTER_PROPERTIES) element?.style.removeProperty(name);
}

/**
 * A card that tilts toward the pointer and publishes where the pointer is as
 * CSS custom properties, for the foil layers inside it to read:
 *
 * - `--pointer-x` / `--pointer-y` — position over the card, `0%`–`100%`.
 * - `--rotate-x` / `--rotate-y`   — the current tilt.
 *
 * It also owns the card's `data-active` state, which is the single switch the
 * stylesheet keys every hover visual off:
 *
 * - **Mouse / pen** — active while the pointer is over the card.
 * - **Touch** — a tap pins the card active (lit from where it was tapped) and
 *   a second tap, or a tap anywhere else, releases it. Touches that turn into
 *   a scroll or a carousel swipe are ignored, so the card never fights the
 *   gesture it sits in.
 *
 * Pointer moves are coalesced to one style write per frame, and the work is
 * all custom properties on this one element — nothing re-renders while the
 * pointer moves.
 */
export const TiltCard = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);

  const setPointer = (clientX: number, clientY: number, tilt = 1) => {
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));

    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const { style } = element;
      style.setProperty('--pointer-x', `${x * 100}%`);
      style.setProperty('--pointer-y', `${y * 100}%`);
      style.setProperty('--rotate-x', `${(0.5 - y) * MAX_TILT * tilt}deg`);
      style.setProperty('--rotate-y', `${(x - 0.5) * MAX_TILT * tilt}deg`);
    });
  };

  const resetPointer = () => {
    cancelAnimationFrame(frame.current);
    clearPointer(ref.current);
  };

  // A pinned card lets go when the user taps anywhere outside it.
  useEffect(() => {
    if (!pinned) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) {
        setPinned(false);
        cancelAnimationFrame(frame.current);
        clearPointer(ref.current);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [pinned]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return (
    <div
      ref={ref}
      data-active={hovered || pinned || undefined}
      data-tracking={hovered || undefined}
      className={className}
      onPointerEnter={(event) => {
        if (event.pointerType === 'touch') return;
        setHovered(true);
        setPointer(event.clientX, event.clientY);
      }}
      onPointerMove={(event) => {
        if (event.pointerType === 'touch') return;
        setPointer(event.clientX, event.clientY);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'touch') return;
        setHovered(false);
        resetPointer();
      }}
      onPointerDown={(event) => {
        if (event.pointerType === 'touch') {
          touchStart.current = { x: event.clientX, y: event.clientY };
        }
      }}
      onPointerCancel={() => {
        touchStart.current = null;
      }}
      onPointerUp={(event) => {
        const start = touchStart.current;
        touchStart.current = null;
        if (event.pointerType !== 'touch' || !start) return;
        if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > TAP_SLOP) return;

        if (pinned) {
          setPinned(false);
          resetPointer();
        } else {
          setPinned(true);
          // Light the card from where it was tapped, with a gentler tilt than
          // a live pointer gets — it holds still, so it should read as a pose.
          setPointer(event.clientX, event.clientY, 0.5);
        }
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default TiltCard;
