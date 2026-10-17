import AboutSection from '@/components/about/AboutSection';
import ExperiencesSection from '@/components/experiences/ExperiencesSection';
import HeroSection from '@/components/HeroSection';
import ContactSection from '@/components/home/ContactSection';
import ProjectsSection from '@/components/projects/ProjectsSection';
import SkillsSection from '@/components/skills/SkillsSection';
import { getProfile } from '@/lib/getProfile';
import type { AppLocale } from '@/lib/profile';
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

export default async function IndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [profile, hero, experiences, projects, skills, skillCategories] = await Promise.all([
    getProfile(locale as AppLocale),
    client.fetch(heroQuery, {}, options),
    client.fetch(previewExperiencesQuery, {}, options),
    client.fetch(previewProjectsQuery, {}, options),
    client.fetch(listSkillsQuery, {}, options),
    client.fetch(listSkillCategoriesQuery, {}, options),
  ]);

  return (
    <>
      <HeroSection hero={hero} profile={profile} />
      <section id="about" className={anchor}>
        <AboutSection current={hero?.current} />
      </section>
      <section id="projects" className={anchor}>
        <ProjectsSection projects={projects} intro={profile.intros.projects} />
      </section>
      <section id="experiences" className={anchor}>
        <ExperiencesSection experiences={experiences} intro={profile.intros.experiences} />
      </section>
      <section id="skills" className={anchor}>
        <SkillsSection skills={skills} categories={skillCategories} />
      </section>
      <section id="contact" className={anchor}>
        <ContactSection profile={profile} />
      </section>
    </>
  );
}
