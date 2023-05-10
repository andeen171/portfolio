interface SkillItemProps {
  skill: {
    id: string
    name: string
    description: string
    image: string
  }
}

const SkillItem: React.FC<SkillItemProps> = ({ skill }) => {
  return (
    <div className="flex flex-col items-start rounded-xl bg-ctp-mantle p-6 shadow-xl transition hover:shadow-lg">
      <div className="animated-gradient-text flex items-center">
        <div className="mb-4 h-10 w-10 ">
          <i className={`${skill.image} text-4xl`}></i>
        </div>
        <dt className="ml-4 mb-2 text-base font-semibold leading-7">
          {skill.name}
        </dt>
      </div>
      <dd className="text-base leading-7 text-ctp-subtext0">
        {skill.description}
      </dd>
    </div>
  )
}

export default SkillItem
