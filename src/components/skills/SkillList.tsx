import { api } from '~/utils/api'
import SkillItem from './SkillItem'

const SkillList: React.FC = () => {
  const skills = api.skill.getAll.useQuery()

  return (
    <dl className="grid max-w-xl grid-cols-1 gap-y-10 gap-x-8 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
      {skills.data?.map((skill) => (
        <SkillItem key={skill.id} skill={skill} />
      ))}
    </dl>
  )
}

export default SkillList
