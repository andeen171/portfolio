/** biome-ignore-all lint/suspicious/noArrayIndexKey: Because I don't know better */
'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import Typed from 'typed.js';
import ProfilePic from '@/img/icon.png';

const AboutSection: React.FC = () => {
  const t = useTranslations('about');
  const tExp = useTranslations('experiences');
  const titleRef = useRef(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const collapsedRef = useRef<HTMLDivElement>(null);
  const expandedRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const [collapsedHeight, setCollapsedHeight] = useState(0);
  const [expandedHeight, setExpandedHeight] = useState(0);

  useEffect(() => {
    const name = new Typed(titleRef.current, {
      strings: [
        t('typedStrings.fullstack'),
        t('typedStrings.linux'),
        t('typedStrings.backend'),
        t('typedStrings.entrepreneur'),
        t('typedStrings.arch'),
        t('typedStrings.father'),
        t('typedStrings.thinker'),
      ],
      typeSpeed: 70,
      backSpeed: 70,
      loop: true,
    });

    return () => {
      name.destroy();
    };
  }, [t]);

  // Split description by newlines to format as paragraphs
  const descriptionParagraphs = t('description')
    .split('\n\n')
    .filter((p) => p.trim());

  useEffect(() => {
    const measureHeights = () => {
      const isMobile = window.innerWidth < 640;

      if (isMobile) {
        // On mobile, use a fixed height limit
        const mobileCollapsedHeight = 144; // ~6 lines
        const fullHeight = expandedRef.current?.scrollHeight || 0;

        setCollapsedHeight(mobileCollapsedHeight);
        setExpandedHeight(fullHeight);
        setShowToggle(fullHeight > mobileCollapsedHeight + 1);
      } else {
        // On desktop, measure the height of the first 2 paragraphs vs. all paragraphs
        const twoParaHeight = collapsedRef.current?.scrollHeight || 0;
        const fullHeight = expandedRef.current?.scrollHeight || 0;

        setCollapsedHeight(twoParaHeight);
        setExpandedHeight(fullHeight);
        setShowToggle(descriptionParagraphs.length > 2);
      }
      setIsExpanded(false);
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(measureHeights, 100);
    window.addEventListener('resize', measureHeights);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', measureHeights);
    };
  }, [descriptionParagraphs.length]);

  return (
    <div className="relative isolate overflow-hidden px-4 py-8 sm:px-6 lg:overflow-visible lg:px-0">
      <div className="mx-auto flex flex-col lg:grid max-w-2xl gap-x-6 gap-y-8 sm:gap-x-8 sm:gap-y-12 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-start lg:gap-y-10">
        {/* Profile picture - shows first on mobile */}
        <div className="order-1 lg:order-2 mx-auto p-4 sm:p-6 lg:sticky lg:top-4 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:overflow-hidden">
          <Image
            className="w-full max-w-sm sm:max-w-md md:max-w-lg rounded-xl bg-ctp-mantle shadow-xl ring-2 sm:ring-4 ring-ctp-overlay0"
            src={ProfilePic}
            placeholder="blur"
            alt="Me, Myself and I"
          />
        </div>

        {/* Text content - shows second on mobile */}
        <div className="order-2 lg:order-1 lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
          <div className="px-2 sm:px-4 lg:pr-4">
            <div className="animated-gradient-text text-3xl sm:text-4xl lg:max-w-lg">
              <p className="text-base sm:text-lg font-semibold leading-7 text-ctp-lavender">
                {t('greeting')}
              </p>
              <span
                ref={titleRef}
                className="font-nf mt-2 min-h-12 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight"
              />

              {/* Description with collapsible functionality */}
              <div className="mt-4 sm:mt-8 relative">
                {/* Hidden measurement divs */}
                <div className="absolute opacity-0 pointer-events-none -z-10">
                  {/* Measure collapsed height (2 paragraphs on desktop, fixed on mobile) */}
                  <div ref={collapsedRef}>
                    {descriptionParagraphs.slice(0, 2).map((paragraph, index) => (
                      <p
                        key={`collapsed-${index}`}
                        className="text-lg sm:text-xl leading-7 sm:leading-8 text-ctp-subtext0 mb-4 last:mb-0"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  {/* Measure expanded height (all paragraphs) */}
                  <div ref={expandedRef}>
                    {descriptionParagraphs.map((paragraph, index) => (
                      <p
                        key={`expanded-${index}`}
                        className="text-lg sm:text-xl leading-7 sm:leading-8 text-ctp-subtext0 mb-4 last:mb-0"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Visible content with smooth height transition */}
                <div
                  ref={descriptionRef}
                  style={{
                    maxHeight: isExpanded ? `${expandedHeight}px` : `${collapsedHeight}px`,
                  }}
                  className="overflow-hidden transition-all duration-500 ease-in-out"
                >
                  {descriptionParagraphs.map((paragraph, index) => (
                    <p
                      key={`visible-${index}`}
                      className="text-lg sm:text-xl leading-7 sm:leading-8 text-ctp-subtext0 mb-4 last:mb-0"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Fade overlay when collapsed */}
                {!isExpanded && showToggle && (
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-ctp-base via-ctp-base/80 to-transparent pointer-events-none" />
                )}

                {/* Expand/collapse button */}
                {showToggle && (
                  <button
                    type="button"
                    onClick={() => setIsExpanded((v) => !v)}
                    className="mt-4 flex items-center gap-2 text-sm text-ctp-lavender hover:text-ctp-mauve transition-colors duration-200"
                  >
                    <span>{isExpanded ? tExp('collapse') : tExp('expand')}</span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-300 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-label={isExpanded ? tExp('collapse') : tExp('expand')}
                    >
                      <title>{isExpanded ? tExp('collapse') : tExp('expand')}</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
