import type { SanityImageSource } from '@sanity/image-url';
import type React from 'react';
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

  return (
    <div aria-hidden className={frame} style={meshStyle(seed)}>
      <div className="absolute inset-0" style={GRID} />
      <div
        className="absolute inset-0 opacity-[0.14] mix-blend-overlay"
        style={{ backgroundImage: NOISE }}
      />

      <div className="relative flex h-full flex-col justify-between gap-4 p-5 sm:p-6">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="size-2.5 shrink-0 rounded-full bg-ctp-red/80" />
          <span className="size-2.5 shrink-0 rounded-full bg-ctp-yellow/80" />
          <span className="size-2.5 shrink-0 rounded-full bg-ctp-green/80" />
          <span className="ml-2 truncate font-nf text-[0.6875rem] text-ctp-subtext0">
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
              {logos.map((skill) => (
                <li
                  key={skill._id}
                  className="size-9 rounded-lg bg-ctp-base/70 p-2 text-ctp-text shadow-sm ring-1 ring-ctp-surface1/70 backdrop-blur-sm sm:size-10 [&_svg]:size-full"
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: Sanity content
                  dangerouslySetInnerHTML={{ __html: skill.svgCode }}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
