interface ProjectItemProps {
  project: {
    id: string
    name: string
    description: string
    image: string
    url: string
    repo: string
  }
}

const ProjectItem: React.FC<ProjectItemProps> = ({ project }) => {
  return (
    <article className="overflow-hidden rounded-xl shadow-xl transition hover:shadow-lg">
      <a href={project.url} target="_blank">
        <img
          src={project.image}
          alt={project.name}
          className="h-56 w-full object-cover hover:grayscale-[50%] transition"
        />
      </a>
      <div className="bg-ctp-mantle p-4 sm:p-6">
        <div className="flex flex-wrap gap-1">
          <span className="whitespace-nowrap rounded-full bg-ctp-lavender px-2.5 py-0.5 text-xs font-semibold text-ctp-base">
            Typescript
          </span>
          <span className="whitespace-nowrap rounded-full bg-ctp-pink px-2.5 py-0.5 text-xs font-semibold text-ctp-base">
            React
          </span>
          <span className="whitespace-nowrap rounded-full bg-ctp-teal px-2.5 py-0.5 text-xs font-semibold text-ctp-base">
            GraphQL
          </span>
        </div>
        <a href="#">
          <h3 className="mt-2 text-lg font-bold animated-gradient-text">
            {project.name}
          </h3>
        </a>

        <p className="mt-2 text-sm leading-relaxed text-ctp-subtext0 line-clamp-3">
          {project.description}
        </p>
        <a
          href="#"
          className="group mt-4 inline-flex items-center gap-1 text-sm font-medium text-ctp-lavender"
        >
          Repository
          <span
            aria-hidden="true"
            className="block transition group-hover:translate-x-0.5"
          >
            &rarr;
          </span>
        </a>
      </div>
    </article>
  )
}

export default ProjectItem
