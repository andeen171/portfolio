interface SkillItemProps {
  skill: {
    id: number;
    name: string;
    description: string;
    image: string;
  };
}

const SkillItem: React.FC<SkillItemProps> = ({ skill }) => {
  return (
    <div className="relative pl-16">
      <dt className="text-base font-semibold leading-7 text-ctp-text">
        <div className="absolute top-0 left-0 flex h-10 w-10 items-center justify-center rounded-lg bg-ctp-lavender">
          <img src={skill.image} alt={skill.name} className="h-6 w-6 text-ctp-base" />
        </div>
        {skill.name}
      </dt>
      <dd className="mt-2 text-base leading-7 text-ctp-subtext0">
        {skill.description}
      </dd>
    </div>
  );
};

export default SkillItem
