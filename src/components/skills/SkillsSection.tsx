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
  // On touch devices a tap activates a card's hover visuals; it stays active
  // until another card is tapped or the user taps outside any card.
  const [pressedCardId, setPressedCardId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!activeCategory) return skills;
    return skills.filter((skill) => skill.category?._id === activeCategory);
  }, [skills, activeCategory]);

  // Switching category resets the carousel to the start.
  useEffect(() => {
    api?.scrollTo(0);
  }, [api]);

  // Dismiss the tapped-active card when the user presses outside any card.
  useEffect(() => {
    if (!pressedCardId) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest('[data-card]')) setPressedCardId(null);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [pressedCardId]);

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
            Viewport bleeds into the page padding via negative margins so cards
            can extend past the container edge under the fade mask. Cards scale
            up on hover/tap, so the slide gets matching horizontal padding to
            keep the scaled card inside the viewport instead of clipping at the
            carousel edge on narrow screens. */}
        <Carousel
          key={activeCategory ?? 'all'}
          setApi={setApi}
          opts={{
            // Mobile centres one card at a time (no fade under the first card);
            // sm+ keeps the multi-card start-aligned row.
            align: 'center',
            containScroll: 'trimSnaps',
            slidesToScroll: 1,
            breakpoints: {
              '(min-width: 640px)': { align: 'start' },
            },
            // Let drags that begin on a card fall through to native vertical
            // page scroll; only gaps/arrows drive the carousel. On desktop this
            // is a no-op (pointer drags on cards just tilt them).
            watchDrag: (_emblaApi, event) => {
              const target = event.target as HTMLElement | null;
              return !target?.closest('[data-card]');
            },
          }}
          className="-mx-6 mt-12 px-6 sm:mt-14 lg:mt-16"
        >
          <CarouselContent className="-ml-4 px-4 py-14 sm:-ml-6 sm:px-6">
            {filtered.map((skill) => (
              <CarouselItem
                key={skill._id}
                className="basis-[74%] pl-0 min-[400px]:basis-[68%] sm:basis-1/2 md:basis-1/3 xl:basis-1/4"
              >
                <div
                  className="flex justify-center"
                  onPointerUp={(e) => {
                    // Tap-to-activate on coarse (touch) pointers only.
                    if (e.pointerType !== 'touch') return;
                    setPressedCardId((prev) => (prev === skill._id ? null : skill._id));
                  }}
                >
                  <SkillItem skill={skill} active={pressedCardId === skill._id} />
                </div>
              </CarouselItem>
            ))}

            <CarouselItem className="basis-[74%] pl-0 min-[400px]:basis-[68%] sm:basis-1/2 md:basis-1/3 xl:basis-1/4">
              <div className="flex justify-center">
                <Link
                  href="/skills"
                  className="flex h-80 w-40 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ctp-surface1 text-ctp-subtext0 transition-colors hover:border-ctp-lavender hover:text-ctp-lavender"
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
