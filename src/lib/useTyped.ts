import { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/**
 * How many of `total` characters have been typed out: the first lands
 * `delay` ms after mount, then one every `msPerChar`. Under reduced motion
 * everything is there at once.
 */
export function useTyped(total: number, delay = 0, msPerChar = 16): number {
  const reduced = usePrefersReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const start = performance.now() + delay;
    let frame = requestAnimationFrame(function tick(now) {
      const typed = Math.min(total, Math.max(0, Math.floor((now - start) / msPerChar)));
      setCount(typed);
      if (typed < total) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [total, delay, msPerChar, reduced]);

  return reduced ? total : count;
}
