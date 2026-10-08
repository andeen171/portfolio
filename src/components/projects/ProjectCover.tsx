import type { SanityImageSource } from '@sanity/image-url';
import type React from 'react';
import { rgbToHsl } from '@/lib/logoColor';
import { cn } from '@/lib/utils';
import { urlFor } from '@/sanity/lib/image';

type CoverSkill = { _id: string; svgCode?: string | null } | null;

interface ProjectCoverProps {
  /** Stable seed for the generated art (the project id). */
  seed: string;
  name: string;
  /** Shown as the cover's terminal path, e.g. "~/room". */
  slug: string;
  image?: SanityImageSource | null;
  imageAlt: string;
  skills?: CoverSkill[] | null;
  className?: string;
}

// Accents that read well as soft light behind glass in every flavor.
const ACCENTS = [
  'mauve',
  'blue',
  'sapphire',
  'teal',
  'green',
  'peach',
  'pink',
  'lavender',
  'sky',
  'flamingo',
] as const;

const MAX_LOGOS = 5;

// Static film grain: a tiled SVG turbulence, so it costs nothing at runtime.
const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

/** FNV-1a — tiny, deterministic, and good enough to spread seeds over a palette. */
function hash(value: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Prefixes the ids an inline SVG defines (gradients, clip paths) and every
 * reference to them. Two covers showing the same logo would otherwise define
 * the same id twice, and each would paint with whichever came first.
 */
function scopeSvgIds(svg: string, scope: string): string {
  const ids = new Set([...svg.matchAll(/\bid=(["'])(.+?)\1/g)].map((match) => match[2]));
  if (ids.size === 0) return svg;
  const scoped = (id: string) => (ids.has(id) ? `${scope}-${id}` : id);
  return svg
    .replace(/\bid=(["'])(.+?)\1/g, (_, quote, id) => `id=${quote}${scoped(id)}${quote}`)
    .replace(/url\((["']?)#(.+?)\1\)/g, (_, quote, id) => `url(${quote}#${scoped(id)}${quote})`)
    .replace(/href=(["'])#(.+?)\1/g, (_, quote, id) => `href=${quote}#${scoped(id)}${quote}`);
}

const PAINT =
  /(?:fill|stroke|stop-color)\s*[:=]\s*["']?\s*(#[0-9a-f]{3,8}|white|black|currentcolor)\b/gi;

/** Lightness (0–1) of a hex or named paint. */
function paintLightness(paint: string): number | null {
  if (paint === 'white') return 1;
  if (paint === 'black') return 0;
  let hex = paint.slice(1);
  if (hex.length <= 4) hex = [...hex.slice(0, 3)].map((digit) => digit + digit).join('');
  if (hex.length < 6) return null;
  const [r, g, b] = [0, 2, 4].map((at) => Number.parseInt(hex.slice(at, at + 2), 16));
  return rgbToHsl(r ?? 0, g ?? 0, b ?? 0).l;
}

/**
 * Whether a logo is painted only in near-black (Hyperf, MySQL) or only in
 * white (Rust, PHP) — the two kinds that vanish on a tile of the wrong
 * flavor. Logos drawn in `currentColor` follow the tile's text and are fine.
 */
function logoTone(svg: string): 'dark' | 'light' | null {
  let min = 1;
  let max = 0;
  for (const [, raw = ''] of svg.matchAll(PAINT)) {
    const paint = raw.toLowerCase();
    if (paint === 'currentcolor') return null;
    const lightness = paintLightness(paint);
    if (lightness === null) continue;
    min = Math.min(min, lightness);
    max = Math.max(max, lightness);
  }
  if (min > max) return null;
  if (max <= 0.3) return 'dark';
  if (min >= 0.9) return 'light';
  return null;
}

// A logo that would vanish gets the tile inverted: light behind a dark logo in
// the dark flavors, dark behind a white logo in latte.
const TILE_TONE = {
  dark: 'bg-ctp-subtext1/90 latte:bg-ctp-base/70',
  light: 'latte:bg-ctp-subtext1/90',
} as const;

/** The accent at `index` (wrapping), mixed down to `amount` percent. */
const accent = (index: number, amount: number) =>
  `color-mix(in oklab, var(--catppuccin-color-${ACCENTS[index % ACCENTS.length] ?? 'lavender'}) ${amount}%, transparent)`;

/** Three distinct accents and a light position, all derived from the seed. */
function meshStyle(seed: string): React.CSSProperties {
  const h = hash(seed);
  // Steps of 2–4 around a ring of 10 keep all three picks distinct.
  const first = h % ACCENTS.length;
  const second = first + 2 + ((h >>> 8) % 3);
  const third = second + 2 + ((h >>> 16) % 3);
  const x = 10 + ((h >>> 4) % 30);

  return {
    backgroundColor: 'var(--catppuccin-color-crust)',
    backgroundImage: [
      `radial-gradient(65% 85% at ${x}% 15%, ${accent(first, 65)}, transparent 70%)`,
      `radial-gradient(55% 75% at ${100 - x}% 0%, ${accent(second, 50)}, transparent 70%)`,
      `radial-gradient(80% 70% at ${50 + x}% 110%, ${accent(third, 55)}, transparent 70%)`,
    ].join(', '),
  };
}

const GRID: React.CSSProperties = {
  backgroundImage: [
    'linear-gradient(to right, color-mix(in oklab, var(--catppuccin-color-text) 9%, transparent) 1px, transparent 1px)',
    'linear-gradient(to bottom, color-mix(in oklab, var(--catppuccin-color-text) 9%, transparent) 1px, transparent 1px)',
  ].join(', '),
  backgroundSize: '28px 28px',
  maskImage: 'radial-gradient(ellipse 80% 70% at 30% 35%, #000 20%, transparent 75%)',
};

/**
 * A project's cover. Real screenshots are shown as they are; a project
 * without one gets generated art instead — a Catppuccin mesh behind a grid,
 * a terminal title bar, the project name and the logos of its stack — so an
 * image-less card looks designed rather than empty.
 */
export default function ProjectCover({
  seed,
  name,
  slug,
  image,
  imageAlt,
  skills,
  className,
}: ProjectCoverProps) {
  const frame = cn(
    'relative isolate aspect-video overflow-hidden bg-ctp-crust lg:aspect-auto lg:h-full lg:min-h-64',
    className
  );
  // The generated art holds 16:9 as a floor rather than a fixed size: a
  // `::before` spacer sets the ratio and the content shares its grid cell, so
  // a long name that wraps on a phone grows the frame instead of slicing the
  // logo row off at the bottom. `grid-cols-1` pins the column to the frame's
  // width; an auto column would let the spacer turn that extra height back
  // into width.
  const generatedFrame = cn(
    "relative isolate grid grid-cols-1 overflow-hidden bg-ctp-crust before:aspect-video before:content-[''] before:[grid-area:1/1] lg:block lg:h-full lg:min-h-64 lg:before:hidden",
    className
  );

  if (image) {
    const src = urlFor(image).width(960).height(540).fit('crop').auto('format').url();
    return (
      <div className={frame}>
        {/* biome-ignore lint/performance/noImgElement: the Sanity CDN already resizes and re-encodes it */}
        <img
          src={src}
          alt={imageAlt}
          width={960}
          height={540}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        {/* Seats the screenshot in the card instead of letting it end in a hard edge. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-ctp-crust/40 to-transparent lg:bg-linear-to-l"
        />
      </div>
    );
  }

  // Related skills can share an icon (React and React Native), so a logo
  // already on the cover isn't drawn twice.
  const seenLogos = new Set<string>();
  const logos = (skills ?? [])
    .filter((skill): skill is { _id: string; svgCode: string } => {
      const svg = skill?.svgCode?.trim();
      if (!svg || seenLogos.has(svg)) return false;
      seenLogos.add(svg);
      return true;
    })
    .slice(0, MAX_LOGOS);
  const scope = `cover-${hash(seed).toString(36)}`;

  return (
    <div aria-hidden className={generatedFrame} style={meshStyle(seed)}>
      <div className="absolute inset-0" style={GRID} />
      <div
        className="absolute inset-0 opacity-[0.14] mix-blend-overlay"
        style={{ backgroundImage: NOISE }}
      />

      <div className="relative flex flex-col justify-between gap-4 p-5 [grid-area:1/1] sm:p-6 lg:h-full">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="size-2.5 shrink-0 rounded-full bg-ctp-red/80" />
          <span className="size-2.5 shrink-0 rounded-full bg-ctp-yellow/80" />
          <span className="size-2.5 shrink-0 rounded-full bg-ctp-green/80" />
          <span className="ml-2 truncate font-nf text-[0.6875rem] text-ctp-subtext0 latte:text-ctp-subtext1">
            <span className="text-ctp-teal">~/</span>
            {slug}
          </span>
        </div>

        <div className="min-w-0 space-y-4">
          <p className="font-nf text-xl font-bold leading-tight text-balance text-ctp-text sm:text-2xl">
            <span className="mr-2 text-ctp-teal">❯</span>
            {name}
          </p>

          {logos.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {logos.map((skill) => {
                const tone = logoTone(skill.svgCode);
                return (
                  <li
                    key={skill._id}
                    className={cn(
                      'size-9 rounded-lg bg-ctp-base/70 p-2 text-ctp-text shadow-sm ring-1 ring-ctp-surface1/70 backdrop-blur-sm sm:size-10 [&_svg]:size-full',
                      tone && TILE_TONE[tone]
                    )}
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: Sanity content
                    dangerouslySetInnerHTML={{ __html: scopeSvgIds(skill.svgCode, scope) }}
                  />
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
