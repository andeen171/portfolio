'use client';

import { type CatppuccinColors, flavors } from '@catppuccin/palette';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useCtpStore } from '@/store';

/**
 * Cheap deterministic string hash (djb2). Same input always yields the same
 * number, so seeds are stable across SSR and client renders — no hydration
 * mismatch and no `Math.random` at render time.
 */
function hashString(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return hash >>> 0;
}

/** Iridescent accent ramp we pick from. Ordered around the cool→warm arc so
 *  adjacent indices are visually related and any 2–3 consecutive picks blend
 *  smoothly rather than clashing. */
const FOIL_KEYS = [
  'teal',
  'sky',
  'sapphire',
  'blue',
  'lavender',
  'mauve',
  'pink',
] as const satisfies readonly (keyof CatppuccinColors)[];

type Rgb = { r: number; g: number; b: number };

function rgba(c: Rgb, a: number): string {
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${a})`;
}

/**
 * A holographic "foil" shimmer layer driven by the pointer-tracked CSS custom
 * properties (`--bg-x` / `--bg-y`) set by the enclosing {@link GlareCard}.
 * Render it as an absolutely-positioned background behind content inside any
 * descendant of a GlareCard (e.g. the art window of a skill card).
 *
 * Rather than sliding one fixed rainbow around (which could land the visible
 * window on a dark seam), the foil is COMPOSED per card: the seed deterministically
 * selects 2–3 distinct accents from the active flavor's palette and blends them
 * into a full-coverage diagonal gradient. By construction there is no dark gap to
 * land on, so every seed renders a valid, visible, colourful window. A moving
 * sheen band and the pointer-tracked `--bg-x`/`--bg-y` add the holographic shimmer.
 *
 * `seed` (typically a skill `_id` or name) gives each card a distinct colour trio,
 * angle and sheen offset so a row of cards doesn't all glint the same. It is
 * deterministic and SSR-safe. It reads the live palette so the foil follows the
 * active flavor, and is dialled back on the light `latte` flavor for legibility.
 */
export const FoilLayer = ({ className, seed }: { className?: string; seed?: string }) => {
  const flavor = useCtpStore((state) => state.flavor);
  const [colors, setColors] = useState<CatppuccinColors>(flavors[flavor].colors);

  useEffect(() => {
    setColors(flavors[flavor].colors);
  }, [flavor]);

  const isLightTheme = flavor === 'latte';

  const h = seed ? hashString(seed) : 0;

  // Pick 3 distinct accents by walking the ramp from a seeded start with a
  // seeded, coprime-ish stride so adjacent picks stay distinct but related.
  const start = h % FOIL_KEYS.length;
  const stride = 2 + ((h >> 5) % 2); // 2 or 3 — both coprime with 7 (ramp length)
  const pick = (n: number): Rgb => {
    const key = FOIL_KEYS[(start + n * stride) % FOIL_KEYS.length] ?? 'lavender';
    return colors[key].rgb;
  };
  const cA = pick(0);
  const cB = pick(1);
  const cC = pick(2);

  const seedAngle = 100 + ((h >> 9) % 80); // 100–179deg — diagonal, varied
  // Per-card resting sheen offset so a row doesn't glint from the same spot.
  const sheenSeed = (h >> 3) % 100; // 0–99 %

  // Colour saturation of the blend. Rich on dark flavors; pulled back on latte
  // so light icons stay crisp, but still clearly colourful.
  const a = isLightTheme ? 0.5 : 0.85;

  const foilStyle = {
    // Full-coverage iridescent blend — no positional dark gap is possible.
    '--foil-blend': `linear-gradient(${seedAngle}deg, ${rgba(cA, a)} 0%, ${rgba(cB, a * 0.95)} 45%, ${rgba(cC, a)} 100%)`,
    // A soft radial hot-spot that follows the pointer for a lively shimmer.
    '--foil-spot': `radial-gradient(120% 120% at calc(var(--bg-x, 50%)) calc(var(--bg-y, 50%)), ${rgba(
      colors.text.rgb,
      isLightTheme ? 0.18 : 0.32
    )} 0%, transparent 55%)`,
    // A diagonal moving sheen band tracked by the pointer for the holo streak.
    '--foil-sheen': `linear-gradient(115deg, transparent 30%, ${rgba(
      colors.text.rgb,
      isLightTheme ? 0.14 : 0.28
    )} 47%, ${rgba(colors.text.rgb, 0)} 60%) calc(${sheenSeed}% + var(--bg-x, 50%) - 50%) calc(${sheenSeed}% + var(--bg-y, 50%) - 50%)/250% 250% no-repeat`,
    background: 'var(--foil-spot), var(--foil-sheen), var(--foil-blend)',
    backgroundBlendMode: isLightTheme
      ? 'soft-light, screen, normal'
      : 'screen, color-dodge, normal',
    opacity: isLightTheme ? 0.6 : 0.92,
  } as React.CSSProperties;

  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0', className)}>
      {/* A dark seat so light icons keep contrast even where the foil is pale. */}
      <div className="absolute inset-0 bg-ctp-crust/70" />
      <div className="absolute inset-0" style={foilStyle} />
    </div>
  );
};

export default FoilLayer;
