import AboutSection from '@/components/about/AboutSection';
import ExperiencesSection from '@/components/experiences/ExperiencesSection';
import HeroSection from '@/components/HeroSection';
import ContactSection from '@/components/home/ContactSection';
import ProjectsSection from '@/components/projects/ProjectsSection';
import SkillsSection from '@/components/skills/SkillsSection';
import { client } from '@/sanity/lib/client';
import {
  heroQuery,
  listSkillCategoriesQuery,
  listSkillsQuery,
  previewExperiencesQuery,
  previewProjectsQuery,
} from '@/sanity/queries';

const options = { next: { revalidate: 16800 } };

// Section ids are a contract: the command palette and the hero's links jump
// to them. scroll-margin keeps a jumped-to section clear of the fixed header,
// which grows from 56px to 68px at `sm`.
const anchor = 'scroll-mt-16 sm:scroll-mt-20';

export default async function IndexPage() {
  const [hero, experiences, projects, skills, skillCategories] = await Promise.all([
    client.fetch(heroQuery, {}, options),
    client.fetch(previewExperiencesQuery, {}, options),
    client.fetch(previewProjectsQuery, {}, options),
    client.fetch(listSkillsQuery, {}, options),
    client.fetch(listSkillCategoriesQuery, {}, options),
  ]);

  return (
    <>
      <HeroSection hero={hero} />
      <section id="about" className={anchor}>
        <AboutSection />
      </section>
      <section id="projects" className={anchor}>
        <ProjectsSection projects={projects} />
      </section>
      <section id="experiences" className={anchor}>
        <ExperiencesSection experiences={experiences} />
      </section>
      <section id="skills" className={anchor}>
        <SkillsSection skills={skills} categories={skillCategories} />
      </section>
      <section id="contact" className={anchor}>
        <ContactSection />
      </section>
    </>
  );
}
