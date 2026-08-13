'use client';

import { type CatppuccinColors, flavors } from '@catppuccin/palette';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useCtpStore } from '@/store';

/**
 * A holographic "foil" shimmer layer driven by the pointer-tracked CSS custom
 * properties (`--bg-x` / `--bg-y`) set by the enclosing {@link GlareCard}.
 * Render it as an absolutely-positioned background behind content inside any
 * descendant of a GlareCard (e.g. the art window of a skill card). It reads the
 * live Catppuccin palette so the rainbow follows the active flavor, and it is
 * deliberately toned down on the light `latte` flavor to preserve legibility.
 */
export const FoilLayer = ({ className }: { className?: string }) => {
  const flavor = useCtpStore((state) => state.flavor);
  const [colors, setColors] = useState<CatppuccinColors>(flavors[flavor].colors);

  useEffect(() => {
    setColors(flavors[flavor].colors);
  }, [flavor]);

  const isLightTheme = flavor === 'latte';
  // Foil sits behind an icon here, so it can be richer than a full-card overlay
  // — but on latte we still pull it back hard to keep icons crisp.
  const rainbowMultiplier = isLightTheme ? 0.55 : 1;

  const foilStyle = {
    '--step': '4%',
    '--catppuccin-rainbow': `repeating-linear-gradient( 45deg, rgba(${colors.teal.rgb.r}, ${
      colors.teal.rgb.g
    }, ${colors.teal.rgb.b}, ${0.8 * rainbowMultiplier}) calc(var(--step) * 1), rgba(${
      colors.sky.rgb.r
    }, ${colors.sky.rgb.g}, ${colors.sky.rgb.b}, ${
      0.7 * rainbowMultiplier
    }) calc(var(--step) * 2), rgba(${colors.sapphire.rgb.r}, ${colors.sapphire.rgb.g}, ${
      colors.sapphire.rgb.b
    }, ${0.8 * rainbowMultiplier}) calc(var(--step) * 3), rgba(${colors.blue.rgb.r}, ${
      colors.blue.rgb.g
    }, ${colors.blue.rgb.b}, ${0.7 * rainbowMultiplier}) calc(var(--step) * 4), rgba(${
      colors.lavender.rgb.r
    }, ${colors.lavender.rgb.g}, ${colors.lavender.rgb.b}, ${
      0.9 * rainbowMultiplier
    }) calc(var(--step) * 5), rgba(${colors.pink.rgb.r}, ${colors.pink.rgb.g}, ${
      colors.pink.rgb.b
    }, ${0.8 * rainbowMultiplier}) calc(var(--step) * 6), rgba(${colors.mauve.rgb.r}, ${
      colors.mauve.rgb.g
    }, ${colors.mauve.rgb.b}, ${
      0.7 * rainbowMultiplier
    }) calc(var(--step) * 7) ) 0% var(--bg-y)/200% 600% no-repeat`,
    '--shine': `linear-gradient( 115deg, transparent 25%, rgba(${colors.text.rgb.r}, ${
      colors.text.rgb.g
    }, ${colors.text.rgb.b}, ${
      isLightTheme ? 0.12 : 0.22
    }) 48%, transparent 62% ) var(--bg-x) var(--bg-y)/250% 250% no-repeat`,
    background: 'var(--catppuccin-rainbow), var(--shine)',
    backgroundBlendMode: isLightTheme ? 'soft-light, overlay' : 'color-dodge, overlay',
    // On latte the whole thing is dialled back so white/light icons stay legible.
    opacity: isLightTheme ? 0.45 : 0.85,
  } as React.CSSProperties;

  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0', className)}>
      {/* A dark seat so light icons have contrast even where the foil is pale. */}
      <div className="absolute inset-0 bg-ctp-crust/70" />
      <div className="absolute inset-0" style={foilStyle} />
    </div>
  );
};

export default FoilLayer;
