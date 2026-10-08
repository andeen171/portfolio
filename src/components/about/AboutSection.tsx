'use client';

import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState } from 'react';
import ProfileCard from '@/components/home/ProfileCard';
import TypedText from '@/components/home/TypedText';
import SectionHeading from '@/components/ui/SectionHeading';
import { SOCIALS } from '@/lib/social';
import { cn } from '@/lib/utils';

const ROLE_KEYS = ['backend', 'fullstack', 'linux', 'entrepreneur', 'father', 'thinker'] as const;

/** Paragraphs left showing while collapsed, by breakpoint. */
const KEEP_MOBILE = 1;
const KEEP_DESKTOP = 2;

type Heights = { collapsed: number; full: number };

const AboutSection: React.FC = () => {
  const t = useTranslations('about');
  const bodyId = useId();
  const innerRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [heights, setHeights] = useState<Heights | null>(null);

  const roles = ROLE_KEYS.map((key) => t(`typedStrings.${key}`));
  const paragraphs = t('description')
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean);

  // Measure the live text rather than hidden copies: the inner wrapper is
  // never clamped, so its height is the full text, and the last paragraph we
  // keep marks the collapsed cut. A ResizeObserver re-measures whenever the
  // text reflows (viewport width, web font arriving, locale switch) without
  // touching the expanded state, so mobile toolbar resizes don't fold the
  // text back up mid-read.
  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;

    const measure = () => {
      const blocks = inner.querySelectorAll<HTMLParagraphElement>(':scope > p');
      const keep = window.matchMedia('(min-width: 640px)').matches ? KEEP_DESKTOP : KEEP_MOBILE;
      const last = blocks[Math.min(keep, blocks.length) - 1];
      const full = inner.offsetHeight;
      const collapsed = last ? last.offsetTop + last.offsetHeight : full;
      setHeights((prev) =>
        prev?.collapsed === collapsed && prev.full === full ? prev : { collapsed, full }
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

  // Until measured (and without JS) the whole text shows.
  const canCollapse = heights !== null && heights.full > heights.collapsed + 1;
  const clamped = canCollapse && !isExpanded;

  return (
    <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <div className="grid gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
        <SectionHeading
          as="h2"
          align="left"
          index="01"
          eyebrow={t('eyebrow')}
          title={t('title')}
          className="lg:col-start-1 lg:row-start-1"
        />

        <ProfileCard
          name={t('card.name')}
          type={t('card.type')}
          flavor={t('card.flavor')}
          origin={t('card.origin')}
          handle={SOCIALS.github.handle}
          photoAlt={t('card.photoAlt')}
          className="mx-auto w-full max-w-[19rem] sm:max-w-[21rem] lg:sticky lg:top-28 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:max-w-none lg:self-start"
        />

        <div className="min-w-0 lg:col-start-1 lg:row-start-2">
          <p className="font-nf text-lg font-semibold sm:text-xl">
            <span className="sr-only">
              {/* Semicolons: a role may contain a comma of its own
                  ("Full-stack, backend at heart"). */}
              {t('rolesLabel')}: {roles.join('; ')}
            </span>
            <span aria-hidden="true" className="flex gap-3">
              <span className="text-ctp-teal">❯</span>
              <span className="min-w-0 flex-1">
                <TypedText
                  initial={roles[0]!}
                  strings={roles.slice(1)}
                  className="animated-gradient-text"
                  typeSpeed={55}
                  backSpeed={30}
                  backDelay={1800}
                />
              </span>
            </span>
          </p>

          <div
            id={bodyId}
            style={
              canCollapse ? { maxHeight: isExpanded ? heights.full : heights.collapsed } : undefined
            }
            className={cn(
              'mt-8 overflow-hidden transition-[max-height] duration-500 ease-in-out motion-reduce:transition-none',
              // Fade the cut line into whatever is behind (the starfield),
              // rather than painting a band of base colour over it.
              clamped &&
                '[mask-image:linear-gradient(to_bottom,#000_calc(100%-4.5rem),transparent)]'
            )}
          >
            <div ref={innerRef} className="relative space-y-6">
              {paragraphs.map((paragraph, index) => (
                <p
                  key={paragraph}
                  className={cn(
                    'text-lg leading-8 text-pretty sm:text-xl sm:leading-9',
                    index === 0 ? 'text-ctp-text' : 'text-ctp-subtext1'
                  )}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {canCollapse && (
            <button
              type="button"
              aria-expanded={isExpanded}
              aria-controls={bodyId}
              onClick={() => setIsExpanded((v) => !v)}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-ctp-mantle/60 px-4 py-2 font-nf text-sm text-ctp-lavender ring-1 ring-ctp-surface1 backdrop-blur-md transition-colors hover:text-ctp-mauve latte:text-ctp-blue-700 hover:ring-ctp-lavender/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-lavender"
            >
              {isExpanded ? t('readLess') : t('readMore')}
              <ChevronDownIcon
                aria-hidden="true"
                className={cn(
                  'size-4 transition-transform duration-300 motion-reduce:transition-none',
                  isExpanded && 'rotate-180'
                )}
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
