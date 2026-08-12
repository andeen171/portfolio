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
      <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
        <div className="animated-gradient-text mx-auto max-w-2xl font-nf lg:text-center">
          <h2 className="text-base font-semibold leading-7">{t('title')}</h2>
          <p className="py-2 text-3xl font-bold tracking-tight sm:text-4xl">{t('subtitle')}</p>
        </div>

        <CategoryChips
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
          showAll={false}
          plural
          className="mt-10"
        />

        {/* Mobile: horizontal snap carousel ending in a "see all" card. */}
        <div className="-mx-6 mt-12 sm:hidden">
          <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4 pt-10">
            {filtered.map((skill) => (
              <div key={skill._id} className="w-64 shrink-0 snap-center">
                <SkillItem skill={skill} />
              </div>
            ))}
            <Link
              href="/skills"
              className="flex h-80 w-40 shrink-0 snap-center flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ctp-surface1 text-ctp-subtext0 transition-colors hover:border-ctp-lavender hover:text-ctp-lavender"
            >
              <span className="max-w-28 text-sm font-semibold">{t('seeMore')}</span>
              <span className="text-2xl" aria-hidden>
                &rarr;
              </span>
            </Link>
          </div>
        </div>

        {/* Desktop: one responsive row. overflow-x-clip keeps the tail to a single
            line; overflow-y-visible + vertical padding let hover-scaled cards escape. */}
        <div className="mx-auto mt-12 hidden max-w-2xl sm:mt-14 sm:block lg:mt-16 lg:max-w-6xl">
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
                  className="flex shrink-0 basis-[calc((100%-2rem)/2)] justify-center md:basis-[calc((100%-4rem)/3)] xl:basis-[calc((100%-6rem)/4)]"
                >
                  <SkillItem skill={skill} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 hidden text-center sm:block">
          <Link className="text-lg font-semibold text-ctp-lavender" href="/skills">
            {t('seeMore')} &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SkillsSection;
