import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

/**
 * Whether the visitor asks for reduced motion, kept live. motion's
 * `useReducedMotion` reads the setting once on mount, so switching it on
 * while the page is open never reaches a component that is mid-animation.
 *
 * The server can't know the setting, so it renders "no preference" and
 * hydration picks up the real value right after.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  );
}
