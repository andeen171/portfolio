import Layout from '@/components/Layout';
import AboutSection from '@/components/about/AboutSection';
import { type NextPage } from 'next';

const About: NextPage = () => {
  return (
    <Layout>
      <div className="py-12 pt-32">
        <AboutSection />
      </div>
    </Layout>
  );
};

export default About;
