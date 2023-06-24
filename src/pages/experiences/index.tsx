import { type NextPage } from 'next'
import Layout from '~/components/Layout'
import ExperiencesSection from '~/components/experiences/ExperiencesSection'

const Experiences: NextPage = () => {
  return (
    <Layout>
      <div className="pt-36">
        <ExperiencesSection />
      </div>
    </Layout>
  )
}

export default Experiences
