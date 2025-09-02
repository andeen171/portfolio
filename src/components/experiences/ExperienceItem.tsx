import { ListExperiencesQueryResult } from '@/sanity/types';
import { useLanguageStore } from '@/store/language';
import { useLocalization } from '@/utils/localization';

interface ExperienceProps {
  experience: ListExperiencesQueryResult[number];
}

const ExperienceItem: React.FC<ExperienceProps> = ({ experience }) => {
  const language = useLanguageStore((state) => state.language);
  const { getLocalizedValue } = useLocalization();

  const experienceTitle = getLocalizedValue(experience.title, language);
  const experienceDescription = getLocalizedValue(experience.description, language);

  return (
    <div className="rounded-lg bg-ctp-mantle p-3 sm:p-4 text-ctp-text shadow-xl">
      <h3 className="animated-gradient-text mb-2 sm:mb-4 text-xl sm:text-2xl font-bold">
        {experienceTitle}
      </h3>
      <h4 className="animated-gradient-text mb-1 sm:mb-2 text-lg sm:text-xl font-semibold">
        {experience.company}
      </h4>
      <p className="mb-2 text-xs sm:text-sm text-ctp-subtext1">
        {experience.location} &bull; {experience.startDate} - {experience.endDate || 'Present'}
      </p>
      <p className="text-sm sm:text-base text-ctp-text">{experienceDescription}</p>
    </div>
  );
};

export default ExperienceItem;
