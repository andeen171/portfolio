'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import type { ListSkillCategoriesQueryResult, ListSkillsQueryResult } from '@/sanity/types';
import CategoryChips from './CategoryChips';
import SkillItem from './SkillItem';

// One card per ~80% of a phone screen (so the next one peeks in), then 2/3/4
// across. The card itself is fluid up to its max width, so it always fits.
const SLIDE = 'basis-[80%] min-[480px]:basis-[60%] sm:basis-1/2 md:basis-1/3 xl:basis-1/4';

type Props = {
  skills: ListSkillsQueryResult;
  categories: ListSkillCategoriesQueryResult;
};

const SkillsSection: React.FC<Props> = ({ skills, categories }) => {
  const t = useTranslations('skills');
  // No "All" here — the carousel is always a single category, defaulting to the first one.
  const [activeCategory, setActiveCategory] = useState<string | null>(
    () => categories[0]?._id ?? null
  );
  const [api, setApi] = useState<CarouselApi>();

  const filtered = useMemo(() => {
    if (!activeCategory) return skills;
    return skills.filter((skill) => skill.category?._id === activeCategory);
  }, [skills, activeCategory]);

  // Switching category resets the carousel to the start.
  useEffect(() => {
    api?.scrollTo(0);
  }, [api]);

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
          onSelect={(id) => setActiveCategory(id)}
          showAll={false}
          plural
          className="mt-10"
        />

        {/* Embla carousel. Re-keyed on category so it re-inits at slide 0.
            The viewport bleeds into the page padding via negative margins so
            cards can extend past the container edge under the fade mask, and
            the vertical padding leaves room for an active card's lift. */}
        <Carousel
          key={activeCategory ?? 'all'}
          setApi={setApi}
          opts={{
            // Mobile centres one card at a time; sm+ keeps a start-aligned row.
            align: 'center',
            containScroll: 'trimSnaps',
            slidesToScroll: 1,
            breakpoints: {
              '(min-width: 640px)': { align: 'start' },
            },
            // A mouse drag on a card tilts it rather than scrolling the row;
            // touch swipes always drive the carousel.
            watchDrag: (_emblaApi, event) => {
              if ('touches' in event) return true;
              const target = event.target as HTMLElement | null;
              return !target?.closest('[data-card]');
            },
          }}
          className="-mx-6 mt-12 px-6 sm:mt-14 lg:mt-16"
        >
          <CarouselContent className="py-10">
            {filtered.map((skill) => (
              <CarouselItem key={skill._id} className={SLIDE}>
                <div className="flex justify-center">
                  <SkillItem skill={skill} />
                </div>
              </CarouselItem>
            ))}

            <CarouselItem className={SLIDE}>
              <div className="flex h-full justify-center">
                <Link
                  href="/skills"
                  className="flex aspect-5/7 w-full max-w-48 flex-col items-center justify-center gap-3 self-center rounded-2xl border border-dashed border-ctp-surface1 text-ctp-subtext0 transition-colors hover:border-ctp-lavender hover:text-ctp-lavender"
                >
                  <span className="max-w-28 text-sm font-semibold">{t('seeMore')}</span>
                  <span className="text-2xl" aria-hidden>
                    &rarr;
                  </span>
                </Link>
              </div>
            </CarouselItem>
          </CarouselContent>

          <CarouselPrevious label={t('previousSkills')} />
          <CarouselNext label={t('nextSkills')} />
        </Carousel>

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
