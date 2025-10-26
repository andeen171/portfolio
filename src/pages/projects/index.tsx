import Layout from '@/components/Layout';
import ProjectTimeline from '@/components/projects/ProjectTimeline';
import { client } from '@/sanity/lib/client';
import { listProjectsQuery } from '@/sanity/queries';
import { useTranslations } from 'next-intl';
import { InferGetStaticPropsType } from 'next';

const options = { next: { revalidate: 30 } };

export async function getStaticProps({ locale }: { locale: string }) {
  const projects = await client.fetch(listProjectsQuery, {}, options);

  return {
    props: {
      messages: (await import(`../../../messages/${locale}.json`)).default,
      locale,
      projects,
    },
    revalidate: 16800,
  };
}

export default function Projects({ projects }: InferGetStaticPropsType<typeof getStaticProps>) {
  const t = useTranslations('projects');

  return (
    <Layout>
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="animated-gradient-text mx-auto max-w-2xl text-center mb-10">
            <h2 className="text-base font-semibold leading-7">{t('title')}</h2>
            <p className="py-2 text-3xl font-bold tracking-tight sm:text-4xl">
              {t('subtitle')}
            </p>
          </div>
          <ProjectTimeline projects={projects} />
        </div>
      </div>
    </Layout>
  );
}
