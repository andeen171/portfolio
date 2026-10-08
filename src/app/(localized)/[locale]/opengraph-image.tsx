import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { flavors } from '@catppuccin/palette';
import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';

// Name and address read the same in either language, so one alt serves both.
export const alt = 'Anderson Ribeiro Lopes · anderson-lopes.dev.br';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const { colors: c } = flavors.mocha;

type Color = (typeof c)[keyof typeof c];
const alpha = ({ rgb: { r, g, b } }: Color, a: number) => `rgba(${r}, ${g}, ${b}, ${a})`;

/** A soft round glow that fades to nothing before the box's edges. Explicit
 *  stops ending in zero alpha: Satori draws `closest-side` glows and fades to
 *  `transparent` with a dark core and hard box edges. */
const glow = (color: Color, strength: number) =>
  `radial-gradient(circle at 50% 50%, ${alpha(color, strength)} 0%, ${alpha(color, 0)} 68%)`;

const RAINBOW = [c.red, c.peach, c.yellow, c.green, c.sky, c.lavender, c.mauve, c.pink, c.red]
  .map((color) => color.hex)
  .join(', ');

type Locale = (typeof routing.locales)[number];
const toLocale = (value: string): Locale =>
  routing.locales.includes(value as Locale) ? (value as Locale) : routing.defaultLocale;

// Rendered once per locale at build time rather than on each crawler visit.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * A night sky of fixed stars. Seeded, so every build draws the same sky and
 * the image's hash doesn't churn.
 */
const STARS = (() => {
  let seed = 171;
  const next = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  return Array.from({ length: 70 }, () => ({
    x: Math.round(next() * size.width),
    y: Math.round(next() * size.height),
    r: next() < 0.15 ? 3 : next() < 0.5 ? 2 : 1.5,
    o: 0.25 + next() * 0.6,
  }));
})();

type CardSpec = {
  name: string;
  kind: string;
  glyph: string;
  accent: Color;
  rarity: number;
  rotate: number;
  left: number;
  top: number;
  foil?: boolean;
};

/**
 * The share card for every page: the name over a starry Catppuccin Mocha
 * canvas, with a fanned hand of skill cards like the ones on /skills.
 *
 * Everything is drawn offline. Satori ships no monospace face and would
 * fetch fallback glyphs from Google Fonts, so the text uses a bundled Source
 * Code Pro (OFL) and stays within its Latin coverage — which is also why the
 * logo's 戦え is left out.
 */
export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'og' });

  const fontDir = join(process.cwd(), 'src/assets/fonts');
  const [regular, bold] = await Promise.all([
    readFile(join(fontDir, 'SourceCodePro-Regular.ttf')),
    readFile(join(fontDir, 'SourceCodePro-Bold.ttf')),
  ]);

  const cards: CardSpec[] = [
    {
      name: 'PHP',
      kind: t('language'),
      glyph: '<?php',
      accent: c.lavender,
      rarity: 4,
      rotate: -12,
      left: -8,
      top: 64,
    },
    {
      name: 'Rust',
      kind: t('language'),
      glyph: '&mut',
      accent: c.peach,
      rarity: 2,
      rotate: 12,
      left: 244,
      top: 64,
    },
    {
      name: 'Go',
      kind: t('language'),
      glyph: ':=',
      accent: c.teal,
      rarity: 3,
      rotate: 0,
      left: 122,
      top: 0,
      foil: true,
    },
  ];

  return new ImageResponse(
    <div
      style={{
        position: 'relative',
        display: 'flex',
        width: '100%',
        height: '100%',
        fontFamily: 'Source Code Pro',
        color: c.text.hex,
        backgroundColor: c.crust.hex,
        backgroundImage: `linear-gradient(160deg, ${c.mantle.hex} 0%, ${c.base.hex} 45%, ${c.crust.hex} 100%)`,
      }}
    >
      {/* Glows: teal behind the name, lavender behind the cards. */}
      <div
        style={{
          position: 'absolute',
          left: -220,
          top: -260,
          width: 900,
          height: 800,
          display: 'flex',
          backgroundImage: glow(c.teal, 0.22),
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: -200,
          bottom: -300,
          width: 900,
          height: 900,
          display: 'flex',
          backgroundImage: glow(c.lavender, 0.24),
        }}
      />

      {STARS.map((star) => (
        <div
          key={`${star.x}-${star.y}`}
          style={{
            position: 'absolute',
            left: star.x,
            top: star.y,
            width: star.r,
            height: star.r,
            borderRadius: star.r,
            backgroundColor: alpha(c.text, star.o),
          }}
        />
      ))}

      {/* Shooting stars. */}
      <div
        style={{
          position: 'absolute',
          left: 520,
          top: 70,
          width: 220,
          height: 2,
          borderRadius: 2,
          backgroundImage: `linear-gradient(90deg, ${alpha(c.lavender, 0)}, ${alpha(c.lavender, 0.9)})`,
          transform: 'rotate(18deg)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 250,
          top: 52,
          width: 130,
          height: 2,
          borderRadius: 2,
          backgroundImage: `linear-gradient(90deg, ${alpha(c.teal, 0)}, ${alpha(c.teal, 0.7)})`,
          transform: 'rotate(18deg)',
        }}
      />

      {/* Text column. */}
      <div
        style={{
          position: 'absolute',
          left: 80,
          top: 0,
          bottom: 0,
          width: 640,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 26, fontWeight: 700 }}>
          <span style={{ color: c.overlay1.hex, marginRight: 14 }}>$</span>
          <span style={{ color: c.teal.hex }}>~/</span>
          <span style={{ color: c.subtext0.hex }}>portfolio</span>
          <div
            style={{
              marginLeft: 8,
              width: 13,
              height: 28,
              backgroundColor: alpha(c.teal, 0.85),
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: 26,
            fontSize: 78,
            fontWeight: 700,
            lineHeight: 1.04,
            letterSpacing: -2,
          }}
        >
          {['Anderson', 'Ribeiro Lopes'].map((line) => (
            <span
              key={line}
              style={{
                backgroundImage: `linear-gradient(90deg, ${c.teal.hex}, ${c.lavender.hex})`,
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              {line}
            </span>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 30,
            fontSize: 26,
            fontWeight: 700,
            lineHeight: 1.3,
            color: c.text.hex,
          }}
        >
          {t('role')}
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 14,
            fontSize: 22,
            lineHeight: 1.45,
            color: c.subtext0.hex,
          }}
        >
          {t('tagline')}
        </div>
      </div>

      {/* Footer line. */}
      <div
        style={{
          position: 'absolute',
          left: 80,
          right: 80,
          bottom: 48,
          display: 'flex',
          alignItems: 'center',
          fontSize: 20,
          color: c.overlay1.hex,
        }}
      >
        <span style={{ color: c.teal.hex, fontWeight: 700 }}>anderson-lopes.dev.br</span>
        <span style={{ margin: '0 14px' }}>·</span>
        <span>{t('location')}</span>
      </div>

      {/* A fanned hand of skill cards. */}
      <div
        style={{
          position: 'absolute',
          left: 724,
          top: 150,
          width: 420,
          height: 320,
          display: 'flex',
        }}
      >
        {cards.map((card) => (
          <SkillCard key={card.name} {...card} />
        ))}
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: 'Source Code Pro', data: regular, weight: 400, style: 'normal' },
        { name: 'Source Code Pro', data: bold, weight: 700, style: 'normal' },
      ],
    }
  );
}

/** A skill card in miniature, after the ones in skill-card.css. */
function SkillCard({ name, kind, glyph, accent, rarity, rotate, left, top, foil }: CardSpec) {
  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width: 176,
        height: 246,
        display: 'flex',
        padding: 2,
        borderRadius: 18,
        // The frame: the accent, or an iridescent rainbow on the foil card.
        backgroundImage: foil
          ? `linear-gradient(135deg, ${RAINBOW})`
          : `linear-gradient(160deg, ${alpha(accent, 0.75)}, ${alpha(accent, 0.3)})`,
        boxShadow: `0 24px 48px -12px ${alpha(c.crust, 0.9)}`,
        transform: `rotate(${rotate}deg)`,
      }}
    >
      <div
        style={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 16,
          overflow: 'hidden',
          backgroundImage: `linear-gradient(160deg, ${alpha(accent, 0.2)}, ${c.mantle.hex} 50%, ${c.crust.hex})`,
          backgroundColor: c.mantle.hex,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '10px 10px 8px',
            backgroundColor: alpha(c.crust, 0.55),
            borderBottom: `1px solid ${alpha(accent, 0.3)}`,
          }}
        >
          <span style={{ fontSize: 18, fontWeight: 700, color: accent.hex }}>{name}</span>
          <span style={{ marginTop: 2, fontSize: 10, letterSpacing: 2, color: c.subtext0.hex }}>
            {kind.toUpperCase()}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 72,
            margin: '10px 10px 0',
            borderRadius: 10,
            border: `1px solid ${alpha(accent, 0.3)}`,
            backgroundColor: c.crust.hex,
            backgroundImage: glow(accent, 0.5),
            fontSize: 24,
            fontWeight: 700,
            color: accent.hex,
          }}
        >
          {glyph}
        </div>

        {/* Rules text, as greeked lines. */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            margin: '8px 10px 0',
            padding: '9px 9px 0',
            borderRadius: 8,
            border: `1px solid ${alpha(c.surface0, 0.8)}`,
            backgroundColor: alpha(c.crust, 0.55),
          }}
        >
          {[100, 86, 64].map((width) => (
            <div
              key={width}
              style={{
                width: `${width}%`,
                height: 6,
                marginBottom: 8,
                borderRadius: 3,
                backgroundColor: alpha(c.overlay0, 0.45),
              }}
            />
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            padding: '6px 11px 8px',
            fontSize: 11,
            letterSpacing: 2,
            color: foil ? accent.hex : c.overlay2.hex,
          }}
        >
          {'◆'.repeat(rarity)}
        </div>

        {/* A sheen across the foil card. */}
        {foil && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              display: 'flex',
              backgroundImage:
                'linear-gradient(115deg, rgba(255, 255, 255, 0) 28%, rgba(255, 255, 255, 0.14) 44%, rgba(255, 255, 255, 0.04) 52%, rgba(255, 255, 255, 0) 62%)',
            }}
          />
        )}
      </div>
    </div>
  );
}
