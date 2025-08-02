import { client } from '@/sanity/client';
import { useLanguageStore } from '@/store/language';
import { useTranslations } from '@/translations';
import { getLocalizedValue } from '@/utils/localization';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { SanityDocument } from 'next-sanity';
import { Timeline } from '../timeline/timeline';

interface ProjectTimelineProps {
  projects: SanityDocument[];
}

const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset ? imageUrlBuilder({ projectId, dataset }).image(source) : null;

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ projects }) => {
  const language = useLanguageStore((state) => state.language);
  const t = useTranslations();

  // Agrupa projetos por ano
  const groupedProjects = projects.reduce(
    (acc, project) => {
      // Extrai o ano do projeto (assumindo que existe um campo year ou usando createdAt)
      const year = project.year || new Date(project._createdAt).getFullYear().toString();

      if (!acc[year]) {
        acc[year] = [];
      }

      acc[year].push(project);
      return acc;
    },
    {} as Record<string, SanityDocument[]>
  );

  // Converte para o formato esperado pelo componente Timeline
  const timelineData = Object.entries(groupedProjects)
    .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
    .map(([year, yearProjects]) => ({
      title: year,
      content: (
        <div className="space-y-8 sm:space-y-10">
          {yearProjects.map((project) => {
            const projectName = getLocalizedValue(project.name, language);
            const projectDescription = getLocalizedValue(project.description, language);
            const projectImageUrl = project.images
              ? urlFor(project.images[0]!)?.width(550).height(310).url()
              : null;

            return (
              <div
                key={project._id}
                className="overflow-hidden rounded-xl bg-ctp-mantle shadow-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.01]"
              >
                {projectImageUrl && (
                  <img
                    src={projectImageUrl}
                    alt={projectName}
                    className="aspect-video w-full rounded-t-xl object-cover"
                    width="550"
                    height="310"
                  />
                )}
                <div className="p-5">
                  <div className="mb-3 flex flex-wrap gap-2">
                    {project.skills &&
                      Array.isArray(project.skills) &&
                      project.skills.map((skill: SanityDocument, index: number) => (
                        <span
                          key={skill._id || index}
                          className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs 
                          font-semibold text-ctp-base ${
                            index === 0
                              ? 'bg-ctp-lavender'
                              : index === project.skills.length - 1
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
                      {t.projects.repository}
                      <span
                        aria-hidden="true"
                        className="block transition group-hover:translate-x-0.5"
                      >
                        &rarr;
                      </span>
                    </a>
                    {project.demo && (
                      <a
                        href={project.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-1 text-sm font-medium text-ctp-teal"
                      >
                        {t.projects.demo}
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
