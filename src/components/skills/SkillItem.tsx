'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';
import TiltCard from '@/components/TiltCard';
import { dominantLogoHsl, logoTint } from '@/lib/logoColor';
import { isProficiency, RARITY_SYMBOL, rarityTier } from '@/lib/rarity';
import { cn } from '@/lib/utils';
import type { ListSkillsQueryResult } from '@/sanity/types';
import { useLocalization } from '@/utils/localization';

type Accent = 'teal' | 'lavender' | 'pink' | 'peach' | 'green' | 'sky';

interface SkillItemProps {
  skill: ListSkillsQueryResult[number];
}

// Filled tag-pill styles, cycled by tag index. Static strings so Tailwind's
// compiler can see them.
const TAG_STYLES = [
  'bg-ctp-teal/15 text-ctp-teal border-ctp-teal/35',
  'bg-ctp-lavender/15 text-ctp-lavender border-ctp-lavender/35',
  'bg-ctp-pink/15 text-ctp-pink border-ctp-pink/35',
  'bg-ctp-peach/15 text-ctp-peach border-ctp-peach/35',
  'bg-ctp-green/15 text-ctp-green border-ctp-green/35',
  'bg-ctp-sky/15 text-ctp-sky border-ctp-sky/35',
] as const;

/**
 * A skill as a trading card. Proficiency sets the card's rarity, and the
 * rarity decides which foil it gets — see `src/styles/skill-card.css`, which
 * holds every visual of the card that isn't plain layout.
 *
 * Two colours drive the card, both handed to CSS as custom properties:
 * - `--accent` — the category (or per-skill) accent: frame, name, rules.
 * - `--tint`   — the logo's own colour, when it has one: the face and the art
 *   window's backlight. Falls back to the accent.
 */
const SkillItem: React.FC<SkillItemProps> = ({ skill }) => {
  const locale = useLocale() as 'en-US' | 'pt-BR';
  const t = useTranslations('skills');
  const { getLocalizedValue } = useLocalization();

  const description = getLocalizedValue(skill.description, locale);
  const categoryName = skill.category ? getLocalizedValue(skill.category.name, locale) : undefined;
  const accent = (skill.accentColor ?? skill.category?.accentColor ?? 'lavender') as Accent;
  const svgCode = skill.svgCode ?? skill.category?.fallbackSvgCode;
  const tags = (skill.tags ?? []).slice(0, 3);
  const years = skill.yearsOfExperience;

  // Scanning the SVG source is cheap but not free, and it never changes for a
  // given skill.
  const tint = useMemo(() => logoTint(dominantLogoHsl(svgCode)), [svgCode]);

  const tier = rarityTier(skill.proficiency);
  const proficiency = isProficiency(skill.proficiency) ? skill.proficiency : undefined;

  const style = {
    '--accent': `var(--catppuccin-color-${accent})`,
    ...(tint && { '--tint': tint }),
  } as React.CSSProperties;

  return (
    <TiltCard data-card data-rarity={tier} className="skill-card" style={style}>
      <article className="skill-card__face">
        {tier === 'secret' && <div aria-hidden className="foil foil--card" />}

        <header className="skill-card__header">
          <h3 className="truncate font-bold text-[0.9375rem] leading-tight" title={skill.name}>
            {skill.name}
          </h3>
          {categoryName && (
            <p className="mt-0.5 truncate text-[0.625rem] uppercase tracking-[0.14em] text-ctp-subtext0">
              {categoryName}
            </p>
          )}
        </header>

        <div className="skill-card__art">
          <div aria-hidden className="foil foil--art" />
          {svgCode && (
            <div
              className="skill-svg-container relative size-14 sm:size-16"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: Sanity content
              dangerouslySetInnerHTML={{ __html: svgCode }}
            />
          )}
        </div>

        {tags.length > 0 && (
          <ul className="flex max-h-[2.75rem] flex-wrap justify-center gap-1 overflow-hidden px-3">
            {tags.map((tag, i) => (
              <li
                // Sanity doesn't enforce tag uniqueness — index the key so
                // duplicate tags can't collide.
                key={`${i}-${tag}`}
                className={cn(
                  'max-w-full truncate rounded-full border px-2 py-0.5 text-[0.5625rem] font-bold uppercase tracking-wider',
                  TAG_STYLES[i % TAG_STYLES.length]
                )}
              >
                {tag}
              </li>
            ))}
          </ul>
        )}

        <div className="skill-card__rules">
          <p className="line-clamp-5 text-left text-[0.6875rem] leading-snug text-ctp-subtext1">
            {description}
          </p>
        </div>

        {(proficiency || years != null) && (
          <footer className="skill-card__footer">
            {proficiency && tier ? (
              <span className="skill-card__rarity">
                <span aria-hidden className="skill-card__symbol">
                  {RARITY_SYMBOL[tier]}
                </span>
                {t(`proficiency.${proficiency}`)}
              </span>
            ) : (
              <span />
            )}
            {years != null && years > 0 && <span>{t('years', { count: years })}</span>}
          </footer>
        )}
      </article>
      <div aria-hidden className="skill-card__glare" />
    </TiltCard>
  );
};

export default SkillItem;
