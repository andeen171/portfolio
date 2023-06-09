import Link from 'next/link'
import ProjectList from './ProjectList'

const ProjectsSection: React.FC = () => {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="animated-gradient-text mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 ">Projects</h2>
          <p className="py-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Some of my work
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <ProjectList />
        </div>
        <div className="mt-8 text-center">
          <Link
            className="text-lg font-semibold text-ctp-lavender"
            href="projects"
          >
            See more amazing projects &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ProjectsSection
