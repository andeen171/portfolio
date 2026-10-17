'use client';

import { ArrowPathRoundedSquareIcon } from '@heroicons/react/24/outline';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { dominantLogoHsl, logoTint } from '@/lib/logoColor';
import {
  isProficiency,
  proficiencyRank,
  RARITY_SYMBOL,
  type RarityTier,
  rarityTier,
} from '@/lib/rarity';
import { cn } from '@/lib/utils';
import type { ListSkillsQueryResult } from '@/sanity/types';
import { useLocalization } from '@/utils/localization';

export type Skill = ListSkillsQueryResult[number];
type Accent = 'teal' | 'lavender' | 'pink' | 'peach' | 'green' | 'sky';

/** At most this many tags on the front; the rest collapse into "+N". */
const FRONT_TAGS = 3;
/** Tag-row width on the narrowest card (a 14rem grid track), in px. */
const TAG_ROW = 200;
/** What the "+N" chip and its gap take out of the row. */
const MORE_CHIP = 32;

/** Rough rendered width of a tag chip — 9px bold uppercase with wide
 *  tracking, plus padding and border. Errs wide; CSS truncation catches the
 *  rest. */
const chipWidth = (tag: string) => tag.length * 6.4 + 18;

/**
 * The tags the front has room for, in the author's order: as many as fit on
 * one line (always at least one), so a long tag isn't squeezed down to "O…"
 * just to make room for the next one.
 */
function fitTags(tags: string[]): string[] {
  const candidates = tags.slice(0, FRONT_TAGS);
  const width = (list: string[]) =>
    list.reduce((sum, tag, i) => sum + chipWidth(tag) + (i ? 4 : 0), 0);

  if (tags.length === candidates.length && width(candidates) <= TAG_ROW) return candidates;

  const fitted: string[] = [];
  for (const tag of candidates) {
    if (fitted.length && width([...fitted, tag]) > TAG_ROW - MORE_CHIP) break;
    fitted.push(tag);
  }
  return fitted;
}

// Filled tag-pill styles, cycled by tag index. Static strings so Tailwind's
// compiler can see them. The raw accents are too pale to read at 9px on
// latte, so the text takes their 950 shade there.
const TAG_STYLES = [
  'bg-ctp-teal/15 text-ctp-teal border-ctp-teal/35 latte:text-ctp-teal-950',
  'bg-ctp-lavender/15 text-ctp-lavender border-ctp-lavender/35 latte:text-ctp-lavender-950',
  'bg-ctp-pink/15 text-ctp-pink border-ctp-pink/35 latte:text-ctp-pink-950',
  'bg-ctp-peach/15 text-ctp-peach border-ctp-peach/35 latte:text-ctp-peach-950',
  'bg-ctp-green/15 text-ctp-green border-ctp-green/35 latte:text-ctp-green-950',
  'bg-ctp-sky/15 text-ctp-sky border-ctp-sky/35 latte:text-ctp-sky-950',
] as const;

const TAG_BASE =
  'rounded-full border px-2 py-0.5 text-[0.5625rem] font-bold uppercase tracking-wider';

/** The card's rarity tier and its two colours as custom properties — see
 *  {@link SkillCardFront}. Shared by the grid card and the viewer. */
export function useCardLook(skill: Skill): { tier?: RarityTier; style: React.CSSProperties } {
  const accent = (skill.accentColor ?? skill.category?.accentColor ?? 'lavender') as Accent;
  const svgCode = skill.svgCode ?? skill.category?.fallbackSvgCode;
  // Scanning the SVG source is cheap but not free, and it never changes for a
  // given skill.
  const tint = useMemo(() => logoTint(dominantLogoHsl(svgCode)), [svgCode]);

  return {
    tier: rarityTier(skill.proficiency),
    style: {
      '--accent': `var(--catppuccin-color-${accent})`,
      '--accent-ink': `var(--catppuccin-color-${accent}-950)`,
      ...(tint && { '--tint': tint }),
    } as React.CSSProperties,
  };
}

/**
 * The printed front of the card: name, art, tags, the flavor text (short
 * enough to always fit) and the rarity. Two colours drive it, set on the card
 * by {@link useCardLook}:
 * - `--accent` — the category (or per-skill) accent: frame, name, rules.
 *   `--accent-ink` is its darkest shade, for the name on latte.
 * - `--tint`   — the logo's own colour, when it has one: the face and the art
 *   window's backlight. Falls back to the accent.
 */
export const SkillCardFront = ({ skill, tier }: { skill: Skill; tier?: RarityTier }) => {
  const locale = useLocale() as 'en-US' | 'pt-BR';
  const t = useTranslations('skills');
  const { getLocalizedValue } = useLocalization();

  // Optional in Sanity, and may be missing from either language.
  const flavorText = getLocalizedValue(skill.flavorText, locale)?.trim();
  const categoryName = skill.category ? getLocalizedValue(skill.category.name, locale) : undefined;
  const svgCode = skill.svgCode ?? skill.category?.fallbackSvgCode;
  const tags = skill.tags ?? [];
  const shownTags = fitTags(tags);
  const hiddenTags = tags.length - shownTags.length;

  return (
    <article className="skill-card__face">
      {tier === 'secret' && <div aria-hidden className="foil foil--card" />}

      <header className="skill-card__header">
        <h3
          className="truncate text-[0.9375rem] font-bold leading-tight"
          title={skill.name ?? undefined}
        >
          {skill.name}
        </h3>
        {categoryName && (
          <p className="mt-0.5 truncate text-[0.625rem] uppercase tracking-[0.14em] text-ctp-subtext0">
            {categoryName}
          </p>
        )}
        <ArrowPathRoundedSquareIcon aria-hidden className="skill-card__hint" />
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
        // One line, whatever the tags: long ones shrink and ellipsize instead
        // of wrapping into the text box.
        <ul className="flex flex-nowrap justify-center gap-1 overflow-hidden px-3">
          {shownTags.map((tag, i) => (
            <li
              // Sanity doesn't enforce tag uniqueness — index the key so
              // duplicate tags can't collide.
              key={`${i}-${tag}`}
              title={tag}
              className={cn(TAG_BASE, 'min-w-0 truncate', TAG_STYLES[i % TAG_STYLES.length])}
            >
              {tag}
            </li>
          ))}
          {hiddenTags > 0 && (
            <li
              className={cn(TAG_BASE, 'shrink-0 border-ctp-surface2 text-ctp-subtext0')}
              title={tags.slice(shownTags.length).join(', ')}
            >
              <span aria-hidden>+{hiddenTags}</span>
              <span className="sr-only">{t('moreTags', { count: hiddenTags })}</span>
            </li>
          )}
        </ul>
      )}

      {/* Without flavor text the art window takes the room instead. */}
      {flavorText && (
        <div className="skill-card__rules skill-card__rules--flavor">
          <p className="skill-card__flavor">{flavorText}</p>
        </div>
      )}

      <CardFooter skill={skill} tier={tier} />
    </article>
  );
};

/** Rarity and years along the front's bottom edge (the back has them in its
 *  stats readout). */
const CardFooter = ({ skill, tier }: { skill: Skill; tier?: RarityTier }) => {
  const t = useTranslations('skills');
  const proficiency = isProficiency(skill.proficiency) ? skill.proficiency : undefined;
  // "0 years" reads as a typo rather than a fact, so only positive figures show.
  const years =
    skill.yearsOfExperience && skill.yearsOfExperience > 0 ? skill.yearsOfExperience : null;
  if (!proficiency && !years) return null;

  return (
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
      {years && <span>{t('years', { count: years })}</span>}
    </footer>
  );
};

/** How many pips the mastery row has, one per proficiency level. */
const PIPS = 4;

/**
 * The back of the card: what the skill is, at a size meant for reading, over
 * the card's stats printed like a terminal readout. The 戦 ("fight") from the
 * logo is printed large and faint behind it all, like the art on the back of
 * a deck.
 */
export const SkillCardBack = ({ skill }: { skill: Skill }) => {
  const locale = useLocale() as 'en-US' | 'pt-BR';
  const t = useTranslations('skills');
  const { getLocalizedValue } = useLocalization();
  const description = getLocalizedValue(skill.description, locale);
  const categoryName = skill.category ? getLocalizedValue(skill.category.name, locale) : undefined;
  const proficiency = isProficiency(skill.proficiency) ? skill.proficiency : undefined;
  const rank = proficiencyRank(skill.proficiency);
  const years =
    skill.yearsOfExperience && skill.yearsOfExperience > 0 ? skill.yearsOfExperience : null;
  const tags = skill.tags ?? [];

  return (
    <article className="skill-card__face skill-card__back">
      <span aria-hidden className="skill-card__watermark">
        戦
      </span>
      <header className="skill-card__back-header">
        <h3
          className="truncate text-[0.9375rem] leading-tight font-bold"
          title={skill.name ?? undefined}
        >
          {skill.name}
        </h3>
        {categoryName && (
          <p className="mt-0.5 truncate text-[0.625rem] tracking-[0.14em] text-ctp-subtext0 uppercase">
            {categoryName}
          </p>
        )}
      </header>
      <div className="skill-card__back-body">
        <p className="text-left text-[0.8125rem] leading-relaxed text-pretty text-ctp-text">
          {description}
        </p>
      </div>
      {(proficiency || years || tags.length > 0) && (
        <dl className="skill-card__stats">
          {proficiency && (
            <>
              <dt>{t('stats.mastery')}</dt>
              <dd>
                <span aria-hidden className="skill-card__pips">
                  {Array.from({ length: PIPS }, (_, i) => (
                    <span
                      // biome-ignore lint/suspicious/noArrayIndexKey: a fixed row of identical pips
                      key={i}
                      className="skill-card__pip"
                      data-on={i < rank || undefined}
                    />
                  ))}
                </span>
                {t(`proficiency.${proficiency}`)}
              </dd>
            </>
          )}
          {years && (
            <>
              <dt>{t('stats.inUse')}</dt>
              <dd>{t('years', { count: years })}</dd>
            </>
          )}
          {tags.length > 0 && (
            <>
              <dt data-stat="tags">{t('stats.tags')}</dt>
              <dd data-stat="tags">{tags.join(' · ')}</dd>
            </>
          )}
        </dl>
      )}
    </article>
  );
};
