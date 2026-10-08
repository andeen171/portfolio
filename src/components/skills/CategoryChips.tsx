'use client';

import { useLocale, useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { ListSkillCategoriesQueryResult } from '@/sanity/types';
import { useLocalization } from '@/utils/localization';

type Props = {
  categories: ListSkillCategoriesQueryResult;
  activeCategory: string | null;
  onSelect: (categoryId: string | null) => void;
  /** Renders an "All" chip that selects null. */
  showAll?: boolean;
  /** Renders pluralized category names (selector) instead of the singular card form. */
  plural?: boolean;
  className?: string;
};

// Static class strings (not built dynamically) so Tailwind's compiler can see them.
// On latte the raw accents are too pale to read as text (2.2-3.3:1), so the
// label and the active fill drop to the accent's 950 shade there; borders and
// hover tints keep the full-strength accent.
const ACCENT_CHIP: Record<string, string> = {
  teal: 'border-ctp-teal/50 text-ctp-teal hover:border-ctp-teal hover:bg-ctp-teal/10 data-[active=true]:bg-ctp-teal data-[active=true]:text-ctp-crust latte:text-ctp-teal-950 latte:data-[active=true]:bg-ctp-teal-950 latte:data-[active=true]:text-ctp-base',
  lavender:
    'border-ctp-lavender/50 text-ctp-lavender hover:border-ctp-lavender hover:bg-ctp-lavender/10 data-[active=true]:bg-ctp-lavender data-[active=true]:text-ctp-crust latte:text-ctp-lavender-950 latte:data-[active=true]:bg-ctp-lavender-950 latte:data-[active=true]:text-ctp-base',
  pink: 'border-ctp-pink/50 text-ctp-pink hover:border-ctp-pink hover:bg-ctp-pink/10 data-[active=true]:bg-ctp-pink data-[active=true]:text-ctp-crust latte:text-ctp-pink-950 latte:data-[active=true]:bg-ctp-pink-950 latte:data-[active=true]:text-ctp-base',
  peach:
    'border-ctp-peach/50 text-ctp-peach hover:border-ctp-peach hover:bg-ctp-peach/10 data-[active=true]:bg-ctp-peach data-[active=true]:text-ctp-crust latte:text-ctp-peach-950 latte:data-[active=true]:bg-ctp-peach-950 latte:data-[active=true]:text-ctp-base',
  green:
    'border-ctp-green/50 text-ctp-green hover:border-ctp-green hover:bg-ctp-green/10 data-[active=true]:bg-ctp-green data-[active=true]:text-ctp-crust latte:text-ctp-green-950 latte:data-[active=true]:bg-ctp-green-950 latte:data-[active=true]:text-ctp-base',
  sky: 'border-ctp-sky/50 text-ctp-sky hover:border-ctp-sky hover:bg-ctp-sky/10 data-[active=true]:bg-ctp-sky data-[active=true]:text-ctp-crust latte:text-ctp-sky-950 latte:data-[active=true]:bg-ctp-sky-950 latte:data-[active=true]:text-ctp-base',
};

const CHIP_BASE =
  'cursor-pointer rounded-full border bg-ctp-mantle/80 px-4 py-1.5 text-sm font-medium transition-colors duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-lavender focus-visible:ring-offset-2 focus-visible:ring-offset-ctp-base';

type Category = ListSkillCategoriesQueryResult[number];

/**
 * Localized category name — plural for selectors and headings, singular on
 * cards. Sanity only holds the singular, so the plurals live in the messages
 * (`skills.categoryPlural`), keyed by category id; a category added in Sanity
 * without one falls back to its singular name.
 */
export function useCategoryLabel() {
  const locale = useLocale() as 'en-US' | 'pt-BR';
  const t = useTranslations('skills.categoryPlural');
  const { getLocalizedValue } = useLocalization();
  return (category: Pick<Category, '_id' | 'name'>, plural = false) =>
    plural && t.has(category._id) ? t(category._id) : getLocalizedValue(category.name, locale);
}

const CategoryChips: React.FC<Props> = ({
  categories,
  activeCategory,
  onSelect,
  showAll = true,
  plural = false,
  className,
}) => {
  const t = useTranslations('skills');
  const categoryLabel = useCategoryLabel();

  return (
    <div className={cn('flex flex-wrap justify-center gap-2', className)}>
      {showAll && (
        <button
          type="button"
          data-active={activeCategory === null}
          aria-pressed={activeCategory === null}
          onClick={() => onSelect(null)}
          className={cn(CHIP_BASE, ACCENT_CHIP.lavender)}
        >
          {t('allCategories')}
        </button>
      )}
      {categories.map((category) => {
        const accentClass = category.accentColor ? ACCENT_CHIP[category.accentColor] : '';
        return (
          <button
            key={category._id}
            type="button"
            data-active={activeCategory === category._id}
            aria-pressed={activeCategory === category._id}
            onClick={() => onSelect(category._id)}
            className={cn(CHIP_BASE, accentClass)}
          >
            {categoryLabel(category, plural)}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryChips;
