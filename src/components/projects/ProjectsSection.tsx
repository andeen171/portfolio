import { useTranslations } from '@/translations';
import { SanityDocument } from 'next-sanity';
import Link from 'next/link';
import ProjectTimeline from './ProjectTimeline';

interface ProjectsSectionProps {
  projects: SanityDocument[];
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects }) => {
  const t = useTranslations();

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="animated-gradient-text mx-auto max-w-2xl text-center mb-10">
          <h2 className="text-base font-semibold leading-7">{t.projects.title}</h2>
          <p className="py-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {t.projects.subtitle}
          </p>
        </div>
        <ProjectTimeline projects={projects} />
        <div className="mt-12 text-center">
          <Link
            className="inline-flex items-center gap-1 text-lg font-semibold text-ctp-lavender hover:text-ctp-pink transition-colors duration-300"
            href="/projects"
          >
            {t.projects.seeMore}
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              &rarr;
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectsSection;
