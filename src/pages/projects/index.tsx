import Layout from '@/components/Layout';
import ProjectsSection from '@/components/projects/ProjectsSection';
import { client } from '@/sanity/client';
import { InferGetServerSidePropsType } from 'next';
import { SanityDocument } from 'next-sanity';

const PROJECTS_QUERY = `*[
  _type == "project"
]`;

const options = { next: { revalidate: 30 } };

export async function getServerSideProps() {
  const projects = await client.fetch<SanityDocument[]>(PROJECTS_QUERY, {}, options);

  return { props: { projects } };
}

export default function Projects({
  projects,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <Layout>
      <div className="pt-36">
        <ProjectsSection projects={projects} />
      </div>
    </Layout>
  );
}
