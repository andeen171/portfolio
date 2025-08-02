import { SanityDocument } from 'next-sanity';
import Link from 'next/link';
import ExperienceList from './ExperienceList';

interface Props {
  experiences: SanityDocument[];
}

const ExperiencesSection: React.FC<Props> = ({ experiences }) => {
  return (
    <section className="bg-ctp-base py-8 sm:py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animated-gradient-text mx-auto max-w-2xl text-center">
          <h2 className="text-sm sm:text-base font-semibold leading-7">Experiences</h2>
          <p className="py-2 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            Where I&apos;ve worked
          </p>
        </div>
        <ExperienceList experiences={experiences} />
        <div className="mt-6 sm:mt-8 text-center">
          <Link
            className="text-base sm:text-lg font-semibold text-ctp-lavender"
            href="/experiences"
          >
            View all experiences &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ExperiencesSection;
