import ProjectTimeline from '@/components/projects/ProjectTimeline';
import { client } from '@/sanity/lib/client';
import { listProjectsQuery } from '@/sanity/queries';
import { getTranslations } from 'next-intl/server';

const options = { next: { revalidate: 16800 } };

export default async function ProjectsPage() {
  const projects = await client.fetch(listProjectsQuery, {}, options);
  const t = await getTranslations('projects');

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="animated-gradient-text mx-auto max-w-2xl text-center mb-10 font-nf">
          <h2 className="text-base font-semibold leading-7">{t('title')}</h2>
          <p className="py-2 text-3xl font-bold tracking-tight sm:text-4xl">{t('subtitle')}</p>
        </div>
        <ProjectTimeline projects={projects} />
      </div>
    </div>
  );
}
