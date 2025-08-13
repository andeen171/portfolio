import { useTranslations } from '@/translations';
import { SanityDocument } from 'next-sanity';
import Link from 'next/link';
import ExperienceTimeline from './ExperienceTimeline';

interface Props {
  experiences: SanityDocument[];
}

const ExperiencesSection: React.FC<Props> = ({ experiences }) => {
  const t = useTranslations();

  return (
    <section className="py-16 sm:py-20 md:py-32 mt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animated-gradient-text mx-auto max-w-2xl text-center mb-10">
          <h2 className="text-sm sm:text-base font-semibold leading-7">{t.experiences.title}</h2>
          <p className="py-2 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            {t.experiences.subtitle}
          </p>
        </div>
        <ExperienceTimeline experiences={experiences} />
        <div className="mt-12 text-center">
          <Link
            className="inline-flex items-center gap-1 text-lg font-semibold text-ctp-lavender hover:text-ctp-pink transition-colors duration-300"
            href="/experiences"
          >
            {t.experiences.seeMore}
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              &rarr;
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ExperiencesSection;
