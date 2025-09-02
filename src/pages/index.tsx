import HeroSection from '@/components/HeroSection';
import Layout from '@/components/Layout';
import AboutSection from '@/components/about/AboutSection';
import ExperiencesSection from '@/components/experiences/ExperiencesSection';
import ProjectsSection from '@/components/projects/ProjectsSection';
import SkillsSection from '@/components/skills/SkillsSection';
import { client } from '@/sanity/client';
import {
  previewExperiencesQuery,
  previewProjectsQuery,
  previewSkillsQuery,
} from '@/sanity/queries';
import { InferGetStaticPropsType } from 'next';
import Head from 'next/head';

const options = { next: { revalidate: 30 } };

export const getStaticProps = async () => {
  const experiences = await client.fetch(previewExperiencesQuery, {}, options);
  const projects = await client.fetch(previewProjectsQuery, {}, options);
  const skills = await client.fetch(previewSkillsQuery, {}, options);

  return {
    props: {
      experiences,
      projects,
      skills,
    },
    revalidate: 16800,
  };
};

export default ({
  experiences,
  projects,
  skills,
}: InferGetStaticPropsType<typeof getStaticProps>) => (
  <>
    <Head>
      <title>Anderson Ribeiro Lopes</title>
      <meta name="description" content="Anderson's Portfolio" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <Layout>
      <HeroSection />
      <AboutSection />
      <ProjectsSection projects={projects} />
      <ExperiencesSection experiences={experiences} />
      <SkillsSection skills={skills} />
    </Layout>
  </>
);
