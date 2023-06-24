import { api } from '~/utils/api'
import ProjectItem from './ProjectItem'
import ProjectItemSkeleton from './ProjectItemSkeleton'

const ProjectList: React.FC = () => {
  const projects = api.project.getAll.useQuery()

  return (
    <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
      {projects.isLoading && (
        <>
          <ProjectItemSkeleton />
          <ProjectItemSkeleton />
        </>
      )}

      {projects.data?.map((project) => (
        <ProjectItem key={project.id} project={project} />
      ))}
    </dl>
  )
}

export default ProjectList
