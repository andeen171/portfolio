'use client';

import {
  ArrowUpIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { isSkillSort, SKILL_SORTS, type SkillSort, sortSkills } from '@/lib/skillSort';
import { cn } from '@/lib/utils';
import type { ListSkillCategoriesQueryResult, ListSkillsQueryResult } from '@/sanity/types';
import { useLocalization } from '@/utils/localization';
import CategoryChips, { useCategoryLabel } from './CategoryChips';
import SkillList from './SkillList';

type Props = {
  skills: ListSkillsQueryResult;
  categories: ListSkillCategoriesQueryResult;
};

// Static class strings so Tailwind's compiler can see them. On latte the
// heading text takes the accent's 950 shade (the raw accents are 2.3-3.3:1
// there); the rule beside it keeps the full-strength accent.
const ACCENT_HEADING: Record<string, string> = {
  teal: 'text-ctp-teal from-ctp-teal/40 latte:text-ctp-teal-950',
  lavender: 'text-ctp-lavender from-ctp-lavender/40 latte:text-ctp-lavender-950',
  pink: 'text-ctp-pink from-ctp-pink/40 latte:text-ctp-pink-950',
  peach: 'text-ctp-peach from-ctp-peach/40 latte:text-ctp-peach-950',
  green: 'text-ctp-green from-ctp-green/40 latte:text-ctp-green-950',
  sky: 'text-ctp-sky from-ctp-sky/40 latte:text-ctp-sky-950',
};

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * The /skills page body: a search + category toolbar, a results row with the
 * count and the sort, and the card grid.
 *
 * The toolbar scrolls away with the page rather than sticking under the
 * navbar (two stacked bars read as one broken bar). Once it is out of view, a
 * small floating button offers the way back to it, carrying the active filter
 * so you can tell what you're looking at while deep in the grid.
 */
const SkillsExplorer: React.FC<Props> = ({ skills, categories }) => {
  const t = useTranslations('skills');
  const locale = useLocale() as 'en-US' | 'pt-BR';
  const { getLocalizedValue } = useLocalization();
  const categoryLabel = useCategoryLabel();

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<SkillSort>('category');

  const toolbarRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const toolbarVisible = useInView(toolbarRef);
  const reachedEnd = useReached(endRef);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const matches = skills.filter((skill) => {
      if (activeCategory && skill.category?._id !== activeCategory) return false;
      if (!normalizedQuery) return true;

      const haystack = [
        skill.name,
        getLocalizedValue(skill.description, locale),
        skill.category ? getLocalizedValue(skill.category.name, locale) : '',
        ...(skill.tags ?? []),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });

    return sortSkills(matches, sort);
  }, [skills, query, activeCategory, sort, locale, getLocalizedValue]);

  // In category order with every category showing, the grid is split into
  // one titled group per category so a long scroll stays legible.
  const groups = useMemo(() => {
    if (sort !== 'category' || activeCategory) return null;
    return categories
      .map((category) => ({
        category,
        skills: filtered.filter((skill) => skill.category?._id === category._id),
      }))
      .filter((group) => group.skills.length > 0);
  }, [sort, activeCategory, categories, filtered]);

  const focusSearch = () => {
    toolbarRef.current?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    });
    // Only pull focus with a mouse/trackpad: on touch it would pop the
    // keyboard over the grid the user just asked to see.
    if (window.matchMedia('(pointer: fine)').matches) {
      searchRef.current?.focus({ preventScroll: true });
    }
  };

  // `/` jumps to the search from anywhere on the page.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
      event.preventDefault();
      focusSearch();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const activeCategoryDoc = categories.find((category) => category._id === activeCategory);
  const hasFilters = !!query.trim() || !!activeCategory;
  const clearFilters = () => {
    setQuery('');
    setActiveCategory(null);
  };

  return (
    <div>
      <div ref={toolbarRef} className="scroll-mt-28">
        <div className="relative mx-auto max-w-xl">
          <MagnifyingGlassIcon
            aria-hidden
            className="pointer-events-none absolute left-4 top-1/2 z-10 size-5 -translate-y-1/2 text-ctp-subtext0"
          />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setQuery('');
            }}
            placeholder={t('searchPlaceholder')}
            aria-label={t('searchLabel')}
            className="w-full rounded-full border border-ctp-surface1 bg-ctp-mantle/80 py-3 pl-12 pr-12 text-ctp-text shadow-sm backdrop-blur-sm transition-colors placeholder:text-ctp-subtext0 hover:border-ctp-surface2 focus:border-ctp-lavender focus:outline-none focus:ring-2 focus:ring-ctp-lavender/40 [&::-webkit-search-cancel-button]:appearance-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                searchRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full p-1.5 text-ctp-subtext0 transition-colors hover:bg-ctp-surface0 hover:text-ctp-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-lavender"
            >
              <XMarkIcon className="size-4" />
              <span className="sr-only">{t('clearSearch')}</span>
            </button>
          ) : (
            <kbd
              aria-hidden
              className="pointer-events-none absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-md border border-ctp-surface1 px-1.5 font-mono text-xs text-ctp-subtext0 [@media(pointer:fine)]:block"
            >
              /
            </kbd>
          )}
        </div>

        <CategoryChips
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
          plural
          className="mt-5"
        />
      </div>

      {/* Results row: what you're looking at, and how it's ordered. */}
      <div className="mt-10 flex items-center justify-between gap-4 border-b border-ctp-surface0 pb-3">
        {/* Left-aligned against the page's centred text, and wrapping as a
            unit when a long count and the clear link don't share a line. */}
        <p
          aria-live="polite"
          className="flex flex-wrap items-baseline gap-x-3 text-left text-sm text-ctp-subtext0"
        >
          {t('results', { count: filtered.length })}
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-sm font-medium text-ctp-lavender underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-lavender latte:text-ctp-lavender-900"
            >
              {t('clearFilters')}
            </button>
          )}
        </p>

        <label className="flex items-center gap-2 text-sm">
          <span className="hidden text-ctp-subtext0 sm:inline">{t('sortLabel')}</span>
          <span className="relative">
            <select
              value={sort}
              onChange={(event) => {
                if (isSkillSort(event.target.value)) setSort(event.target.value);
              }}
              aria-label={t('sortLabel')}
              className="cursor-pointer appearance-none rounded-full border border-ctp-surface1 bg-ctp-mantle/80 py-1.5 pl-4 pr-9 text-sm font-medium text-ctp-text [color-scheme:dark] transition-colors hover:border-ctp-surface2 focus:border-ctp-lavender focus:outline-none focus:ring-2 focus:ring-ctp-lavender/40 latte:[color-scheme:light]"
            >
              {SKILL_SORTS.map((option) => (
                <option key={option} value={option}>
                  {t(`sort.${option}`)}
                </option>
              ))}
            </select>
            <ChevronDownIcon
              aria-hidden
              className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ctp-subtext0"
            />
          </span>
        </label>
      </div>

      {/* Re-keyed on sort/category so the cards deal in again on a change;
          typing in the search doesn't replay it. */}
      <div key={`${sort}|${activeCategory}`} className="mt-8">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16">
            <MagnifyingGlassIcon aria-hidden className="size-10 text-ctp-surface2" />
            <p className="text-ctp-subtext0">{t('noResults')}</p>
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-full border border-ctp-lavender/50 px-4 py-1.5 text-sm font-medium text-ctp-lavender transition-colors hover:bg-ctp-lavender/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-lavender latte:text-ctp-lavender-900"
            >
              {t('clearFilters')}
            </button>
          </div>
        ) : groups ? (
          <div className="space-y-14">
            {groups.map(({ category, skills: groupSkills }) => (
              <section key={category._id} aria-labelledby={`skills-${category._id}`}>
                {/* h2: the page's h1 is the title; cards are h3 within. */}
                <h2
                  id={`skills-${category._id}`}
                  className={cn(
                    'mb-6 flex items-center gap-3 text-left font-nf text-lg font-semibold',
                    ACCENT_HEADING[category.accentColor ?? 'lavender']
                  )}
                >
                  {categoryLabel(category, true)}
                  <span className="rounded-full bg-ctp-surface0 px-2 py-0.5 font-sans text-xs font-medium text-ctp-subtext0">
                    {groupSkills.length}
                  </span>
                  <span aria-hidden className="h-px flex-1 bg-linear-to-r to-transparent" />
                </h2>
                <SkillList skills={groupSkills} />
              </section>
            ))}
          </div>
        ) : (
          <SkillList skills={filtered} />
        )}
      </div>

      {/* Past the last card there's nothing left to filter, and the button
          would sit on the footer's text, so it bows out here. */}
      <div ref={endRef} aria-hidden />

      <BackToFilters
        visible={!toolbarVisible && !reachedEnd}
        label={t('backToFilters')}
        summary={
          activeCategoryDoc
            ? categoryLabel(activeCategoryDoc, true)
            : query.trim()
              ? `“${query.trim()}”`
              : undefined
        }
        onClick={focusSearch}
      />
    </div>
  );
};

/**
 * Floating shortcut back to the toolbar, shown once it has scrolled away.
 * A labelled pill centred at the bottom on larger screens; a round button in
 * the bottom-left corner on phones, clear of the social links on the right.
 */
const BackToFilters = ({
  visible,
  label,
  summary,
  onClick,
}: {
  visible: boolean;
  label: string;
  summary?: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-hidden={!visible}
    tabIndex={visible ? 0 : -1}
    className={cn(
      'fixed bottom-5 left-5 z-40 flex items-center gap-2 rounded-full border border-ctp-overlay0/20 bg-ctp-base/80 p-3.5 text-sm font-medium text-ctp-text shadow-lg backdrop-blur-lg transition-[opacity,translate] duration-300 hover:border-ctp-lavender/50 hover:text-ctp-lavender focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-lavender motion-reduce:transition-none sm:left-1/2 sm:-translate-x-1/2 sm:px-4 sm:py-2.5',
      visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
    )}
  >
    <MagnifyingGlassIcon aria-hidden className="size-5 sm:size-4" />
    <span className="sr-only sm:not-sr-only">{label}</span>
    {summary && (
      <span className="hidden max-w-40 truncate rounded-full bg-ctp-surface0 px-2 py-0.5 text-xs text-ctp-subtext1 sm:inline">
        {summary}
      </span>
    )}
    {summary && (
      <span
        aria-hidden
        className="absolute right-1 top-1 size-2.5 rounded-full bg-ctp-lavender ring-2 ring-ctp-base sm:hidden"
      />
    )}
    <ArrowUpIcon aria-hidden className="hidden size-4 sm:block" />
  </button>
);

/** Whether an element is on screen, below the fixed header. */
function useInView(ref: React.RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setInView(!!entry?.isIntersecting), {
      // Treat the strip under the fixed header as off-screen.
      rootMargin: '-96px 0px 0px 0px',
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return inView;
}

/** Whether an element has come on screen from below, and stays true once it
 *  has scrolled past the top. */
function useReached(ref: React.RefObject<HTMLElement | null>) {
  const [reached, setReached] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry) setReached(entry.isIntersecting || entry.boundingClientRect.top < 0);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return reached;
}

export default SkillsExplorer;
