import { useTranslations } from 'next-intl';
import { parseYearMonth } from '@/components/experiences/format';
import type { ListProjectsQueryResult } from '@/sanity/types';
import { Timeline } from '../timeline/timeline';
import ProjectCard from './ProjectCard';

interface ProjectTimelineProps {
  projects: ListProjectsQueryResult;
  /** h2 on the /projects page (under its h1), h3 in the home section. */
  yearAs?: 'h2' | 'h3';
}

// Undated projects still show, in a group of their own at the end.
const UNDATED = '—';

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ projects, yearAs = 'h3' }) => {
  const t = useTranslations('projects');

  if (projects.length === 0) {
    return (
      <p className="mx-auto max-w-md rounded-xl bg-ctp-mantle/60 px-5 py-4 text-center font-nf text-sm text-ctp-subtext0 latte:text-ctp-subtext1 ring-1 ring-ctp-surface1/60">
        <span aria-hidden className="text-ctp-teal">
          ❯{' '}
        </span>
        {t('empty')}
      </p>
    );
  }

  // The query already orders by date, so each group keeps that order.
  const groups = new Map<string, ListProjectsQueryResult>();
  for (const project of projects) {
    const year = parseYearMonth(project.date)?.year.toString() ?? UNDATED;
    groups.set(year, [...(groups.get(year) ?? []), project]);
  }

  const years = [...groups.keys()].sort((a, b) => {
    if (a === UNDATED) return 1;
    if (b === UNDATED) return -1;
    return Number(b) - Number(a);
  });

  return (
    <Timeline
      yearAs={yearAs}
      data={years.map((year) => {
        const yearProjects = groups.get(year) ?? [];
        return {
          id: `project-year-${year}`,
          title: year,
          meta: t('count', { count: yearProjects.length }),
          content: (
            <div className="space-y-8 sm:space-y-10">
              {yearProjects.map((project) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  titleAs={yearAs === 'h2' ? 'h3' : 'h4'}
                />
              ))}
            </div>
          ),
        };
      })}
    />
  );
};

export default ProjectTimeline;
