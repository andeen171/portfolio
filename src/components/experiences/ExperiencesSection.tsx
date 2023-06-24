import Link from 'next/link'
import ExperienceList from './ExperienceList'

const ExperiencesSection: React.FC = () => {
  return (
    <section className="bg-ctp-base py-16">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="animated-gradient-text mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7">Experiences</h2>
          <p className="py-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Where I&apos;ve worked
          </p>
        </div>
        <ExperienceList />
        <div className="mt-8 text-center">
          <Link
            className="text-lg font-semibold text-ctp-lavender"
            href="/experiences"
          >
            View all experiences &rarr;
          </Link>
        </div>
      </div>
    </section>
  )
}

export default ExperiencesSection
