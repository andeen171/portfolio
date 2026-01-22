import { setRequestLocale } from 'next-intl/server';
import AboutSection from '@/components/about/AboutSection';
import ExperiencesSection from '@/components/experiences/ExperiencesSection';
import HeroSection from '@/components/HeroSection';
import ProjectsSection from '@/components/projects/ProjectsSection';
import SkillsSection from '@/components/skills/SkillsSection';
import { client } from '@/sanity/lib/client';
import {
  previewExperiencesQuery,
  previewProjectsQuery,
  previewSkillsQuery,
} from '@/sanity/queries';

const options = { next: { revalidate: 16800 } };

export default async function IndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [experiences, projects, skills] = await Promise.all([
    client.fetch(previewExperiencesQuery, {}, options),
    client.fetch(previewProjectsQuery, {}, options),
    client.fetch(previewSkillsQuery, {}, options),
  ]);

  return (
    <>
      <HeroSection />
      <AboutSection />
      <ProjectsSection projects={projects} />
      <ExperiencesSection experiences={experiences} />
      <SkillsSection skills={skills} />
    </>
  );
}

export async function generateMetadata() {
  return {
    title: 'Anderson Ribeiro Lopes',
    description: "Anderson's Portfolio",
  };
}
