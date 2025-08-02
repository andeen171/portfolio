import HeroSection from '@/components/HeroSection';
import Layout from '@/components/Layout';
import AboutSection from '@/components/about/AboutSection';
import ExperiencesSection from '@/components/experiences/ExperiencesSection';
import ProjectsSection from '@/components/projects/ProjectsSection';
import SkillsSection from '@/components/skills/SkillsSection';
import { client } from '@/sanity/client';
import { InferGetStaticPropsType } from 'next';
import { SanityDocument } from 'next-sanity';
import Head from 'next/head';

const EXPERIENCES_QUERY = `*[
  _type == "experience"
] | order(startDate desc)[0..5]`;

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
} | order(_createdAt desc)[0..5]`;

const SKILLS_QUERY = `*[
  _type == "skill"
][0..4]`;

const options = { next: { revalidate: 30 } };

export const getStaticProps = async () => {
  const experiences = await client.fetch<SanityDocument[]>(EXPERIENCES_QUERY, {}, options);
  const projects = await client.fetch<SanityDocument[]>(PROJECTS_QUERY, {}, options);
  const skills = await client.fetch<SanityDocument[]>(SKILLS_QUERY, {}, options);

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
