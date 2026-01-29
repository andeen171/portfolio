'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ListExperiencesQueryResult } from '@/sanity/types';
import { useLocalization } from '@/utils/localization';

interface ExperienceProps {
  experience: ListExperiencesQueryResult[number];
}

const ExperienceItem: React.FC<ExperienceProps> = ({ experience }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);

  const locale = useLocale();
  const { getLocalizedValue } = useLocalization();

  const title = getLocalizedValue(experience.title, locale as 'en-US' | 'pt-BR');
  const description = getLocalizedValue(experience.description, locale as 'en-US' | 'pt-BR') || '';

  const t = useTranslations('experiences');

  const formatDate = useMemo(() => {
    const formatDateString = (dateString: string | undefined) => {
      if (!dateString) return null;
      const date = new Date(dateString);
      return date.toLocaleDateString(locale, { month: 'short', year: 'numeric' });
    };

    const start = formatDateString(experience.startDate);
    const end = experience.endDate ? formatDateString(experience.endDate) : t('current');

    return { start, end, full: `${start} - ${end}` };
  }, [experience.startDate, experience.endDate, locale, t]);

  useEffect(() => {
    const element = descriptionRef.current;
    if (!element) return;
    const collapsedMaxHeight = 72;
    const isOverflowing = element.scrollHeight > collapsedMaxHeight + 1;
    setShowToggle(isOverflowing);
  }, []);

  return (
    <button
      type="button"
      key={experience._id}
      onClick={() => setIsExpanded((v) => !v)}
      onKeyDown={(e) => e.key === 'Enter' && setIsExpanded((v) => !v)}
      className="group w-full text-left relative flex flex-col min-h-45 overflow-hidden rounded-lg border border-ctp-surface1/40 bg-ctp-mantle/50 p-6 transition-all duration-300 hover:border-ctp-surface2 hover:bg-ctp-mantle/70 cursor-pointer backdrop-blur-sm"
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-linear-to-br from-ctp-blue/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex flex-col gap-3 mb-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <h3 className="animated-gradient-text text-lg font-semibold mb-1">{title}</h3>
            <p className="text-ctp-subtext0 font-medium text-sm">{experience.company}</p>
          </div>
          <div className="flex flex-col items-start gap-1 text-xs text-ctp-subtext1 sm:items-end sm:text-right">
            <span className="font-medium hidden md:block">{formatDate.end}</span>
            <span className="opacity-70">{experience.location}</span>
          </div>
        </div>

        {/* Timeline indicator */}
        <div className="flex items-center gap-2 mb-4 text-xs text-ctp-subtext1">
          <span className="w-1.5 h-1.5 rounded-full bg-ctp-blue/60" />
          <span>{formatDate.full}</span>
        </div>

        {/* Description with smooth expand/collapse */}
        <div className="relative flex-1">
          <div
            ref={descriptionRef}
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              isExpanded ? 'max-h-500 opacity-100' : 'max-h-18 opacity-90'
            }`}
          >
            <p className="text-sm leading-relaxed text-ctp-text/90">{description}</p>
          </div>

          {/* Fade overlay when collapsed */}
          {!isExpanded && showToggle && (
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-linear-to-t from-ctp-mantle/50 to-transparent pointer-events-none" />
          )}
        </div>

        {/* Expand/collapse indicator */}
        {showToggle && (
          <div className="flex items-center justify-center mt-4">
            <div className="flex items-center gap-2 text-xs text-ctp-subtext1/70 group-hover:text-ctp-subtext1 transition-colors">
              <span>{isExpanded ? t('collapse') : t('expand')}</span>
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-label={isExpanded ? t('collapse') : t('expand')}
              >
                <title>{isExpanded ? t('collapse') : t('expand')}</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
    </button>
  );
};

export default ExperienceItem;
