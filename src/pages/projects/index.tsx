import Layout from '@/components/Layout';
import ProjectTimeline from '@/components/projects/ProjectTimeline';
import { client } from '@/sanity/client';
import { useTranslations } from '@/translations';
import { InferGetStaticPropsType } from 'next';
import { SanityDocument } from 'next-sanity';

const PROJECTS_QUERY = `*[
  _type == "project"
]{ 
  _id, 
  _createdAt,
  name,
  description,
  repo,
  demo,
  images,
  "skills": skills[]->{ _id, name },
  year
} | order(_createdAt desc)`;

const options = { next: { revalidate: 30 } };

export async function getStaticProps() {
  const projects = await client.fetch<SanityDocument[]>(PROJECTS_QUERY, {}, options);

  return { props: { projects }, revalidate: 16800 };
}

export default function Projects({ projects }: InferGetStaticPropsType<typeof getStaticProps>) {
  const t = useTranslations();

  return (
    <Layout>
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="animated-gradient-text mx-auto max-w-2xl text-center mb-10">
            <h2 className="text-base font-semibold leading-7">{t.projects.title}</h2>
            <p className="py-2 text-3xl font-bold tracking-tight sm:text-4xl">
              {t.projects.subtitle}
            </p>
          </div>
          <ProjectTimeline projects={projects} />
        </div>
      </div>
    </Layout>
  );
}
