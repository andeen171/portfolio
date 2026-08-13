'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { ListSkillCategoriesQueryResult, ListSkillsQueryResult } from '@/sanity/types';
import CategoryChips from './CategoryChips';
import SkillItem from './SkillItem';

type Props = {
  skills: ListSkillsQueryResult;
  categories: ListSkillCategoriesQueryResult;
};

// Shared arrow button styling for the carousel.
const ARROW_CLASSES =
  'flex size-10 shrink-0 items-center justify-center rounded-full border border-ctp-surface1 bg-ctp-mantle text-xl text-ctp-subtext0 transition-colors hover:border-ctp-lavender hover:text-ctp-lavender disabled:pointer-events-none disabled:opacity-30';

const SkillsSection: React.FC<Props> = ({ skills, categories }) => {
  const t = useTranslations('skills');
  // No "All" here — the carousel is always a single category, defaulting to the first one.
  const [activeCategory, setActiveCategory] = useState<string | null>(
    () => categories[0]?._id ?? null
  );
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const filtered = useMemo(() => {
    if (!activeCategory) return skills;
    return skills.filter((skill) => skill.category?._id === activeCategory);
  }, [skills, activeCategory]);

  const updateArrows = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const { scrollLeft, clientWidth, scrollWidth } = track;
    setCanPrev(scrollLeft > 2);
    setCanNext(scrollLeft + clientWidth < scrollWidth - 2);
  }, []);

  // Scroll by a full "page" of cards. Card width derives from the first item
  // so it tracks the responsive basis classes instead of hardcoding a number.
  const scrollByPage = useCallback((direction: 1 | -1) => {
    const track = trackRef.current;
    const first = track?.firstElementChild;
    if (!track || !first) return;
    track.scrollBy({
      left: direction * (first.clientWidth + 32),
      behavior: 'smooth',
    });
  }, []);

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
          onSelect={(id) => {
            setActiveCategory(id);
            trackRef.current?.scrollTo({ left: 0 });
            // The track remounts items; let layout settle before reading widths.
            requestAnimationFrame(updateArrows);
          }}
          showAll={false}
          plural
          className="mt-10"
        />

        {/* Carousel with arrow controls on every viewport. snap-proximity keeps
            swipe scrolling natural on touch without yanking the track, and
            touch-pan-y on the cards lets vertical page scroll win over drag. */}
        <div className="mt-12 flex items-center gap-3 sm:mt-14 sm:gap-4 lg:mt-16">
          <button
            type="button"
            aria-label={t('previousSkills')}
            className={ARROW_CLASSES}
            disabled={!canPrev}
            onClick={() => scrollByPage(-1)}
          >
            <span aria-hidden>&larr;</span>
          </button>

          <div
            ref={trackRef}
            onScroll={updateArrows}
            className="flex flex-1 snap-x snap-proximity gap-8 overflow-x-auto px-1 py-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {filtered.map((skill) => (
              <div
                key={skill._id}
                className="flex w-64 shrink-0 snap-center justify-center sm:w-auto sm:basis-[calc((100%-2rem)/2)] md:basis-[calc((100%-4rem)/3)] xl:basis-[calc((100%-6rem)/4)]"
              >
                <SkillItem skill={skill} />
              </div>
            ))}
            <Link
              href="/skills"
              className="flex h-80 w-40 shrink-0 snap-center flex-col items-center justify-center gap-3 self-center rounded-2xl border border-dashed border-ctp-surface1 text-ctp-subtext0 transition-colors hover:border-ctp-lavender hover:text-ctp-lavender"
            >
              <span className="max-w-28 text-sm font-semibold">{t('seeMore')}</span>
              <span className="text-2xl" aria-hidden>
                &rarr;
              </span>
            </Link>
          </div>

          <button
            type="button"
            aria-label={t('nextSkills')}
            className={ARROW_CLASSES}
            disabled={!canNext}
            onClick={() => scrollByPage(1)}
          >
            <span aria-hidden>&rarr;</span>
          </button>
        </div>

        <div className="mt-4 text-center">
          <Link className="text-lg font-semibold text-ctp-lavender" href="/skills">
            {t('seeMore')} &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SkillsSection;
