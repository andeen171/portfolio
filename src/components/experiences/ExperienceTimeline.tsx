import { useTranslations } from 'next-intl';
import ExperienceItem from '@/components/experiences/ExperienceItem';
import type { ListExperiencesQueryResult, PreviewExperiencesQueryResult } from '@/sanity/types';
import { Timeline } from '../timeline/timeline';
import { currentYearMonth, parseYearMonth } from './format';

type Experiences = ListExperiencesQueryResult | PreviewExperiencesQueryResult;

type Experience = Experiences[number];

interface ExperienceTimelineProps {
  experiences: Experiences;
  /** h2 on the /experiences page (under its h1), h3 in the home section. */
  yearAs?: 'h2' | 'h3';
}

/** Months since year 0, for ordering; a missing date sorts as "now". */
const order = (value: string | undefined, fallback: number) => {
  const ym = parseYearMonth(value);
  return ym ? ym.year * 12 + ym.month : fallback;
};

const ExperienceTimeline: React.FC<ExperienceTimelineProps> = ({ experiences, yearAs = 'h3' }) => {
  const t = useTranslations('experiences');

  if (experiences.length === 0) {
    return (
      <p className="mx-auto max-w-md rounded-xl bg-ctp-mantle/60 px-5 py-4 text-center font-nf text-sm text-ctp-subtext0 ring-1 ring-ctp-surface1/60">
        <span aria-hidden className="text-ctp-teal">
          ❯{' '}
        </span>
        {t('empty')}
      </p>
    );
  }

  // Server-side "now": the current role's duration and its year group are
  // computed once here, so the client never re-derives them and disagrees.
  const now = currentYearMonth();
  const nowOrder = now.year * 12 + now.month;

  // Roles are filed under the year they ended (the current one under this
  // year), most recent first. Where a null endDate lands in a GROQ sort isn't
  // something to lean on, so the order is set here.
  const sorted = [...experiences].sort(
    (a, b) =>
      order(b.endDate, nowOrder) - order(a.endDate, nowOrder) ||
      order(b.startDate, nowOrder) - order(a.startDate, nowOrder)
  );

  const groups = new Map<string, Experience[]>();
  for (const experience of sorted) {
    const year = String(parseYearMonth(experience.endDate)?.year ?? now.year);
    groups.set(year, [...(groups.get(year) ?? []), experience]);
  }

  return (
    <Timeline
      yearAs={yearAs}
      data={[...groups.entries()].map(([year, yearExperiences]) => ({
        id: `experience-year-${year}`,
        title: year,
        meta: t('count', { count: yearExperiences.length }),
        content: (
          <div className="space-y-6 sm:space-y-8">
            {yearExperiences.map((experience) => (
              <ExperienceItem
                key={experience._id}
                experience={experience}
                now={now}
                titleAs={yearAs === 'h2' ? 'h3' : 'h4'}
              />
            ))}
          </div>
        ),
      }))}
    />
  );
};

export default ExperienceTimeline;
