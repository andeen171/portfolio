'use client';

import { type HTMLAttributes, type Ref, useEffect, useRef, useState } from 'react';

/** Maximum tilt, in degrees, at the card's edges. */
const MAX_TILT = 14;
/** How long a finger rests on a grid card before dragging steers it. */
const HOLD_MS = 280;
/** Movement before the hold completes that makes the touch a scroll/swipe. */
const TOUCH_SLOP = 10;

const POINTER_PROPERTIES = ['--pointer-x', '--pointer-y', '--rotate-x', '--rotate-y'] as const;

/** Drops the inline pointer properties so the stylesheet's values apply. */
function clearPointer(element: HTMLElement | null) {
  for (const name of POINTER_PROPERTIES) element?.style.removeProperty(name);
}

type TouchState = { x: number; y: number; steering: boolean; timer: number };

type TiltCardProps = HTMLAttributes<HTMLDivElement> & {
  ref?: Ref<HTMLDivElement>;
};

/**
 * A card that tilts toward the pointer and publishes where it is as CSS
 * custom properties, for the foil layers inside it to read:
 *
 * - `--pointer-x` / `--pointer-y` — position over the card, `0%`–`100%`.
 * - `--rotate-x` / `--rotate-y`   — the current tilt.
 *
 * It also owns `data-active`, the single switch the stylesheet keys every lit
 * visual off — on while a mouse hovers or a finger steers — and
 * `data-tracking`, on while something is steering.
 *
 * A finger steers by pressing and holding, then dragging, so a quick swipe
 * stays a page scroll or carousel swipe and a tap stays a click.
 *
 * Pointer moves are coalesced to one style write per frame, and the work is
 * all custom properties on this one element — nothing re-renders while the
 * pointer moves.
 */
export const TiltCard = ({ ref, className, children, onClickCapture, ...props }: TiltCardProps) => {
  const element = useRef<HTMLDivElement | null>(null);
  const frame = useRef(0);
  const touchState = useRef<TouchState | null>(null);
  // A press-and-hold that steered ends in a click; it mustn't open the card.
  const swallowClick = useRef(false);
  const [steering, setSteering] = useState(false);

  const setRefs = (node: HTMLDivElement | null) => {
    element.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  const track = (clientX: number, clientY: number) => {
    const node = element.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));

    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const { style } = node;
      style.setProperty('--pointer-x', `${x * 100}%`);
      style.setProperty('--pointer-y', `${y * 100}%`);
      style.setProperty('--rotate-x', `${(0.5 - y) * MAX_TILT}deg`);
      style.setProperty('--rotate-y', `${(x - 0.5) * MAX_TILT}deg`);
    });
  };

  const release = () => {
    cancelAnimationFrame(frame.current);
    clearPointer(element.current);
    setSteering(false);
  };

  const endTouch = () => {
    const state = touchState.current;
    touchState.current = null;
    if (!state) return;
    window.clearTimeout(state.timer);
    if (state.steering) {
      // The click (if any) follows within the same gesture; don't let the
      // flag outlive it and eat the next real tap.
      swallowClick.current = true;
      window.setTimeout(() => {
        swallowClick.current = false;
      }, 400);
      release();
    }
  };

  // While a finger steers, its moves must not scroll the page or swipe the
  // carousel. That needs a non-passive native listener: React's touch
  // handlers are passive and can't cancel the default.
  useEffect(() => {
    const node = element.current;
    if (!node) return;
    const onTouchMove = (event: TouchEvent) => {
      if (!touchState.current?.steering) return;
      event.preventDefault();
      event.stopPropagation();
    };
    const onContextMenu = (event: Event) => {
      if (touchState.current) event.preventDefault();
    };
    node.addEventListener('touchmove', onTouchMove, { passive: false });
    node.addEventListener('contextmenu', onContextMenu);
    return () => {
      node.removeEventListener('touchmove', onTouchMove);
      node.removeEventListener('contextmenu', onContextMenu);
    };
  }, []);

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      if (touchState.current) window.clearTimeout(touchState.current.timer);
    },
    []
  );

  return (
    <div
      ref={setRefs}
      data-active={steering || undefined}
      data-tracking={steering || undefined}
      className={className}
      onPointerEnter={(event) => {
        if (event.pointerType === 'touch') return;
        setSteering(true);
        track(event.clientX, event.clientY);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== 'touch') release();
      }}
      onPointerDown={(event) => {
        if (event.pointerType !== 'touch' || !event.isPrimary) return;
        const { clientX: x, clientY: y } = event;

        const state: TouchState = { x, y, steering: false, timer: 0 };
        state.timer = window.setTimeout(() => {
          state.steering = true;
          setSteering(true);
          track(state.x, state.y);
          navigator.vibrate?.(8);
        }, HOLD_MS);
        touchState.current = state;
      }}
      onPointerMove={(event) => {
        if (event.pointerType !== 'touch') {
          track(event.clientX, event.clientY);
          return;
        }
        const state = touchState.current;
        if (!state) return;
        if (state.steering) {
          track(event.clientX, event.clientY);
        } else if (Math.hypot(event.clientX - state.x, event.clientY - state.y) > TOUCH_SLOP) {
          // Moved before the hold completed: it's a scroll or a swipe.
          window.clearTimeout(state.timer);
          touchState.current = null;
        }
      }}
      onPointerUp={(event) => {
        if (event.pointerType === 'touch') endTouch();
      }}
      onPointerCancel={(event) => {
        if (event.pointerType === 'touch') endTouch();
      }}
      onClickCapture={(event) => {
        if (swallowClick.current) {
          swallowClick.current = false;
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        onClickCapture?.(event);
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default TiltCard;
