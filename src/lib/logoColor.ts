/**
 * Derives a skill card's colour from its logo.
 *
 * Card backgrounds used to be seeded by hashing the document id, which made
 * them arbitrary — a Python card was as likely to be pink as blue. Instead we
 * read the dominant colour straight out of the icon's SVG source, so the card
 * agrees with the logo sitting on it.
 *
 * Roughly 40% of the icons in the dataset are `currentColor`-only (soft skills
 * and monochrome wordmarks); those have no colour to read and fall back to the
 * skill's Catppuccin accent.
 *
 * Everything here is pure and deterministic so SSR and client renders agree.
 */

export type Hsl = { h: number; s: number; l: number };

const HEX_PATTERN = /#([0-9a-fA-F]{3,8})\b/g;

/** Expands `#abc` / `#abcd` shorthand and drops any alpha channel. */
function normalizeHex(raw: string): string | null {
  const hex = raw.replace('#', '');
  if (hex.length === 3 || hex.length === 4) {
    const [r, g, b] = [hex[0], hex[1], hex[2]];
    return `${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  if (hex.length === 6 || hex.length === 8) {
    return hex.slice(0, 6).toLowerCase();
  }
  return null;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
  };
}

export function rgbToHsl(r: number, g: number, b: number): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const delta = max - min;

  if (delta === 0) return { h: 0, s: 0, l };

  const s = delta / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === rn) {
    h = ((gn - bn) / delta) % 6;
  } else if (max === gn) {
    h = (bn - rn) / delta + 2;
  } else {
    h = (rn - gn) / delta + 4;
  }
  h *= 60;
  if (h < 0) h += 360;

  return { h, s, l };
}

/** Inverse of {@link rgbToHsl}; channels come back in the 0–1 range GL wants. */
export function hslToRgbUnit({ h, s, l }: Hsl): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const [r1, g1, b1] =
    hp < 1
      ? [c, x, 0]
      : hp < 2
        ? [x, c, 0]
        : hp < 3
          ? [0, c, x]
          : hp < 4
            ? [0, x, c]
            : hp < 5
              ? [x, 0, c]
              : [c, 0, x];
  const m = l - c / 2;
  return [r1 + m, g1 + m, b1 + m];
}

/**
 * A colour is "carrying" if it's saturated enough and neither near-black nor
 * near-white. Logos are full of `#fff` counter-shapes and `#000` outlines that
 * would otherwise win the popularity contest without saying anything about the
 * brand.
 */
function isCarryingColor({ s, l }: Hsl): boolean {
  return s >= 0.18 && l >= 0.12 && l <= 0.92;
}

/**
 * Picks the dominant colour of an SVG source. Ties break toward first
 * appearance, which keeps the result stable for a given input.
 *
 * Returns `null` when the icon carries no colour of its own.
 */
export function dominantLogoHsl(svgCode?: string | null): Hsl | null {
  if (!svgCode) return null;

  const counts = new Map<string, { hsl: Hsl; count: number; firstAt: number }>();
  let index = 0;

  for (const match of svgCode.matchAll(HEX_PATTERN)) {
    const hex = normalizeHex(match[0]);
    index += 1;
    if (!hex) continue;

    const { r, g, b } = hexToRgb(hex);
    const hsl = rgbToHsl(r, g, b);
    if (!isCarryingColor(hsl)) continue;

    const existing = counts.get(hex);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(hex, { hsl, count: 1, firstAt: index });
    }
  }

  if (counts.size === 0) return null;

  let best: { hsl: Hsl; count: number; firstAt: number } | null = null;
  for (const entry of counts.values()) {
    if (
      !best ||
      entry.count > best.count ||
      (entry.count === best.count && entry.firstAt < best.firstAt)
    ) {
      best = entry;
    }
  }

  return best?.hsl ?? null;
}

/**
 * Builds the card's background gradient from a logo hue.
 *
 * The hue comes from the logo; saturation and lightness are pinned to values
 * that sit inside the Catppuccin surface range, so a neon-yellow logo can't
 * produce a card that glares. The second stop is nudged around the wheel to
 * keep the gradient from reading flat.
 */
export function logoGradient(hsl: Hsl | null, isLightTheme: boolean): string | undefined {
  if (!hsl) return undefined;

  const h1 = Math.round(hsl.h);
  const h2 = Math.round((hsl.h + 28) % 360);

  return isLightTheme
    ? `linear-gradient(145deg, hsl(${h1} 42% 90%) 0%, hsl(${h2} 38% 84%) 100%)`
    : `linear-gradient(145deg, hsl(${h1} 26% 20%) 0%, hsl(${h2} 30% 13%) 100%)`;
}
