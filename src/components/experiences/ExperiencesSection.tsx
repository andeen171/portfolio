import Link from 'next/link'
import ExperienceItem from './ExperienceItem'

const ExperiencesSection: React.FC = () => {
  const experiences = [
    {
      id: '1',
      name: 'Frontend Developer',
      company: 'Cubos',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc vel tincidunt lacinia, nunc est aliquam nisl, eget aliquam massa nisl eget dolor. Sed euismod, nunc vel tincidunt lacinia, nunc est aliquam nisl, eget aliquam massa nisl eget dolor.',
      startDate: '2020-01-01',
      endDate: '2020-12-31'
    },
    {
      id: '2',
      name: 'Frontend Developer',
      company: 'Cubos',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc vel tincidunt lacinia, nunc est aliquam nisl, eget aliquam massa nisl eget dolor. Sed euismod, nunc vel tincidunt lacinia, nunc est aliquam nisl, eget aliquam massa nisl eget dolor.',
      startDate: '2020-01-01',
      endDate: '2020-12-31'
    }
  ]
  return (
    <section className="bg-ctp-base py-16">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="animated-gradient-text mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7">Experiences</h2>
          <p className="py-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Where I&apos;ve worked
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2">
          {experiences.map((experience) => (
            <ExperienceItem key={experience.id} experience={experience} />
          ))}
        </div>
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
