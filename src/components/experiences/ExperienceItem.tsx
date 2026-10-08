import { CalendarIcon, ClockIcon, MapPinIcon } from '@heroicons/react/20/solid';
import { useLocale, useTranslations } from 'next-intl';
import ExpandableText from '@/components/projects/ExpandableText';
import TechChips from '@/components/projects/TechChips';
import { cn } from '@/lib/utils';
import type { ListExperiencesQueryResult } from '@/sanity/types';
import { useLocalization } from '@/utils/localization';
import {
  formatMonthYear,
  isoYearMonth,
  monthsBetween,
  parseYearMonth,
  toParagraphs,
  type YearMonth,
} from './format';

type Locale = 'en-US' | 'pt-BR';

interface ExperienceProps {
  experience: ListExperiencesQueryResult[number];
  /** "Now", fixed by the server render so every duration on the page agrees. */
  now: YearMonth;
  /** h3 under a page's h2 year headings, h4 under a home section's h3 years. */
  titleAs?: 'h3' | 'h4';
}

function useDuration(start: YearMonth | null, end: YearMonth) {
  const t = useTranslations('experiences');
  if (!start) return null;

  const total = monthsBetween(start, end);
  const years = Math.floor(total / 12);
  const months = total % 12;
  const yearsText = years > 0 ? t('durationYears', { count: years }) : null;
  const monthsText = months > 0 ? t('durationMonths', { count: months }) : null;

  return {
    text:
      yearsText && monthsText
        ? t('durationBoth', { years: yearsText, months: monthsText })
        : (yearsText ?? monthsText ?? ''),
  };
}

/**
 * One role on the experience timeline. A server component: only the
 * description's read-more toggle ships to the client.
 */
const ExperienceItem: React.FC<ExperienceProps> = ({ experience, now, titleAs: Title = 'h3' }) => {
  const locale = useLocale() as Locale;
  const t = useTranslations('experiences');
  const { getLocalizedValue } = useLocalization();

  // Titles were typed into Sanity with stray (and doubled) spaces.
  const title = (getLocalizedValue(experience.title, locale) ?? '').replace(/\s+/g, ' ').trim();
  const paragraphs = toParagraphs(getLocalizedValue(experience.description, locale));
  const company = experience.company?.trim();
  const location = experience.location?.trim();

  const start = parseYearMonth(experience.startDate);
  const end = parseYearMonth(experience.endDate);
  const isCurrent = !experience.endDate;
  const duration = useDuration(start, end ?? now);

  return (
    <article
      className={cn(
        'relative rounded-2xl bg-ctp-mantle/60 p-5 shadow-xl shadow-ctp-crust/20 ring-1 backdrop-blur-md transition-[box-shadow] duration-300 sm:p-6',
        isCurrent
          ? 'ring-ctp-green/35 hover:ring-ctp-green/60'
          : 'ring-ctp-surface1/60 hover:ring-ctp-lavender/40'
      )}
    >
      <header className="flex items-start gap-4">
        <div
          aria-hidden
          className="hidden size-11 shrink-0 place-items-center rounded-xl bg-linear-to-br from-ctp-teal/20 to-ctp-lavender/25 font-nf text-lg font-bold text-ctp-text ring-1 ring-ctp-surface1 min-[420px]:grid"
        >
          {company?.charAt(0).toUpperCase() ?? '·'}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <Title className="text-lg font-bold leading-snug text-balance text-ctp-text">
              {title}
            </Title>
            {isCurrent && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ctp-green/10 px-2 py-0.5 font-nf text-[0.6875rem] font-medium text-ctp-green ring-1 ring-ctp-green/30 ring-inset latte:text-ctp-green-900">
                <span aria-hidden className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-ctp-green opacity-75 motion-reduce:animate-none" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-ctp-green" />
                </span>
                {t('currentBadge')}
              </span>
            )}
          </div>
          {company && (
            <p className="mt-0.5 font-nf text-sm text-ctp-subtext1">
              <span aria-hidden className="text-ctp-teal">
                @
              </span>
              {company}
            </p>
          )}
        </div>
      </header>

      <dl className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-nf text-xs text-ctp-subtext0 latte:text-ctp-subtext1">
        {start && (
          <div>
            <dt className="sr-only">{t('period')}</dt>
            <dd className="flex items-center gap-1.5">
              <CalendarIcon aria-hidden className="size-3.5 text-ctp-teal" />
              <time dateTime={isoYearMonth(start)}>{formatMonthYear(locale, start)}</time>
              <span aria-hidden> — </span>
              <span className="sr-only"> {t('to')} </span>
              {end ? (
                <time dateTime={isoYearMonth(end)}>{formatMonthYear(locale, end)}</time>
              ) : (
                t('present')
              )}
            </dd>
          </div>
        )}
        {duration && (
          <div>
            <dt className="sr-only">{t('duration')}</dt>
            <dd className="flex items-center gap-1.5">
              <ClockIcon aria-hidden className="size-3.5 text-ctp-teal" />
              {/* Not a <time>: HTML durations can't express years or months, and the
                  period's <time> dates above already carry the machine-readable span. */}
              <span>{duration.text}</span>
            </dd>
          </div>
        )}
        {location && (
          <div className="min-w-0">
            <dt className="sr-only">{t('location')}</dt>
            <dd className="flex items-center gap-1.5">
              <MapPinIcon aria-hidden className="size-3.5 shrink-0 text-ctp-teal" />
              {location}
            </dd>
          </div>
        )}
      </dl>

      <ExpandableText
        paragraphs={paragraphs}
        lines={4}
        moreLabel={t('readMore')}
        lessLabel={t('showLess')}
        className="mt-4 max-w-3xl"
      />

      <TechChips skills={experience.skills} label={t('stack')} className="mt-5" />
    </article>
  );
};

export default ExperienceItem;
