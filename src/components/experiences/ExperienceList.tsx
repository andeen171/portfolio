import ExperienceItem from './ExperienceItem'
import { api } from '~/utils/api'

const ExperienceList: React.FC = () => {
  const experiences = api.experience.getAll.useQuery()
  return (
    <div className="mt-16 grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2">
      {experiences.data?.map((experience) => (
        <ExperienceItem key={experience.id} experience={experience} />
      ))}
    </div>
  )
}

export default ExperienceList
