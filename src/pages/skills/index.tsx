import Layout from '@/components/Layout';
import SkillList from '@/components/skills/SkillList';
import { client } from '@/sanity/lib/client';
import { listSkillsQuery } from '@/sanity/queries';
import type { Skill } from '@/sanity/types';
import { useTranslations } from 'next-intl';
import { InferGetStaticPropsType } from 'next';

const options = { next: { revalidate: 30 } };

export const getStaticProps = async ({ locale }: { locale: string }) => {
  const skills = await client.fetch<Skill[]>(listSkillsQuery, {}, options);

  return {
    props: {
      messages: (await import(`../../../messages/${locale}.json`)).default,
      locale,
      skills,
    },
    revalidate: 16800,
  };
};

export default function Skills({ skills }: InferGetStaticPropsType<typeof getStaticProps>) {
  const t = useTranslations('skills');

  return (
    <Layout>
      <div className="pt-36 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center animated-gradient-text">
            <h2 className="text-base font-semibold leading-7">{t('title')}</h2>
            <p className="py-2 text-3xl font-bold tracking-tight sm:text-4xl">
              {t('subtitle')}
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-7xl">
            <SkillList skills={skills} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
