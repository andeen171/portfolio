'use client';

import {
  ArrowPathRoundedSquareIcon,
  ArrowsPointingOutIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useLocale, useTranslations } from 'next-intl';
import { useId, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import TiltCard from '@/components/TiltCard';
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

type Skill = ListSkillsQueryResult[number];
type Accent = 'teal' | 'lavender' | 'pink' | 'peach' | 'green' | 'sky';
type Variant = 'compact' | 'detail';

/** At most this many tags on the compact card; the rest collapse into "+N". */
const COMPACT_TAGS = 3;
/** Tag-row width on the narrowest compact card (a 14rem grid track), in px. */
const TAG_ROW = 200;
/** What the "+N" chip and its gap take out of the row. */
const MORE_CHIP = 32;

/** Rough rendered width of a compact tag chip — 9px bold uppercase with wide
 *  tracking, plus padding and border. Errs wide; CSS truncation catches the
 *  rest. */
const chipWidth = (tag: string) => tag.length * 6.4 + 18;

/**
 * The tags the compact card has room for, in the author's order: as many as
 * fit on one line (always at least one), so a long tag isn't squeezed down
 * to "O…" just to make room for the next one.
 */
function fitTags(tags: string[]): string[] {
  const candidates = tags.slice(0, COMPACT_TAGS);
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
/** Shared by the grid card and the open detail card, so the browser morphs
 *  one into the other. Only one card ever carries it at a time. */
const TRANSITION_NAME = 'skill-card';

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

/**
 * A skill as a two-sided trading card. Proficiency sets the card's rarity,
 * and the rarity decides which foil it gets — see `src/styles/skill-card.css`,
 * which holds every visual of the card that isn't plain layout.
 *
 * - Front: the collectible face — name, art, tags, rarity, and the flavor
 *   text, short enough to always fit.
 * - Back: the "rules" side — the full description at reading size. Clicking
 *   or tapping the card turns it over (and back again).
 * - The back's inspect button brings the card closer: it morphs into a larger
 *   copy in a dialog with both texts and every tag.
 */
const SkillItem: React.FC<{ skill: Skill }> = ({ skill }) => {
  const t = useTranslations('skills');
  const style = useCardStyle(skill);
  const tier = rarityTier(skill.proficiency);
  const name = skill.name ?? '';

  const cardRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const frontButton = useRef<HTMLButtonElement>(null);
  const backButton = useRef<HTMLButtonElement>(null);
  const [flipped, setFlipped] = useState(false);
  const [open, setOpen] = useState(false);
  const titleId = useId();

  // The side turned away is inert, so focus would drop to <body>; hand it to
  // the button that turns the card back instead.
  const turn = (toBack: boolean) => {
    flushSync(() => setFlipped(toBack));
    (toBack ? backButton : frontButton).current?.focus({ preventScroll: true });
  };

  const openDetail = () =>
    morph(cardRef.current, 'open', () => {
      flushSync(() => setOpen(true));
      dialogRef.current?.showModal();
    });

  const closeDetail = () =>
    morph(cardRef.current, 'close', () => {
      dialogRef.current?.close();
      flushSync(() => setOpen(false));
    });

  return (
    <>
      <TiltCard
        ref={cardRef}
        data-card
        data-rarity={tier}
        data-flipped={flipped || undefined}
        className="skill-card"
        style={style}
      >
        <div className="skill-card__flipper">
          <div className="skill-card__side" inert={flipped}>
            <SkillCardFace skill={skill} tier={tier} variant="compact" />
            {/* The whole side is the button: a transparent layer over the
                face, under the glare. Keeps the face's own semantics
                (heading, list). */}
            <button
              ref={frontButton}
              type="button"
              onClick={() => turn(true)}
              className="skill-card__open"
            >
              <span className="sr-only">{t('flip', { name })}</span>
            </button>
            <div aria-hidden className="skill-card__glare" />
          </div>

          {/* Esc from anywhere on the back (either button) turns it over. */}
          {/* biome-ignore lint/a11y/noStaticElementInteractions: catches Esc bubbling up from the back's own buttons */}
          <div
            className="skill-card__side skill-card__side--back"
            inert={!flipped}
            onKeyDown={(event) => {
              if (event.key === 'Escape') turn(false);
            }}
          >
            <SkillCardBack skill={skill} />
            <button
              ref={backButton}
              type="button"
              onClick={() => turn(false)}
              className="skill-card__open"
            >
              <span className="sr-only">{t('flipBack', { name })}</span>
            </button>
            <button
              type="button"
              aria-haspopup="dialog"
              onClick={openDetail}
              title={t('inspect', { name })}
              className="skill-card__inspect"
            >
              <ArrowsPointingOutIcon aria-hidden className="size-4" />
              <span className="sr-only">{t('inspect', { name })}</span>
            </button>
            <div aria-hidden className="skill-card__glare" />
          </div>
        </div>
      </TiltCard>

      {open && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: the click handles the backdrop; Esc (onCancel) is the keyboard path
        <dialog
          ref={dialogRef}
          aria-labelledby={titleId}
          className="skill-dialog"
          onCancel={(event) => {
            // Esc: close through the same animated path as the button.
            event.preventDefault();
            closeDetail();
          }}
          onClick={(event) => {
            // The dialog fills the viewport; a click on it (not on its
            // content) is a click on the backdrop.
            if (event.target === event.currentTarget) closeDetail();
          }}
        >
          <div className="flex flex-col items-end gap-3">
            <button
              type="button"
              onClick={closeDetail}
              className="inline-flex size-10 items-center justify-center rounded-full border border-ctp-surface1 bg-ctp-mantle/80 text-ctp-subtext1 backdrop-blur-sm transition-colors hover:border-ctp-lavender hover:text-ctp-lavender focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-lavender/50"
            >
              <XMarkIcon className="size-5" />
              <span className="sr-only">{t('close')}</span>
            </button>
            <TiltCard
              active
              idle
              touch="drag"
              data-rarity={tier}
              data-variant="detail"
              className="skill-card"
              style={{ ...style, viewTransitionName: TRANSITION_NAME }}
            >
              <SkillCardFace skill={skill} tier={tier} variant="detail" titleId={titleId} />
              <div aria-hidden className="skill-card__glare" />
            </TiltCard>
          </div>
        </dialog>
      )}
    </>
  );
};

/**
 * Runs a DOM update inside a view transition, so the grid card and the
 * dialog card morph into each other. The source card carries the shared
 * transition name on whichever side of the change it's visible.
 *
 * Falls back to an instant update without the API or with reduced motion.
 */
function morph(source: HTMLElement | null, direction: 'open' | 'close', update: () => void) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!source || reduced || !document.startViewTransition) {
    update();
    return;
  }

  if (direction === 'open') {
    source.style.viewTransitionName = TRANSITION_NAME;
    document.startViewTransition(() => {
      source.style.viewTransitionName = '';
      update();
    });
  } else {
    const transition = document.startViewTransition(() => {
      update();
      source.style.viewTransitionName = TRANSITION_NAME;
    });
    transition.finished.finally(() => {
      source.style.viewTransitionName = '';
    });
  }
}

/** The card's two colours as custom properties — see the face doc below. */
function useCardStyle(skill: Skill): React.CSSProperties {
  const accent = (skill.accentColor ?? skill.category?.accentColor ?? 'lavender') as Accent;
  const svgCode = skill.svgCode ?? skill.category?.fallbackSvgCode;
  // Scanning the SVG source is cheap but not free, and it never changes for a
  // given skill.
  const tint = useMemo(() => logoTint(dominantLogoHsl(svgCode)), [svgCode]);

  return {
    '--accent': `var(--catppuccin-color-${accent})`,
    '--accent-ink': `var(--catppuccin-color-${accent}-950)`,
    ...(tint && { '--tint': tint }),
  } as React.CSSProperties;
}

/**
 * The printed front of the card. Two colours drive it, set on the card by
 * {@link useCardStyle}:
 * - `--accent` — the category (or per-skill) accent: frame, name, rules.
 *   `--accent-ink` is its darkest shade, for the name on latte.
 * - `--tint`   — the logo's own colour, when it has one: the face and the art
 *   window's backlight. Falls back to the accent.
 *
 * `compact` fits the grid and prints only the flavor text, which always fits;
 * the description is on the back ({@link SkillCardBack}). `detail` is the
 * larger copy in the dialog, with the description and the flavor text.
 */
const SkillCardFace = ({
  skill,
  tier,
  variant,
  titleId,
}: {
  skill: Skill;
  tier?: RarityTier;
  variant: Variant;
  titleId?: string;
}) => {
  const locale = useLocale() as 'en-US' | 'pt-BR';
  const t = useTranslations('skills');
  const { getLocalizedValue } = useLocalization();

  const compact = variant === 'compact';
  const description = compact ? '' : getLocalizedValue(skill.description, locale);
  // Optional in Sanity, and may be missing from either language.
  const flavorText = getLocalizedValue(skill.flavorText, locale)?.trim();
  const categoryName = skill.category ? getLocalizedValue(skill.category.name, locale) : undefined;
  const svgCode = skill.svgCode ?? skill.category?.fallbackSvgCode;
  const tags = skill.tags ?? [];
  const shownTags = compact ? fitTags(tags) : tags;
  const hiddenTags = tags.length - shownTags.length;

  return (
    <article className="skill-card__face">
      {tier === 'secret' && <div aria-hidden className="foil foil--card" />}

      <header className="skill-card__header">
        <h3
          id={titleId}
          className={cn(
            'font-bold leading-tight',
            compact ? 'truncate text-[0.9375rem]' : 'text-balance text-xl'
          )}
          title={compact ? (skill.name ?? undefined) : undefined}
        >
          {skill.name}
        </h3>
        {categoryName && (
          <p className="mt-0.5 truncate text-[0.625rem] uppercase tracking-[0.14em] text-ctp-subtext0">
            {categoryName}
          </p>
        )}
        {compact && <ArrowPathRoundedSquareIcon aria-hidden className="skill-card__hint" />}
      </header>

      <div className="skill-card__art">
        <div aria-hidden className="foil foil--art" />
        {svgCode && (
          <div
            className={cn(
              'skill-svg-container relative',
              compact ? 'size-14 sm:size-16' : 'size-20'
            )}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Sanity content
            dangerouslySetInnerHTML={{ __html: svgCode }}
          />
        )}
      </div>

      {tags.length > 0 && (
        <ul
          className={cn(
            'flex justify-center gap-1 px-3',
            // One line on the compact card, whatever the tags: long ones
            // shrink and ellipsize instead of wrapping into the text box.
            compact ? 'flex-nowrap overflow-hidden' : 'flex-wrap'
          )}
        >
          {shownTags.map((tag, i) => (
            <li
              // Sanity doesn't enforce tag uniqueness — index the key so
              // duplicate tags can't collide.
              key={`${i}-${tag}`}
              title={compact ? tag : undefined}
              className={cn(
                TAG_BASE,
                compact && 'min-w-0 truncate',
                TAG_STYLES[i % TAG_STYLES.length]
              )}
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

      {compact ? (
        // Without flavor text the art window takes the room instead.
        flavorText && (
          <div className="skill-card__rules skill-card__rules--flavor">
            <p className="skill-card__flavor">{flavorText}</p>
          </div>
        )
      ) : (
        // This box scrolls by touch, so it doesn't steer the card.
        <div className="skill-card__rules" data-no-tilt>
          {description && (
            <p className="text-left text-[0.8125rem] leading-relaxed text-ctp-subtext1">
              {description}
            </p>
          )}
          {flavorText && <p className="skill-card__flavor">{flavorText}</p>}
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
 * The back of the compact card: what the skill means in practice, at a size
 * meant for reading, over the card's stats printed like a terminal readout.
 * The 戦 ("fight") from the logo is printed large and faint behind it all,
 * like the art on the back of a deck.
 */
const SkillCardBack = ({ skill }: { skill: Skill }) => {
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

export default SkillItem;
