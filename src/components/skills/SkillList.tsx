import {type SanityDocument} from 'next-sanity';
import SkillItem from './SkillItem';

type Props = {
  skills: SanityDocument[];
};

const SkillList: React.FC<Props> = ({ skills }) => {
  return (
    <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
      {skills.map((skill) => (
        <SkillItem key={skill._id} skill={skill} />
      ))}
    </dl>
  );
};

export default SkillList;
