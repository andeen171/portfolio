'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselProgress,
} from '@/components/ui/carousel';
import SectionHeading from '@/components/ui/SectionHeading';
import { Link } from '@/i18n/routing';
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

  const filtered = useMemo(() => {
    if (!activeCategory) return skills;
    return skills.filter((skill) => skill.category?._id === activeCategory);
  }, [skills, activeCategory]);

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
        <SectionHeading index="04" eyebrow={t('eyebrow')} title={t('subtitle')} />
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-ctp-subtext1">{t('lede')}</p>

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
          label={t('carouselLabel')}
          roleDescription={t('carouselRole')}
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
          </CarouselContent>

          {/* Controls live under the row, not on top of it, so they never
              cover a card (or collide with the floating social links). */}
          <div className="grid grid-cols-[auto_1fr] items-center gap-x-5 gap-y-6 sm:grid-cols-[auto_1fr_auto]">
            <div className="flex gap-2">
              <CarouselPrevious label={t('previousSkills')} />
              <CarouselNext label={t('nextSkills')} />
            </div>
            <CarouselProgress className="max-w-md" />
            {/* Raw lavender is 2.8:1 on latte's base; its 900 shade reads. */}
            <Link
              href="/skills"
              className="group col-span-2 inline-flex items-center gap-1.5 justify-self-center rounded-sm font-semibold text-ctp-lavender transition-colors hover:text-ctp-pink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-lavender sm:col-span-1 sm:justify-self-end latte:text-ctp-lavender-900 latte:hover:text-ctp-pink-950"
            >
              {t('seeMore')}
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                &rarr;
              </span>
            </Link>
          </div>
        </Carousel>
      </div>
    </div>
  );
};

export default SkillsSection;
