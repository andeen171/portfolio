'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import type { ListSkillCategoriesQueryResult, ListSkillsQueryResult } from '@/sanity/types';
import CategoryChips from './CategoryChips';
import SkillItem from './SkillItem';

type Props = {
  skills: ListSkillsQueryResult;
  categories: ListSkillCategoriesQueryResult;
};

const SkillsSection: React.FC<Props> = ({ skills, categories }) => {
  const t = useTranslations('skills');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!activeCategory) return skills;
    return skills.filter((skill) => skill.category?._id === activeCategory);
  }, [skills, activeCategory]);

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto text-center max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center animated-gradient-text font-nf">
          <h2 className="text-base font-semibold leading-7">{t('title')}</h2>
          <p className="py-2 text-3xl font-bold tracking-tight sm:text-4xl">{t('subtitle')}</p>
        </div>

        <CategoryChips
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
          className="mt-10"
        />

        <div className="mx-auto mt-12 max-w-2xl sm:mt-14 lg:mt-16 lg:max-w-7xl">
          {/* One responsive row: a nowrap flex row clips to a single line, and
              nth-child rules hide any card beyond the count that fits per breakpoint. */}
          <div className="flex flex-nowrap justify-start gap-8 overflow-hidden">
            {filtered.map((skill) => (
              <div
                key={skill._id}
                className="shrink-0 basis-full sm:basis-[calc((100%-2rem)/2)] md:basis-[calc((100%-4rem)/3)] lg:basis-[calc((100%-6rem)/4)] xl:basis-[calc((100%-8rem)/5)] flex justify-center"
              >
                <SkillItem skill={skill} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link className="text-lg font-semibold text-ctp-lavender" href="/skills">
            {t('seeMore')} &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SkillsSection;
