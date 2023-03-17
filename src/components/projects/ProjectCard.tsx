import { type Project } from '@prisma/client'
import Link from 'next/link'
import Image from 'next/image'

type Props = {
  project: Project
}

const ProjectCard: React.FC<Props> = ({ project }) => {
  return (
    <div className="img-box lg2:w-auto relative mx-auto flex w-[450px] items-center justify-center overflow-hidden rounded-3xl">
      <Image
        src={project.image}
        alt={project.name}
        width={200}
        height={200}
        className="w-full"
      />
      <div className="p absolute top-[-100%] left-0 h-full w-full bg-[#b004b0b7] p-4 pt-20 text-center">
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <p className="font-bold">{project.description}</p>
      </div>
    </div>
  )
}

export default ProjectCard
