import { type NextPage } from 'next'
import Head from 'next/head'
import Layout from '~/components/Layout'
import SkillsSection from '~/components/skills/SkillsSection'
import AboutSection from '~/components/about/AboutSection'
import ProjectsSection from '~/components/projects/ProjectsSection'
import ExperiencesSection from '~/components/experiences/ExperiencesSection'
import HeroSection from '~/components/HeroSection'

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Anderson Ribeiro Lopes</title>
        <meta name="description" content="Anderson's Portfolio" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        <ProjectsSection />
        <ExperiencesSection />
      </Layout>
    </>
  )
}

export default Home
