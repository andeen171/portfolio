import { type Project, type Skill } from '@prisma/client'

interface ProjectItemProps {
  project: Project & {
    skills: Partial<Skill>[]
  }
}

const ProjectItem: React.FC<ProjectItemProps> = ({ project }) => {
  return (
    <article className="overflow-hidden rounded-xl shadow-xl transition hover:shadow-lg">
      <a href={project.url} target="_blank">
        <img
          src={project.image}
          alt={project.name}
          className="w-full object-cover transition hover:grayscale-[50%]"
        />
      </a>
      <div className="bg-ctp-mantle p-4 sm:p-6">
        <div className="flex flex-wrap gap-1">
          {project.skills.map((skill) => (
            <span
              key={skill.id}
              className="whitespace-nowrap rounded-full bg-ctp-pink px-2.5 py-0.5 text-xs
                font-semibold text-ctp-base first:bg-ctp-lavender last:bg-ctp-teal"
            >
              {skill.name}
            </span>
          ))}
        </div>
        <a href="#">
          <h3 className="animated-gradient-text mt-2 text-lg font-bold">
            {project.name}
          </h3>
        </a>

        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ctp-subtext0">
          {project.description}
        </p>
        <a
          href={project.repo}
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
