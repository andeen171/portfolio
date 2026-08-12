'use client';

import { useLocale } from 'next-intl';
import CatppuccinGlareCard, { type GlareCardAccent } from '@/components/GlareCard';
import { cn } from '@/lib/utils';
import type { ListSkillsQueryResult } from '@/sanity/types';
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

const SkillItem: React.FC<SkillItemProps> = ({ skill }) => {
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

  return (
    <div className="group relative flex justify-center">
      {/* Lift the whole card toward the viewer on hover; transform-only so layout doesn't shift. */}
      <div className="relative z-0 transform-gpu transition-transform duration-300 ease-out will-change-transform hover:z-30 hover:scale-[1.18]">
        <CatppuccinGlareCard accent={accent}>
          <div className="flex h-full flex-col">
            {/* Header / name bar */}
            <div
              className={cn(
                'flex items-center justify-between gap-2 border-b bg-ctp-crust/50 px-3 py-2',
                accentRule
              )}
            >
              <span
                className={cn('truncate text-[13px] font-bold leading-tight', accentText)}
                title={skill.name}
              >
                {skill.name}
              </span>
              {categoryName && (
                <span className="shrink-0 rounded-full bg-ctp-mantle/70 px-2 py-0.5 text-[8px] uppercase tracking-wide text-ctp-subtext0">
                  {categoryName}
                </span>
              )}
            </div>

            {/* Art window */}
            <div
              className={cn(
                'mx-3 mt-3 flex items-center justify-center rounded-md border bg-ctp-base/60 py-4',
                accentRule
              )}
            >
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
                <div className={cn('flex h-16 w-16 items-center justify-center', accentText)}>
                  <div
                    className="skill-svg-container flex h-full w-full items-center justify-center"
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: Sanity content
                    dangerouslySetInnerHTML={{ __html: svgCode }}
                  />
                </div>
              )}
            </div>

            {/* Rules-text box with the description */}
            <div className="mx-3 mb-3 mt-3 flex flex-1 items-start rounded-md border border-ctp-surface0 bg-ctp-crust/60 px-2.5 py-2">
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
