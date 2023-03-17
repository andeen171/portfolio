import { api } from '~/utils/api'
import ProjectCard from './ProjectCard'

const ProjectList: React.FC = () => {
  const projects = api.project.getAll.useQuery()

  return (
    <div className="py-10 text-ctp-text">
      <h1 className="py-6 text-center text-4xl font-bold">Projects</h1>
      <p className="mx-auto max-w-[1000px] text-center text-ctp-subtext0 lg:px-6">
        lorem ipsum dolor sit amet, consectetur adipisicing elit. Pariatur,
        cupiditate! Molestiae placeat architecto nihil obcaecati illum minima
        incidunt dolores? Officia consectetur optio non totam cum eos soluta
        ipsa et quod.
      </p>
      <div className="tl:grid-cols-1 grid grid-cols-3 items-center justify-center gap-8 p-10 lg:grid-cols-2  ">
        {projects.data?.map((item, i) => (
          <ProjectCard key={i} project={item} />
        ))}
      </div>
    </div>
  )
}

export default ProjectList
