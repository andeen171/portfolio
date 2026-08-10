'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import type { ListSkillCategoriesQueryResult, ListSkillsQueryResult } from '@/sanity/types';
import { useLocalization } from '@/utils/localization';
import SkillList from './SkillList';

type Props = {
  skills: ListSkillsQueryResult;
  categories: ListSkillCategoriesQueryResult;
};

const ACCENT_CHIP: Record<string, string> = {
  teal: 'data-[active=true]:bg-ctp-teal data-[active=true]:text-ctp-crust border-ctp-teal/50 text-ctp-teal',
  lavender:
    'data-[active=true]:bg-ctp-lavender data-[active=true]:text-ctp-crust border-ctp-lavender/50 text-ctp-lavender',
  pink: 'data-[active=true]:bg-ctp-pink data-[active=true]:text-ctp-crust border-ctp-pink/50 text-ctp-pink',
  peach:
    'data-[active=true]:bg-ctp-peach data-[active=true]:text-ctp-crust border-ctp-peach/50 text-ctp-peach',
  green:
    'data-[active=true]:bg-ctp-green data-[active=true]:text-ctp-crust border-ctp-green/50 text-ctp-green',
  sky: 'data-[active=true]:bg-ctp-sky data-[active=true]:text-ctp-crust border-ctp-sky/50 text-ctp-sky',
};

const SkillsExplorer: React.FC<Props> = ({ skills, categories }) => {
  const t = useTranslations('skills');
  const locale = useLocale();
  const { getLocalizedValue } = useLocalization();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return skills.filter((skill) => {
      if (activeCategory && skill.category?._id !== activeCategory) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const description = getLocalizedValue(skill.description, locale as 'en-US' | 'pt-BR');
      const haystack = [skill.name, description, ...(skill.tags ?? [])].join(' ').toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [skills, query, activeCategory, locale, getLocalizedValue]);

  return (
    <div>
      <div className="mx-auto max-w-xl">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full rounded-full border border-ctp-surface1 bg-ctp-mantle px-5 py-3 text-ctp-text placeholder:text-ctp-subtext0 focus:outline-none focus:ring-2 focus:ring-ctp-lavender"
        />
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          data-active={activeCategory === null}
          onClick={() => setActiveCategory(null)}
          className="rounded-full border border-ctp-lavender/50 px-4 py-1.5 text-sm text-ctp-lavender transition-colors data-[active=true]:bg-ctp-lavender data-[active=true]:text-ctp-crust"
        >
          {t('allCategories')}
        </button>
        {categories.map((category) => {
          const name = getLocalizedValue(category.name, locale as 'en-US' | 'pt-BR');
          const accentClass = category.accentColor ? ACCENT_CHIP[category.accentColor] : '';
          return (
            <button
              key={category._id}
              type="button"
              data-active={activeCategory === category._id}
              onClick={() => setActiveCategory(category._id)}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm transition-colors',
                accentClass
              )}
            >
              {name}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-sm text-ctp-subtext0">
        {t('resultsCount', { count: filtered.length })}
      </p>

      <div className="mt-10">
        {filtered.length > 0 ? (
          <SkillList skills={filtered} />
        ) : (
          <p className="text-ctp-subtext0">{t('noResults')}</p>
        )}
      </div>
    </div>
  );
};

export default SkillsExplorer;
