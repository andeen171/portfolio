import { urlFor } from '@/sanity/lib/image';
import { useTranslations, useLocale } from 'next-intl';
import { useLocalization } from '@/utils/localization';
import { SanityDocument } from 'next-sanity';

interface ProjectItemProps {
  project: SanityDocument;
}

const ProjectItem: React.FC<ProjectItemProps> = ({ project }) => {
  const locale = useLocale();
  const t = useTranslations('projects');
  const { getLocalizedValue } = useLocalization();

  const projectImage = project.images[0] ? urlFor(project.images[0]) : null;

  const projectName = getLocalizedValue(project.name, locale as 'en-US' | 'pt-BR');
  const projectDescription = getLocalizedValue(project.description, locale as 'en-US' | 'pt-BR');

  return (
    <article className="overflow-hidden rounded-xl shadow-xl transition hover:shadow-lg hover:scale-[1.02]">
      {projectImage && (
        <img
          src={projectImage?.width(550).height(310).url()}
          alt={projectName}
          className="aspect-video rounded-xl"
          width="550"
          height="310"
        />
      )}
      <div className="bg-ctp-mantle p-4 sm:p-6">
        <div className="flex flex-wrap gap-2 mb-3">
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
                {skill.name}
              </span>
            ))}
        </div>
        <a
          href={project.repo || '/'}
          target="_blank"
          rel="noopener noreferrer"
          className="block hover:opacity-90 transition-opacity"
        >
          <h3 className="animated-gradient-text mt-2 text-lg font-bold">{projectName}</h3>
        </a>

        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ctp-subtext0">
          {projectDescription}
        </p>
        <div className="flex justify-between items-center mt-4">
          <a
            href={project.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1 text-sm font-medium text-ctp-lavender"
          >
            {t('repository')}
            <span aria-hidden="true" className="block transition group-hover:translate-x-0.5">
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
              {t('demo')}
              <span aria-hidden="true" className="block transition group-hover:translate-x-0.5">
                &rarr;
              </span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
};

export default ProjectItem;
