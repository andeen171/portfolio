'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Press-and-hold (or, with `hover`, rest-the-mouse) for `ms` to fire. Returns
 * whether it's charging, pointer handlers to spread on the target, and
 * `consumeClick`: true once right after it fired, so the click that ends a
 * long press can be swallowed instead of following a link.
 */
export function useHold(ms: number, onFire: () => void, { hover = false } = {}) {
  const [charging, setCharging] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const fired = useRef(false);
  const fire = useRef(onFire);
  fire.current = onFire;

  const cancel = useCallback(() => {
    clearTimeout(timer.current);
    setCharging(false);
  }, []);

  const start = useCallback(() => {
    clearTimeout(timer.current);
    fired.current = false;
    setCharging(true);
    timer.current = setTimeout(() => {
      fired.current = true;
      setCharging(false);
      fire.current();
    }, ms);
  }, [ms]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handlers = {
    onPointerEnter: (event: React.PointerEvent) => {
      if (hover && event.pointerType === 'mouse') start();
    },
    onPointerLeave: cancel,
    onPointerDown: (event: React.PointerEvent) => {
      // A mouse that's hovering is already charging; a click restarts nothing.
      if (!(hover && event.pointerType === 'mouse')) start();
    },
    onPointerUp: (event: React.PointerEvent) => {
      if (!(hover && event.pointerType === 'mouse')) cancel();
    },
    onPointerCancel: cancel,
    // A long press on touch screens would open the text/link menu instead.
    onContextMenu: (event: React.MouseEvent) => {
      if (charging || fired.current) event.preventDefault();
    },
  };

  const consumeClick = () => {
    const was = fired.current;
    fired.current = false;
    return was;
  };

  return { charging, handlers, consumeClick };
}
