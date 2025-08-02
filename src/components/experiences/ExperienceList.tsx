import { SanityDocument } from 'next-sanity';
import ExperienceItem from './ExperienceItem';

type Props = {
  experiences: SanityDocument[];
};

const ExperienceList: React.FC<Props> = ({ experiences }) => {
  return (
    <div className="mt-16 grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2">
      {experiences.map((experience) => (
        <ExperienceItem key={experience._id} experience={experience} />
      ))}
    </div>
  );
};

export default ExperienceList;
