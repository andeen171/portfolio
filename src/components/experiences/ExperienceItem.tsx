import { ListExperiencesQueryResult } from '@/sanity/types';
import { useLanguageStore } from '@/store/language';
import { useTranslations } from '@/translations';
import { useLocalization } from '@/utils/localization';
import { useMemo, useState } from 'react';

interface ExperienceProps {
  experience: ListExperiencesQueryResult[number];
}

const ExperienceItem: React.FC<ExperienceProps> = ({ experience }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const language = useLanguageStore((state) => state.language);
  const { getLocalizedValue } = useLocalization();

  const title = getLocalizedValue(experience.title, language);
  const description = getLocalizedValue(experience.description, language) || '';

  const t = useTranslations();

  const formatDate = useMemo(() => {
    const formatDateString = (dateString: string | undefined) => {
      if (!dateString) return null;
      const date = new Date(dateString);
      return date.toLocaleDateString(language, { month: 'short', year: 'numeric' });
    };

    const start = formatDateString(experience.startDate);
    const end = experience.endDate ? formatDateString(experience.endDate) : t.experiences.current;

    return { start, end, full: `${start} - ${end}` };
  }, [experience.startDate, experience.endDate, language, t.experiences.current]);

  return (
    <div
      key={experience._id}
      onClick={() => setIsExpanded((v) => !v)}
      onKeyDown={(e) => e.key === 'Enter' && setIsExpanded((v) => !v)}
      role="button"
      tabIndex={0}
      className="group relative overflow-hidden rounded-lg border border-ctp-surface1/40 bg-ctp-mantle/50 p-6 transition-all duration-300 hover:border-ctp-surface2 hover:bg-ctp-mantle/70 cursor-pointer backdrop-blur-sm"
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-ctp-blue/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <h3 className="animated-gradient-text text-lg font-semibold mb-1">{title}</h3>
            <p className="text-ctp-subtext0 font-medium text-sm">{experience.company}</p>
          </div>
          <div className="flex flex-col items-end gap-1 text-xs text-ctp-subtext1">
            <span className="font-medium">{formatDate.end}</span>
            <span className="opacity-70">{experience.location}</span>
          </div>
        </div>

        {/* Timeline indicator */}
        <div className="flex items-center gap-2 mb-4 text-xs text-ctp-subtext1">
          <span className="w-1.5 h-1.5 rounded-full bg-ctp-blue/60" />
          <span>{formatDate.full}</span>
        </div>

        {/* Description with smooth expand/collapse */}
        <div className="relative">
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-[4.5rem] opacity-90'
            }`}
          >
            <p className="text-sm leading-relaxed text-ctp-text/90">{description}</p>
          </div>

          {/* Fade overlay when collapsed */}
          {!isExpanded && description.length > 150 && (
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-ctp-mantle/50 to-transparent pointer-events-none" />
          )}
        </div>

        {/* Expand/collapse indicator */}
        {description.length > 150 && (
          <div className="flex items-center justify-center mt-4">
            <div className="flex items-center gap-2 text-xs text-ctp-subtext1/70 group-hover:text-ctp-subtext1 transition-colors">
              <span>{isExpanded ? 'Click to collapse' : 'Click to expand'}</span>
              {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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
    </div>
  );
};

export default ExperienceItem;
