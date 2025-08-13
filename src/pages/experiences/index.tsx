import Layout from '@/components/Layout';
import { InferGetStaticPropsType } from 'next';

import ExperienceTimeline from '@/components/experiences/ExperienceTimeline';
import { client } from '@/sanity/client';
import { useTranslations } from '@/translations';
import { type SanityDocument } from 'next-sanity';

const EXPERIENCES_QUERY = `*[
  _type == "experience"
] | order(startDate desc) {
    title,
    company,
    location,
    startDate,
    endDate,
    description,
    skills[]-> {
      name,
      description,
      svgCode
    }
  }`;

const options = { next: { revalidate: 30 } };

export async function getStaticProps() {
  const experiences = await client.fetch<SanityDocument[]>(EXPERIENCES_QUERY, {}, options);

  return { props: { experiences }, revalidate: 16800 };
}

export default function Experiences({
  experiences,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const t = useTranslations();

  return (
    <Layout>
      <section className="bg-ctp-base py-16 sm:py-20 md:py-32 mt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animated-gradient-text mx-auto max-w-2xl text-center mb-10">
            <h2 className="text-sm sm:text-base font-semibold leading-7">{t.experiences.title}</h2>
            <p className="py-2 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              {t.experiences.subtitle}
            </p>
          </div>
          <ExperienceTimeline experiences={experiences} />
        </div>
      </section>
    </Layout>
  );
}
