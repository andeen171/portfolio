'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import type { ListSkillCategoriesQueryResult, ListSkillsQueryResult } from '@/sanity/types';
import { useLocalization } from '@/utils/localization';
import CategoryChips from './CategoryChips';
import SkillList from './SkillList';

type Props = {
  skills: ListSkillsQueryResult;
  categories: ListSkillCategoriesQueryResult;
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
      {/* Sticky search + chips so they stay reachable while scrolling the grid.
          No background on the bar itself (a solid strip looked detached from
          the navbar); a radial veil behind it does the hiding instead. */}
      <div className="sticky top-20 z-40 -mx-4 px-4 pb-2 isolate">
        {/* Bleeds past the bar on every side so the fade finishes in open space
            rather than at a visible edge. Behind the controls, never over them. */}
        <div
          aria-hidden
          className="skills-bar-veil pointer-events-none absolute -inset-x-24 -top-10 -bottom-8 -z-10"
        />
        <div className="mx-auto max-w-xl">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full rounded-full border border-ctp-surface1 bg-ctp-mantle/80 px-5 py-3 text-ctp-text placeholder:text-ctp-subtext0 focus:outline-none focus:ring-2 focus:ring-ctp-lavender"
          />
        </div>

        <CategoryChips
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
          plural
          className="mt-6"
        />
      </div>

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
