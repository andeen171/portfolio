/**
 * Derives a skill card's tint from its logo.
 *
 * We read the dominant colour straight out of the icon's SVG source, so the
 * card agrees with the logo sitting on it — a Python card leans blue, a Redis
 * card leans red.
 *
 * Roughly 40% of the icons in the dataset are `currentColor`-only (soft skills
 * and monochrome wordmarks); those have no colour to read, and the card falls
 * back to its category accent instead.
 *
 * Everything here is pure and deterministic so SSR and client renders agree,
 * and the output is theme-agnostic: the stylesheet mixes the tint into the
 * active Catppuccin flavor, so nothing here needs to know which one is on.
 */

export type Hsl = { h: number; s: number; l: number };

const HEX_PATTERN = /#([0-9a-fA-F]{3,8})\b/g;

/** Expands `#abc` / `#abcd` shorthand. Returns `null` when the colour is
 *  (nearly) fully transparent — an invisible paint says nothing about the
 *  brand, so it must not count as the logo's dominant colour. */
function normalizeHex(raw: string): { hex: string; alpha: number } | null {
  const hex = raw.replace('#', '');

  if (hex.length === 3 || hex.length === 4) {
    const r = hex[0];
    const g = hex[1];
    const b = hex[2];
    const a = hex.length === 4 ? Number.parseInt(`${hex[3]}${hex[3]}`, 16) / 255 : 1;
    if (a < 0.15) return null;
    return { hex: `${r}${r}${g}${g}${b}${b}`.toLowerCase(), alpha: a };
  }

  if (hex.length === 6 || hex.length === 8) {
    const a = hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1;
    if (a < 0.15) return null;
    return { hex: hex.slice(0, 6).toLowerCase(), alpha: a };
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
 * Picks the dominant colour of an SVG source. Counts are weighted by the
 * paint's alpha (so a barely-visible fill can't outvote the visible ones),
 * and ties break toward first appearance, which keeps the result stable for a
 * given input.
 *
 * Returns `null` when the icon carries no colour of its own.
 */
export function dominantLogoHsl(svgCode?: string | null): Hsl | null {
  if (!svgCode) return null;

  const counts = new Map<string, { hsl: Hsl; count: number; firstAt: number }>();
  let index = 0;

  for (const match of svgCode.matchAll(HEX_PATTERN)) {
    const parsed = normalizeHex(match[0]);
    index += 1;
    if (!parsed) continue;

    const { r, g, b } = hexToRgb(parsed.hex);
    const hsl = rgbToHsl(r, g, b);
    if (!isCarryingColor(hsl)) continue;

    const existing = counts.get(parsed.hex);
    if (existing) {
      existing.count += parsed.alpha;
    } else {
      counts.set(parsed.hex, { hsl, count: parsed.alpha, firstAt: index });
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
 * Normalises a logo colour into a card tint. The hue is the logo's; saturation
 * and lightness are pinned to a band that sits comfortably next to the
 * Catppuccin accents, so a neon-yellow or near-navy logo can't produce a card
 * that glares or disappears.
 */
export function logoTint(hsl: Hsl | null): string | undefined {
  if (!hsl) return undefined;
  const h = Math.round(hsl.h);
  const s = Math.round(Math.min(0.8, Math.max(0.45, hsl.s)) * 100);
  return `hsl(${h} ${s}% 62%)`;
}
