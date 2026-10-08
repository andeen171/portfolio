'use client';

import { type HTMLAttributes, type Ref, useEffect, useRef, useState } from 'react';

/** Maximum tilt, in degrees, at the card's edges. */
const MAX_TILT = 14;

const POINTER_PROPERTIES = ['--pointer-x', '--pointer-y', '--rotate-x', '--rotate-y'] as const;

/** Drops the inline pointer properties so the stylesheet's values apply. */
function clearPointer(element: HTMLElement | null) {
  for (const name of POINTER_PROPERTIES) element?.style.removeProperty(name);
}

type TiltCardProps = HTMLAttributes<HTMLDivElement> & {
  ref?: Ref<HTMLDivElement>;
  /** Hold the card lit regardless of the pointer (the detail view). */
  active?: boolean;
  /** Let the card sway on its own while no mouse is steering it, so the foil
   *  still moves on touch screens (see `[data-idle]` in skill-card.css). */
  idle?: boolean;
};

/**
 * A card that tilts toward a mouse or pen and publishes where it is as CSS
 * custom properties, for the foil layers inside it to read:
 *
 * - `--pointer-x` / `--pointer-y` — position over the card, `0%`–`100%`.
 * - `--rotate-x` / `--rotate-y`   — the current tilt.
 *
 * It also owns `data-active`, the single switch the stylesheet keys every
 * lit visual off: on while hovered, or always with `active`. Touch input is
 * left alone — a tap is a click, and swipes belong to the page or carousel.
 *
 * Pointer moves are coalesced to one style write per frame, and the work is
 * all custom properties on this one element — nothing re-renders while the
 * pointer moves.
 */
export const TiltCard = ({
  ref,
  active = false,
  idle = false,
  className,
  children,
  ...props
}: TiltCardProps) => {
  const element = useRef<HTMLDivElement | null>(null);
  const frame = useRef(0);
  const [hovered, setHovered] = useState(false);

  const setRefs = (node: HTMLDivElement | null) => {
    element.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  const track = (event: React.PointerEvent<HTMLDivElement>) => {
    const node = element.current;
    if (!node || event.pointerType === 'touch') return;
    const rect = node.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));

    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const { style } = node;
      style.setProperty('--pointer-x', `${x * 100}%`);
      style.setProperty('--pointer-y', `${y * 100}%`);
      style.setProperty('--rotate-x', `${(0.5 - y) * MAX_TILT}deg`);
      style.setProperty('--rotate-y', `${(x - 0.5) * MAX_TILT}deg`);
    });
  };

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return (
    <div
      ref={setRefs}
      data-active={hovered || active || undefined}
      data-tracking={hovered || undefined}
      data-idle={idle || undefined}
      className={className}
      onPointerEnter={(event) => {
        if (event.pointerType === 'touch') return;
        setHovered(true);
        track(event);
      }}
      onPointerMove={track}
      onPointerLeave={(event) => {
        if (event.pointerType === 'touch') return;
        setHovered(false);
        cancelAnimationFrame(frame.current);
        clearPointer(element.current);
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default TiltCard;
