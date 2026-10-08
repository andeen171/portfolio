import { useTranslations } from 'next-intl';
import SectionHeading from '@/components/ui/SectionHeading';
import type { PreviewProjectsQueryResult } from '@/sanity/types';
import ProjectTimeline from './ProjectTimeline';
import SeeMoreLink from './SeeMoreLink';

interface ProjectsSectionProps {
  projects: PreviewProjectsQueryResult;
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects }) => {
  const t = useTranslations('projects');

  return (
    <section id="projects" className="scroll-mt-16 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading index="02" eyebrow={t('eyebrow')} title={t('subtitle')} />
        <p className="mx-auto mt-4 max-w-2xl text-center text-pretty text-ctp-subtext1">
          {t('lede')}
        </p>

        <div className="mt-14 sm:mt-16">
          <ProjectTimeline projects={projects} />
        </div>

        <div className="mt-4 text-center">
          <SeeMoreLink href="/projects" path={t('eyebrow')}>
            {t('seeMore')}
          </SeeMoreLink>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
