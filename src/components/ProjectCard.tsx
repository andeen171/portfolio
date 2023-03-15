import { type Project } from '@prisma/client'
import Link from 'next/link'
import Image from 'next/image'

type Props = {
  project: Project
}

const ProjectCard: React.FC<Props> = ({ project }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-2xl font-bold">{project.name}</p>
      <Link href={project.url} target="_blank">
        <img src={project.image} alt={project.name} />
      </Link>
      <p className="text-lg">{project.description}</p>
    </div>
  )
}

export default ProjectCard
