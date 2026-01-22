import ExperienceTimeline from '@/components/experiences/ExperienceTimeline';
import { client } from '@/sanity/lib/client';
import { listExperiencesQuery } from '@/sanity/queries';
import { getTranslations } from 'next-intl/server';

const options = { next: { revalidate: 16800 } };

export default async function ExperiencesPage() {
  const experiences = await client.fetch(listExperiencesQuery, {}, options);
  const t = await getTranslations('experiences');

  return (
    <section className="py-16 sm:py-20 md:py-32 mt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animated-gradient-text mx-auto max-w-2xl text-center mb-10 font-nf">
          <h2 className="text-sm sm:text-base font-semibold leading-7">{t('title')}</h2>
          <p className="py-2 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            {t('subtitle')}
          </p>
        </div>
        <ExperienceTimeline experiences={experiences} />
      </div>
    </section>
  );
}
