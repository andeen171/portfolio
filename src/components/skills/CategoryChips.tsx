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
const ACCENT_CHIP: Record<string, string> = {
  teal: 'border-ctp-teal/50 text-ctp-teal hover:border-ctp-teal hover:bg-ctp-teal/10 data-[active=true]:bg-ctp-teal data-[active=true]:text-ctp-crust',
  lavender:
    'border-ctp-lavender/50 text-ctp-lavender hover:border-ctp-lavender hover:bg-ctp-lavender/10 data-[active=true]:bg-ctp-lavender data-[active=true]:text-ctp-crust',
  pink: 'border-ctp-pink/50 text-ctp-pink hover:border-ctp-pink hover:bg-ctp-pink/10 data-[active=true]:bg-ctp-pink data-[active=true]:text-ctp-crust',
  peach:
    'border-ctp-peach/50 text-ctp-peach hover:border-ctp-peach hover:bg-ctp-peach/10 data-[active=true]:bg-ctp-peach data-[active=true]:text-ctp-crust',
  green:
    'border-ctp-green/50 text-ctp-green hover:border-ctp-green hover:bg-ctp-green/10 data-[active=true]:bg-ctp-green data-[active=true]:text-ctp-crust',
  sky: 'border-ctp-sky/50 text-ctp-sky hover:border-ctp-sky hover:bg-ctp-sky/10 data-[active=true]:bg-ctp-sky data-[active=true]:text-ctp-crust',
};

const CHIP_BASE =
  'cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-colors duration-200 active:scale-95';

// Plural chip labels keyed by category id (selector only; cards keep the singular name).
const PLURAL_LABELS: Record<string, Record<'en-US' | 'pt-BR', string>> = {
  'skillCategory-language': { 'en-US': 'Languages', 'pt-BR': 'Linguagens' },
  'skillCategory-framework': { 'en-US': 'Frameworks', 'pt-BR': 'Frameworks' },
  'skillCategory-database': { 'en-US': 'Databases', 'pt-BR': 'Bancos de Dados' },
  'skillCategory-tool': { 'en-US': 'Tools', 'pt-BR': 'Ferramentas' },
  'skillCategory-soft-skill': { 'en-US': 'Soft Skills', 'pt-BR': 'Interpessoais' },
};

const CategoryChips: React.FC<Props> = ({
  categories,
  activeCategory,
  onSelect,
  showAll = true,
  plural = false,
  className,
}) => {
  const t = useTranslations('skills');
  const locale = useLocale() as 'en-US' | 'pt-BR';
  const { getLocalizedValue } = useLocalization();

  return (
    <div className={cn('flex flex-wrap justify-center gap-2', className)}>
      {showAll && (
        <button
          type="button"
          data-active={activeCategory === null}
          onClick={() => onSelect(null)}
          className={cn(
            CHIP_BASE,
            'border-ctp-lavender/50 text-ctp-lavender hover:border-ctp-lavender hover:bg-ctp-lavender/10 data-[active=true]:bg-ctp-lavender data-[active=true]:text-ctp-crust'
          )}
        >
          {t('allCategories')}
        </button>
      )}
      {categories.map((category) => {
        const singular = getLocalizedValue(category.name, locale);
        const pluralLabel = plural ? PLURAL_LABELS[category._id]?.[locale] : undefined;
        const name = pluralLabel ?? singular;
        const accentClass = category.accentColor ? ACCENT_CHIP[category.accentColor] : '';
        return (
          <button
            key={category._id}
            type="button"
            data-active={activeCategory === category._id}
            onClick={() => onSelect(category._id)}
            className={cn(CHIP_BASE, accentClass)}
          >
            {name}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryChips;
