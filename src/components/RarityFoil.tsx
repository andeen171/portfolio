'use client';

import { type CatppuccinColors, flavors } from '@catppuccin/palette';
import { useEffect, useState } from 'react';
import type { RarityTier } from '@/lib/rarity';
import { cn } from '@/lib/utils';
import { useCtpStore } from '@/store';

/**
 * The six-stop spectrum the holo gradients are built from ("sunpillars", after
 * the pokemon-cards-css naming). Derived from the live Catppuccin flavor rather
 * than hardcoded rainbow hues, so the foils stay in the site's colour world and
 * don't fluoresce on latte.
 */
const SUNPILLAR_KEYS = [
  'red',
  'peach',
  'yellow',
  'green',
  'sapphire',
  'mauve',
] as const satisfies readonly (keyof CatppuccinColors)[];

/**
 * Rarity foil layers, driven by the pointer-tracked custom properties the
 * enclosing {@link GlareCard} publishes (`--bg-x`/`--bg-y`, `--m-x`/`--m-y`,
 * `--pointer-from-center`, `--pointer-from-top`/`-left`).
 *
 * The actual gradients live in `globals.css`, keyed off `data-rarity` — they
 * are far too layered to express as inline styles, and keeping them in CSS lets
 * the blend modes cascade properly through `::before`/`::after`.
 *
 * `scope` decides how much of the card the treatment covers:
 * - `window` — the icon art window (uncommon / holo / radiant).
 * - `card`   — the whole card face (secret, the top tier).
 */
export const RarityFoil = ({
  tier,
  scope,
  className,
}: {
  tier: RarityTier;
  scope: 'window' | 'card';
  className?: string;
}) => {
  const flavor = useCtpStore((state) => state.flavor);
  const [colors, setColors] = useState<CatppuccinColors>(flavors[flavor].colors);

  useEffect(() => {
    setColors(flavors[flavor].colors);
  }, [flavor]);

  const isLightTheme = flavor === 'latte';

  const paletteStyle = Object.fromEntries(
    SUNPILLAR_KEYS.map((key, i) => {
      const { r, g, b } = colors[key].rgb;
      return [`--sunpillar-${i + 1}`, `rgb(${r}, ${g}, ${b})`];
    })
  ) as React.CSSProperties;

  return (
    <div
      aria-hidden
      data-rarity={tier}
      data-scope={scope}
      data-light={isLightTheme || undefined}
      className={cn('rarity-foil pointer-events-none absolute inset-0', className)}
      style={paletteStyle}
    >
      <div className="rarity-shine" />
      <div className="rarity-glare" />
    </div>
  );
};

export default RarityFoil;
