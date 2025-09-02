import type { Skill } from '@/sanity/types';
import SkillItem from './SkillItem';

type Props = {
  skills: Skill[];
};

const SkillList: React.FC<Props> = ({ skills }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 justify-items-center">
      {skills.map((skill) => (
        <SkillItem key={skill._id} skill={skill} />
      ))}
    </div>
  );
};

export default SkillList;
