'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import type { ListSkillCategoriesQueryResult, ListSkillsQueryResult } from '@/sanity/types';
import CategoryChips from './CategoryChips';
import SkillItem from './SkillItem';

type Props = {
  skills: ListSkillsQueryResult;
  categories: ListSkillCategoriesQueryResult;
};

const SkillsSection: React.FC<Props> = ({ skills, categories }) => {
  const t = useTranslations('skills');
  // No "All" here — the row is always a single category, defaulting to the first one.
  const [activeCategory, setActiveCategory] = useState<string | null>(
    () => categories[0]?._id ?? null
  );

  const filtered = useMemo(() => {
    if (!activeCategory) return skills;
    return skills.filter((skill) => skill.category?._id === activeCategory);
  }, [skills, activeCategory]);

  // The row is left-aligned below lg, where a clipped tail card doubles as a
  // "there's more" hint; from lg up the full row fits, so it can be centered.
  const rowIsFull = filtered.length <= 4;

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
          showAll={false}
          className="mt-10"
        />

        <div className="mx-auto mt-12 max-w-2xl sm:mt-14 lg:mt-16 lg:max-w-6xl">
          {/* One responsive row: nowrap + overflow-hidden clips the tail to a single
              line. overflow-visible is required on the Y axis (and extra vertical
              padding) so hover-scaled cards aren't clipped. */}
          <div className="overflow-x-clip overflow-y-visible px-1 py-10">
            <div
              className={cn(
                'flex flex-nowrap gap-8',
                rowIsFull ? 'justify-center' : 'justify-start'
              )}
            >
              {filtered.map((skill) => (
                <div
                  key={skill._id}
                  className="flex shrink-0 basis-[min(100%,16rem)] justify-center sm:basis-[calc((100%-2rem)/2)] md:basis-[calc((100%-4rem)/3)] xl:basis-[calc((100%-6rem)/4)]"
                >
                  <SkillItem skill={skill} />
                </div>
              ))}
            </div>
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
