import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import SkillsExplorer from '@/components/skills/SkillsExplorer';
import SectionHeading from '@/components/ui/SectionHeading';
import { client } from '@/sanity/lib/client';
import { listSkillCategoriesQuery, listSkillsQuery } from '@/sanity/queries';

const options = { next: { revalidate: 16800 } };

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'skills' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function SkillsPage() {
  const [skills, categories] = await Promise.all([
    client.fetch(listSkillsQuery, {}, options),
    client.fetch(listSkillCategoriesQuery, {}, options),
  ]);
  const t = await getTranslations('skills');

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
        <SectionHeading as="h1" eyebrow={t('eyebrow')} title={t('subtitle')} />
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-ctp-subtext1">{t('lede')}</p>
        <div className="mx-auto mt-12 max-w-2xl sm:mt-14 lg:max-w-7xl">
          <SkillsExplorer skills={skills} categories={categories} />
        </div>
      </div>
    </div>
  );
}
