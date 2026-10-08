import { useTranslations } from 'next-intl';
import SeeMoreLink from '@/components/projects/SeeMoreLink';
import SectionHeading from '@/components/ui/SectionHeading';
import type { PreviewExperiencesQueryResult } from '@/sanity/types';
import ExperienceTimeline from './ExperienceTimeline';

interface Props {
  experiences: PreviewExperiencesQueryResult;
}

const ExperiencesSection: React.FC<Props> = ({ experiences }) => {
  const t = useTranslations('experiences');

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading index="03" eyebrow={t('eyebrow')} title={t('subtitle')} />
        <p className="mx-auto mt-4 max-w-2xl text-center text-pretty text-ctp-subtext1">
          {t('lede')}
        </p>

        <div className="mt-14 sm:mt-16">
          <ExperienceTimeline experiences={experiences} />
        </div>

        <div className="mt-4 text-center">
          <SeeMoreLink href="/experiences" path={t('eyebrow')}>
            {t('seeMore')}
          </SeeMoreLink>
        </div>
      </div>
    </div>
  );
};

export default ExperiencesSection;
