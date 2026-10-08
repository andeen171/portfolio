import type { ListSkillsQueryResult } from '@/sanity/types';
import SkillItem from './SkillItem';

type Props = {
  skills: ListSkillsQueryResult;
};

const SkillList: React.FC<Props> = ({ skills }) => {
  return (
    // auto-fill tracks never go narrower than a card can lay out in, so the
    // grid adds or drops a column instead of squeezing cards into each other.
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,14rem),1fr))] justify-items-center gap-x-6 gap-y-8">
      {skills.map((skill) => (
        <li key={skill._id} className="flex w-full justify-center">
          <SkillItem skill={skill} />
        </li>
      ))}
    </ul>
  );
};

export default SkillList;
