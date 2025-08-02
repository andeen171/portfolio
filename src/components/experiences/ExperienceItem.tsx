import { SanityDocument } from 'next-sanity';

interface ExperienceProps {
  experience: SanityDocument;
}

const ExperienceItem: React.FC<ExperienceProps> = ({ experience }) => {
  return (
    <div className="rounded-lg bg-ctp-mantle p-3 sm:p-4 text-ctp-text shadow-xl">
      <h3 className="animated-gradient-text mb-2 sm:mb-4 text-xl sm:text-2xl font-bold">
        {experience.title[0].value}
      </h3>
      <h4 className="animated-gradient-text mb-1 sm:mb-2 text-lg sm:text-xl font-semibold">
        {experience.company}
      </h4>
      <p className="mb-2 text-xs sm:text-sm text-ctp-subtext1">
        {experience.location} &bull; {experience.startDate} - {experience.endDate || 'Present'}
      </p>
      <p className="text-sm sm:text-base text-ctp-text">{experience.description[0].value}</p>
    </div>
  );
};

export default ExperienceItem;
