import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import ProjectTimeline from '@/components/projects/ProjectTimeline';
import SectionHeading from '@/components/ui/SectionHeading';
import { getProfile } from '@/lib/getProfile';
import { pageMetadata } from '@/lib/metadata';
import type { AppLocale } from '@/lib/profile';
import { client } from '@/sanity/lib/client';
import { listProjectsQuery } from '@/sanity/queries';

const options = { next: { revalidate: 16800 } };

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, 'projects');
}

export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params;
  const projects = await client.fetch(listProjectsQuery, {}, options);
  const [t, tMeta, profile] = await Promise.all([
    getTranslations('projects'),
    getTranslations('meta'),
    getProfile(locale as AppLocale),
  ]);
  const intro = profile.intros.projects;

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading
          as="h1"
          eyebrow={t('eyebrow')}
          title={intro.title || tMeta('pages.projects.title')}
        />
        {intro.lede && (
          <p className="mx-auto mt-4 max-w-2xl text-center text-pretty text-ctp-subtext1">
            {intro.lede}
          </p>
        )}

        <div className="mt-14 sm:mt-20">
          <ProjectTimeline projects={projects} yearAs="h2" />
        </div>
      </div>
    </div>
  );
}
