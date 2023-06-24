import { type NextPage } from 'next'
import Layout from '~/components/Layout'
import SkillsSection from '~/components/skills/SkillsSection'

const Skills: NextPage = () => {
  return (
    <Layout>
      <div className="pt-36">
        <SkillsSection />
      </div>
    </Layout>
  )
}

export default Skills
