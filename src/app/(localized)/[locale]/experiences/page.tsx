import { getTranslations } from 'next-intl/server';
import ExperienceTimeline from '@/components/experiences/ExperienceTimeline';
import SectionHeading from '@/components/ui/SectionHeading';
import { client } from '@/sanity/lib/client';
import { listExperiencesQuery } from '@/sanity/queries';

const options = { next: { revalidate: 16800 } };

export default async function ExperiencesPage() {
  const experiences = await client.fetch(listExperiencesQuery, {}, options);
  const t = await getTranslations('experiences');

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading as="h1" eyebrow={t('eyebrow')} title={t('subtitle')} />
        <p className="mx-auto mt-4 max-w-2xl text-center text-pretty text-ctp-subtext1">
          {t('lede')}
        </p>

        <div className="mt-14 sm:mt-20">
          <ExperienceTimeline experiences={experiences} yearAs="h2" />
        </div>
      </div>
    </div>
  );
}
