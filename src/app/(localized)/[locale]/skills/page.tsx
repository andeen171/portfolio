import { getTranslations } from 'next-intl/server';
import SkillList from '@/components/skills/SkillList';
import { client } from '@/sanity/lib/client';
import { listSkillsQuery } from '@/sanity/queries';
import type { Skill } from '@/sanity/types';

const options = { next: { revalidate: 16800 } };

export default async function SkillsPage() {
  const skills = await client.fetch<Skill[]>(listSkillsQuery, {}, options);
  const t = await getTranslations('skills');

  return (
    <div className="pt-36 py-24 sm:py-32">
      <div className="mx-auto text-center max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl animated-gradient-text font-nf">
          <h2 className="text-base font-semibold leading-7">{t('title')}</h2>
          <p className="py-2 text-3xl font-bold tracking-tight sm:text-4xl">{t('subtitle')}</p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-7xl">
          <SkillList skills={skills} />
        </div>
      </div>
    </div>
  );
}
