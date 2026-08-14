/**
 * Cheap deterministic string hash (djb2). Same input always yields the same
 * number, so seeds are stable across SSR and client renders — no hydration
 * mismatch and no `Math.random` at render time.
 */
export function hashString(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return hash >>> 0;
}
