import Layout from '@/components/Layout';
import ExperiencesSection from '@/components/experiences/ExperiencesSection';
import {InferGetStaticPropsType} from 'next';

import {client} from '@/sanity/client';
import {type SanityDocument} from 'next-sanity';

const EXPERIENCES_QUERY = `*[
  _type == "experience"
]`;

const options = { next: { revalidate: 30 } };

export async function getStaticProps() {
  const experiences = await client.fetch<SanityDocument[]>(EXPERIENCES_QUERY, {}, options);

  return { props: { experiences }, revalidate: 16800 };
}

export default function Experiences({
  experiences,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Layout>
      <div className="pt-36">
        <ExperiencesSection experiences={experiences} />
      </div>
    </Layout>
  );
}
