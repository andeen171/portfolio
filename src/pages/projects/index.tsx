import { type NextPage } from 'next'
import Layout from '~/components/Layout'
import ProjectsSection from '~/components/projects/ProjectsSection'

const Projects: NextPage = () => {
  return (
    <Layout>
      <div className="pt-36">
        <ProjectsSection />
      </div>
    </Layout>
  )
}

export default Projects
