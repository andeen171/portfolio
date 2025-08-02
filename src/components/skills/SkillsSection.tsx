import { SanityDocument } from 'next-sanity';
import SkillList from './SkillList';

type Props = {
  skills: SanityDocument[];
};

const SkillsSection: React.FC<Props> = ({ skills }) => {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center animated-gradient-text">
          <h2 className="text-base font-semibold leading-7">Skills</h2>
          <p className="py-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Technologies I work with
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <SkillList skills={skills} />
        </div>
      </div>
    </div>
  );
};

export default SkillsSection;
