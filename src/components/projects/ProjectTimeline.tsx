import type { SanityImageSource } from '@sanity/image-url';
import { createImageUrlBuilder } from '@sanity/image-url';
import { useLocale, useTranslations } from 'next-intl';
import { client } from '@/sanity/lib/client';
import type { ListProjectsQueryResult } from '@/sanity/types';
import { useLocalization } from '@/utils/localization';
import { Timeline } from '../timeline/timeline';

interface ProjectTimelineProps {
  projects: ListProjectsQueryResult;
}

const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset ? createImageUrlBuilder({ projectId, dataset }).image(source) : null;

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ projects }) => {
  const locale = useLocale();
  const t = useTranslations('projects');
  const { getLocalizedValue } = useLocalization();

  // Agrupa projetos por ano
  const groupedProjects = projects.reduce(
    (acc, project) => {
      const year = new Date(project.date!).getFullYear().toString();

      if (!acc[year]) {
        acc[year] = [];
      }

      acc[year].push(project);
      return acc;
    },
    {} as Record<string, ListProjectsQueryResult>
  );

  // Converte para o formato esperado pelo componente Timeline
  const timelineData = Object.entries(groupedProjects)
    .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
    .map(([year, yearProjects]) => ({
      title: year,
      content: (
        <div id={`project-timeline-${year}`} className="space-y-8 sm:space-y-10">
          {yearProjects.map((project) => {
            const projectName = getLocalizedValue(project.name, locale as 'en-US' | 'pt-BR');
            const projectDescription = getLocalizedValue(
              project.description,
              locale as 'en-US' | 'pt-BR'
            );
            const projectImageUrl = project.images
              ? urlFor(project.images[0]!)?.width(550).height(310).url()
              : null;

            return (
              <div
                key={project._id}
                className="flex flex-col h-full overflow-hidden rounded-xl bg-ctp-mantle shadow-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.01]"
              >
                {projectImageUrl && (
                  <div className="shrink-0">
                    <img
                      src={projectImageUrl}
                      alt={projectName}
                      className="aspect-video w-full rounded-t-xl object-cover"
                      width="550"
                      height="310"
                    />
                  </div>
                )}
                <div className="flex flex-col flex-1 p-5">
                  <div className="mb-3 flex flex-wrap gap-2">
                    {project.skills &&
                      Array.isArray(project.skills) &&
                      project.skills.map((skill, index: number) => (
                        <span
                          key={`${skill._id || skill.name}-${index}`}
                          className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs 
                          font-semibold text-ctp-base ${
                            index === 0
                              ? 'bg-ctp-lavender'
                              : project.skills && index === project.skills.length - 1
                                ? 'bg-ctp-teal'
                                : 'bg-ctp-pink'
                          }`}
                        >
                          {skill.name || 'Skill'}
                        </span>
                      ))}
                  </div>

                  <a
                    href={project.repo || '/'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:opacity-90 transition-opacity"
                  >
                    <h3 className="animated-gradient-text mb-2 text-lg font-bold">{projectName}</h3>
                  </a>

                  <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-ctp-subtext0">
                    {projectDescription}
                  </p>

                  <div className="flex items-center justify-between">
                    <a
                      href={project.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1 text-sm font-medium text-ctp-lavender"
                    >
                      {t('repository')}
                      <span
                        aria-hidden="true"
                        className="block transition group-hover:translate-x-0.5"
                      >
                        &rarr;
                      </span>
                    </a>
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-1 text-sm font-medium text-ctp-teal"
                      >
                        {t('demo')}
                        <span
                          aria-hidden="true"
                          className="block transition group-hover:translate-x-0.5"
                        >
                          &rarr;
                        </span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ),
    }));

  return <Timeline data={timelineData} />;
};

export default ProjectTimeline;
