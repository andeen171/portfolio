import { type NextPage } from 'next'
import Layout from '~/components/Layout'
import AboutSection from '~/components/about/AboutSection'

const About: NextPage = () => {
  return (
    <Layout>
      <div className="py-12 pt-32">
        <AboutSection />
      </div>
    </Layout>
  )
}

export default About
