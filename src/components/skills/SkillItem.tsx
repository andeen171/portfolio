'use client';

import { useLocale } from 'next-intl';
import { useMemo } from 'react';
import FoilLayer from '@/components/FoilLayer';
import CatppuccinGlareCard, { type GlareCardAccent } from '@/components/GlareCard';
import RarityFoil from '@/components/RarityFoil';
import { dominantLogoHsl, logoGradient } from '@/lib/logoColor';
import { isCardWideTier, rarityTier } from '@/lib/rarity';
import { cn } from '@/lib/utils';
import type { ListSkillsQueryResult } from '@/sanity/types';
import { useCtpStore } from '@/store';
import { useLocalization } from '@/utils/localization';

interface SkillItemProps {
  skill: ListSkillsQueryResult[number];
}

// Accent-driven text tints for the name bar / badge (static so Tailwind sees them).
const ACCENT_TEXT: Record<GlareCardAccent, string> = {
  teal: 'text-ctp-teal',
  lavender: 'text-ctp-lavender',
  pink: 'text-ctp-pink',
  peach: 'text-ctp-peach',
  green: 'text-ctp-green',
  sky: 'text-ctp-sky',
};

const ACCENT_RULE: Record<GlareCardAccent, string> = {
  teal: 'border-ctp-teal/40',
  lavender: 'border-ctp-lavender/40',
  pink: 'border-ctp-pink/40',
  peach: 'border-ctp-peach/40',
  green: 'border-ctp-green/40',
  sky: 'border-ctp-sky/40',
};

// Filled tag-pill styles, cycled by tag index. Static strings so Tailwind's
// compiler can see them. The /20 fill + full-strength text + bold reads on
// both latte and the dark flavors.
const TAG_STYLES = [
  'bg-ctp-teal/20 text-ctp-teal border-ctp-teal/40',
  'bg-ctp-lavender/20 text-ctp-lavender border-ctp-lavender/40',
  'bg-ctp-pink/20 text-ctp-pink border-ctp-pink/40',
  'bg-ctp-peach/20 text-ctp-peach border-ctp-peach/40',
  'bg-ctp-green/20 text-ctp-green border-ctp-green/40',
  'bg-ctp-sky/20 text-ctp-sky border-ctp-sky/40',
] as const;

interface SkillItemInnerProps extends SkillItemProps {
  /** When true, apply the full hover visuals even without a pointer hover
   *  (used for tap-to-activate on touch devices). */
  active?: boolean;
}

const SkillItem: React.FC<SkillItemInnerProps> = ({ skill, active }) => {
  const locale = useLocale();
  const { getLocalizedValue } = useLocalization();
  const description = getLocalizedValue(skill.description, locale as 'en-US' | 'pt-BR');
  const categoryName = skill.category
    ? getLocalizedValue(skill.category.name, locale as 'en-US' | 'pt-BR')
    : undefined;
  // Prefer the skill's own accent, fall back to its category accent.
  const accent = (skill.accentColor ?? skill.category?.accentColor) as GlareCardAccent | undefined;
  const svgCode = skill.svgCode ?? skill.category?.fallbackSvgCode;

  const accentText = accent ? ACCENT_TEXT[accent] : 'text-ctp-lavender';
  const accentRule = accent ? ACCENT_RULE[accent] : 'border-ctp-surface1';
  // Tags are metadata — keep them neutral so they don't compete with the accent.
  const tags = (skill.tags ?? []).slice(0, 3);

  const flavor = useCtpStore((state) => state.flavor);
  const isLightTheme = flavor === 'latte';

  // Scanning the SVG source is cheap but not free, and the source never changes
  // for a given skill — memo keeps it off every re-render.
  const logoHsl = useMemo(() => dominantLogoHsl(svgCode), [svgCode]);
  // Roughly half the icons are `currentColor`-only and yield nothing; those keep
  // the flat mantle background the card has always had.
  const cardBackground = logoGradient(logoHsl, isLightTheme);

  const tier = rarityTier(skill.proficiency);
  const cardWide = isCardWideTier(tier);

  return (
    <div className="group relative flex justify-center" data-card data-active={active || undefined}>
      {/* Lift the whole card toward the viewer on hover; transform-only so layout doesn't shift.
          `data-active` mirrors :hover for touch tap-to-activate. */}
      <div
        className={cn(
          'relative z-0 transform-gpu transition-transform duration-300 ease-out will-change-transform hover:z-30 hover:scale-[1.12]',
          active && 'z-30 scale-[1.12]'
        )}
      >
        <CatppuccinGlareCard
          accent={accent}
          active={active}
          rarity={tier}
          faceBackground={cardBackground}
        >
          <div className="flex h-full flex-col">
            {/* Header / name bar — title with a tiny category line under it. The
                accent colour already signals the category, so keep it small. */}
            <div className={cn('border-b bg-ctp-crust/50 px-3 py-2', accentRule)}>
              <span
                className={cn(
                  'block w-full truncate text-center text-sm font-bold leading-tight',
                  accentText
                )}
                title={skill.name}
              >
                {skill.name}
              </span>
              {categoryName && (
                <span className="mt-0.5 block truncate text-center text-[9px] uppercase tracking-wider text-ctp-subtext0">
                  {categoryName}
                </span>
              )}
            </div>

            {/* Art window — the foil shimmer sits behind the icon so light icons
                pop against it. */}
            <div
              className={cn(
                'relative mx-3 mt-3 flex items-center justify-center overflow-hidden rounded-md border py-4',
                accentRule
              )}
            >
              <FoilLayer className="rounded-md" seed={skill._id} logoHsl={logoHsl} />
              {/* Rarity treatment rides on top of the foil. The top tier is
                  handled card-wide by GlareCard instead. */}
              {tier && !cardWide && (
                <RarityFoil tier={tier} scope="window" className="rounded-md" />
              )}

              <svg width="0" height="0" style={{ position: 'absolute' }}>
                <title>Gradient</title>
                <defs>
                  <linearGradient id="skillGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgb(var(--ctp-teal))" />
                    <stop offset="50%" stopColor="rgb(var(--ctp-lavender))" />
                    <stop offset="100%" stopColor="rgb(var(--ctp-pink))" />
                  </linearGradient>
                </defs>
              </svg>

              {svgCode && (
                <div
                  className={cn(
                    'relative z-10 flex h-16 w-16 items-center justify-center',
                    accentText
                  )}
                >
                  <div
                    className="skill-svg-container flex h-full w-full items-center justify-center"
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: Sanity content
                    dangerouslySetInnerHTML={{ __html: svgCode }}
                  />
                </div>
              )}
            </div>

            {/* Tags — neutral metadata pills between the art window and the
                rules-text box. Wrap to at most two lines. */}
            {tags.length > 0 && (
              <div className="mt-2.5 flex max-h-11 flex-wrap justify-center gap-1 overflow-hidden px-3">
                {tags.map((tag, i) => (
                  <span
                    // Sanity doesn't enforce tag uniqueness — index the key so
                    // duplicate tags can't collide.
                    key={`${i}-${tag}`}
                    className={cn(
                      'rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider',
                      TAG_STYLES[i % TAG_STYLES.length]
                    )}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Rules-text box with the description */}
            <div className="mx-3 mb-3 mt-2.5 flex flex-1 items-start rounded-md border border-ctp-surface0 bg-ctp-crust/60 px-2.5 py-2">
              <p className="line-clamp-4 text-left text-[10px] leading-snug text-ctp-subtext1">
                {description}
              </p>
            </div>
          </div>
        </CatppuccinGlareCard>
      </div>
    </div>
  );
};

export default SkillItem;
