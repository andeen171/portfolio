'use client';

import { type CatppuccinColors, flavors } from '@catppuccin/palette';
import { useEffect, useState } from 'react';
import { type Hsl, hslToRgbUnit } from '@/lib/logoColor';
import { cn } from '@/lib/utils';
import { useCtpStore } from '@/store';

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

/** Cheap deterministic hash (djb2). Varies the resting angle/sheen per card so
 *  a row of cards doesn't all glint the same. Deterministic and SSR-safe — no
 *  `Math.random` at render time. */
function hashString(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return hash >>> 0;
}

/**
 * The holographic foil layer inside a skill card's art window.
 *
 * This is the only foil renderer: CSS gradients driven by the pointer-tracked
 * custom properties (`--bg-x` / `--bg-y`, `--m-x` / `--m-y`) published by the
 * enclosing {@link GlareCard}. (An earlier WebGL shader build of this layer was
 * dropped — the effect reads the same in CSS for a fraction of the cost, and
 * there is nothing left to lose to a context reset.)
 *
 * The layer has three states, expressed with the `--foil-resting` /
 * `--foil-lit` custom properties (defined in `globals.css`):
 *
 * - **Resting** — a full-coverage diagonal gradient fills the window, dimmed
 *   to a subtle sheen so an idle grid of 66 cards stays calm.
 * - **Hover / tap-active** — the resting gradient brightens to full strength
 *   and the pointer-tracked spot + sheen join in, so the foil shimmers as the
 *   card is tilted. `data-pressed` mirrors the hover state, so tapping a card
 *   on touch triggers exactly the same visuals as hovering it.
 *
 * The colours come from the logo when it has one (`logoHsl`) and otherwise
 * from a seeded pick of palette accents, so every card's foil belongs to the
 * icon sitting on it. It reads the live Catppuccin palette so the foil follows
 * the active flavor, and is dialled back on the light `latte` flavor for
 * legibility.
 */
export const FoilLayer = ({
  className,
  seed,
  logoHsl,
}: {
  className?: string;
  /** Stable per-skill string — usually the document `_id`. */
  seed?: string;
  /** Dominant logo colour, when the logo has one; the foil is biased toward it. */
  logoHsl?: Hsl | null;
}) => {
  const flavor = useCtpStore((state) => state.flavor);
  const [colors, setColors] = useState<CatppuccinColors>(flavors[flavor].colors);

  useEffect(() => {
    setColors(flavors[flavor].colors);
  }, [flavor]);

  const isLightTheme = flavor === 'latte';

  const h = seed ? hashString(seed) : 0;

  // The blend colours come from the logo itself when it carries one. The hue
  // is the logo's; the other stops are nudged around the wheel so the gradient
  // doesn't read flat. Without a logo colour we pick palette accents by seed.
  const tint = logoHsl
    ? hslToRgbUnit({ h: logoHsl.h, s: Math.min(1, logoHsl.s + 0.15), l: 0.6 })
    : null;
  const tintA = logoHsl
    ? hslToRgbUnit({ h: logoHsl.h, s: Math.min(1, logoHsl.s + 0.05), l: 0.55 })
    : null;
  const tintC = logoHsl
    ? hslToRgbUnit({ h: (logoHsl.h + 30) % 360, s: Math.min(1, logoHsl.s + 0.1), l: 0.62 })
    : null;
  const toRgb = (unit: [number, number, number]): Rgb => ({
    r: Math.round(unit[0] * 255),
    g: Math.round(unit[1] * 255),
    b: Math.round(unit[2] * 255),
  });

  const cA = tintA ? toRgb(tintA) : colors[FOIL_KEYS[h % FOIL_KEYS.length] ?? 'lavender'].rgb;
  const cB = tint ? toRgb(tint) : colors[FOIL_KEYS[(h + 2) % FOIL_KEYS.length] ?? 'sky'].rgb;
  const cC = tintC ? toRgb(tintC) : colors[FOIL_KEYS[(h + 4) % FOIL_KEYS.length] ?? 'teal'].rgb;

  const seedAngle = 115 + ((h >> 9) % 60); // 115–174deg — diagonal, varied
  // Per-card resting sheen offset so a row doesn't glint from the same spot.
  const sheenSeed = (h >> 3) % 100; // 0–99 %

  // Colour saturation of the blend. Rich on dark flavors; pulled back on latte
  // so light icons stay crisp, but still clearly colourful.
  const a = isLightTheme ? 0.5 : 0.85;

  const foilStyle = {
    // Full-coverage iridescent blend — always present, so there is no dark gap
    // to land on; its visibility is ramped by --foil-resting / --foil-lit.
    '--foil-blend': `linear-gradient(${seedAngle}deg, ${rgba(cA, a)} 0%, ${rgba(cB, a * 0.95)} 45%, ${rgba(cC, a)} 100%)`,
    // A soft radial hot-spot that follows the pointer for a lively shimmer.
    '--foil-spot': `radial-gradient(120% 120% at var(--m-x, 50%) var(--m-y, 50%), ${rgba(
      colors.text.rgb,
      isLightTheme ? 0.18 : 0.32
    )} 0%, transparent 55%)`,
    // A diagonal sheen band tracked by the pointer for the holo streak.
    '--foil-sheen': `linear-gradient(115deg, transparent 30%, ${rgba(
      colors.text.rgb,
      isLightTheme ? 0.14 : 0.28
    )} 47%, ${rgba(colors.text.rgb, 0)} 60%) calc(${sheenSeed}% + var(--bg-x, 50%) - 50%) calc(${sheenSeed}% + var(--bg-y, 50%) - 50%)/250% 250% no-repeat`,
  } as React.CSSProperties;

  return (
    <div aria-hidden className={cn('foil-layer pointer-events-none absolute inset-0', className)}>
      {/* A dark seat so light icons keep contrast even where the foil is pale. */}
      <div className="absolute inset-0 bg-ctp-crust/70" />
      {/* Resting tint: always on, ramps from a subtle sheen to full strength
          when the card is hovered/pressed (see .foil-layer in globals.css). */}
      <div
        className="foil-resting absolute inset-0"
        style={{ background: 'var(--foil-blend)', opacity: 'var(--foil-resting, 0.3)' }}
      />
      {/* Lit layers: only visible while hovered/pressed, tracked to the pointer. */}
      <div
        className="foil-lit absolute inset-0"
        style={{
          background: 'var(--foil-spot), var(--foil-sheen), var(--foil-blend)',
          backgroundBlendMode: isLightTheme
            ? 'soft-light, screen, normal'
            : 'screen, color-dodge, normal',
          opacity: 'var(--foil-lit, 0)',
        }}
      />
    </div>
  );
};

export default FoilLayer;
