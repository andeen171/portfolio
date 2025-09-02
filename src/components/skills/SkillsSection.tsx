import { PreviewSkillsQueryResult } from '@/sanity/types';
import { useTranslations } from '@/translations';
import Link from 'next/link';
import SkillList from './SkillList';

type Props = {
  skills: PreviewSkillsQueryResult;
};

const SkillsSection: React.FC<Props> = ({ skills }) => {
  const t = useTranslations();

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center animated-gradient-text">
          <h2 className="text-base font-semibold leading-7">{t.skills.title}</h2>
          <p className="py-2 text-3xl font-bold tracking-tight sm:text-4xl">{t.skills.subtitle}</p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-7xl">
          <SkillList skills={skills} />
        </div>
        <div className="mt-8 text-center">
          <Link className="text-lg font-semibold text-ctp-lavender" href="/skills">
            {t.skills.seeMore} &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SkillsSection;
