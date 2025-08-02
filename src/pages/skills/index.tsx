import Layout from '@/components/Layout';
import SkillsSection from '@/components/skills/SkillsSection';
import { client } from '@/sanity/client';
import { InferGetServerSidePropsType } from 'next';
import { SanityDocument } from 'next-sanity';

const SKILLS_QUERY = `*[
  _type == "skill"
]`;

const options = { next: { revalidate: 30 } };

export const getServerSideProps = async () => {
  const skills = await client.fetch<SanityDocument[]>(SKILLS_QUERY, {}, options);

  return {
    props: {
      skills,
    },
  };
};

export default function Skills({ skills }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <Layout>
      <div className="pt-36">
        <SkillsSection skills={skills} />
      </div>
    </Layout>
  );
}
