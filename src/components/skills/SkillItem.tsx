import {SanityDocument} from 'next-sanity';

interface SkillItemProps {
  skill: SanityDocument;
}

const SkillItem: React.FC<SkillItemProps> = ({ skill }) => {
  return (
    <div className="flex flex-col items-start rounded-xl bg-ctp-mantle p-6 shadow-xl transition hover:shadow-lg">
      <div className="animated-gradient-text flex items-center">
        {/*<div className="h-3 max-w-4" dangerouslySetInnerHTML={{ __html: skill.svgCode }} />*/}
        <dt className="mb-2 ml-2 text-xl font-semibold leading-7">{skill.name}</dt>
      </div>
      <dd className="text-base leading-7 text-ctp-subtext0">{skill.description[0].value}</dd>
    </div>
  );
};

export default SkillItem;
