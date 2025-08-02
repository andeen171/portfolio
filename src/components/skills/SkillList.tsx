import { type SanityDocument } from 'next-sanity';
import SkillItem from './SkillItem';

type Props = {
  skills: SanityDocument[];
};

const SkillList: React.FC<Props> = ({ skills }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {skills.map((skill) => (
        <SkillItem key={skill._id} skill={skill} />
      ))}
    </div>
  );
};

export default SkillList;
