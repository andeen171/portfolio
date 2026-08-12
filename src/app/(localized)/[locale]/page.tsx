import AboutSection from '@/components/about/AboutSection';
import ExperiencesSection from '@/components/experiences/ExperiencesSection';
import HeroSection from '@/components/HeroSection';
import ProjectsSection from '@/components/projects/ProjectsSection';
import SkillsSection from '@/components/skills/SkillsSection';
import { client } from '@/sanity/lib/client';
import {
  listSkillCategoriesQuery,
  listSkillsQuery,
  previewExperiencesQuery,
  previewProjectsQuery,
} from '@/sanity/queries';

const options = { next: { revalidate: 16800 } };

export default async function IndexPage() {
  const [experiences, projects, skills, skillCategories] = await Promise.all([
    client.fetch(previewExperiencesQuery, {}, options),
    client.fetch(previewProjectsQuery, {}, options),
    client.fetch(listSkillsQuery, {}, options),
    client.fetch(listSkillCategoriesQuery, {}, options),
  ]);

  return (
    <>
      <HeroSection />
      <AboutSection />
      <ProjectsSection projects={projects} />
      <ExperiencesSection experiences={experiences} />
      <SkillsSection skills={skills} categories={skillCategories} />
    </>
  );
}
