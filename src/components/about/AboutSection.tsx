'use client';

import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState } from 'react';
import ProfileCard from '@/components/home/ProfileCard';
import TypedText from '@/components/home/TypedText';
import { useProfile } from '@/components/ProfileProvider';
import SectionHeading from '@/components/ui/SectionHeading';
import { cn } from '@/lib/utils';
import type { HeroQueryResult } from '@/sanity/types';
import { useLocalization } from '@/utils/localization';

/** Paragraphs left showing while collapsed, by breakpoint. */
const KEEP_MOBILE = 1;
const KEEP_DESKTOP = 2;

type Heights = { collapsed: number; full: number };

interface AboutSectionProps {
  /** The open-ended experience in Sanity, printed on the profile card. */
  current?: HeroQueryResult['current'];
}

const AboutSection: React.FC<AboutSectionProps> = ({ current }) => {
  const t = useTranslations('about');
  const profile = useProfile();
  const locale = useLocale() as 'en-US' | 'pt-BR';
  const { getLocalizedValue } = useLocalization();
  const bodyId = useId();
  const innerRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [heights, setHeights] = useState<Heights | null>(null);

  const { roles, bio: paragraphs } = profile;
  // The card's handle: the GitHub one where the code is, else the first listed.
  const handle = (
    profile.socials.find((social) => social.platform === 'github') ?? profile.socials[0]
  )?.handle;

  // The helper falls back to the first entry's value, which Sanity may leave
  // unset, so it can hand back undefined despite its type.
  const role =
    (getLocalizedValue(current?.title ?? undefined, locale) ?? '').trim() || profile.jobTitle;
  const company = current?.company?.trim();
  // A plain YYYY-MM-DD date: formatted in UTC so the server and the browser
  // land on the same month whatever their time zones.
  const startedAt = current?.startDate ? new Date(current.startDate) : null;
  const since =
    startedAt && !Number.isNaN(startedAt.getTime())
      ? t('card.since', {
          date: new Intl.DateTimeFormat(locale, {
            month: 'short',
            year: 'numeric',
            timeZone: 'UTC',
          }).format(startedAt),
        })
      : undefined;

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
          title={profile.aboutTitle}
          className="lg:col-start-1 lg:row-start-1"
        />

        <ProfileCard
          name={profile.shortName}
          type={role ? t('card.type', { role }) : ''}
          status={company ? { label: t('card.now'), company, since } : undefined}
          flavor={profile.cardFlavor}
          origin={profile.location.short || profile.location.label}
          handle={handle}
          photo={profile.photo}
          photoAlt={
            profile.photo?.alt ||
            (profile.shortName ? t('card.photoAlt', { name: profile.shortName }) : '')
          }
          className="mx-auto w-full max-w-[19rem] sm:max-w-[21rem] lg:sticky lg:top-28 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:max-w-none lg:self-start"
        />

        <div className="min-w-0 lg:col-start-1 lg:row-start-2">
          {roles.length > 0 && (
            <p className="font-nf text-lg font-semibold sm:text-xl">
              <span className="sr-only">
                {/* Semicolons: a role may contain a comma of its own
                  ("Full-stack, backend at heart"). */}
                {t('rolesLabel')}: {roles.join('; ')}
              </span>
              <span aria-hidden="true" className="flex gap-3">
                <span className="text-ctp-teal">❯</span>
                <span className="min-w-0 flex-1">
                  {roles.length > 1 ? (
                    <TypedText
                      initial={roles[0]!}
                      strings={roles.slice(1)}
                      className="animated-gradient-text"
                      typeSpeed={55}
                      backSpeed={30}
                      backDelay={1800}
                    />
                  ) : (
                    <span className="animated-gradient-text">{roles[0]}</span>
                  )}
                </span>
              </span>
            </p>
          )}

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
