import { useLanguageStore } from '@/store/language';
import { getLocalizedValue } from '@/utils/localization';
import { SanityDocument } from 'next-sanity';
import { Timeline } from '../timeline/timeline';

interface ExperienceTimelineProps {
  experiences: SanityDocument[];
}

const ExperienceTimeline: React.FC<ExperienceTimelineProps> = ({ experiences }) => {
  const language = useLanguageStore((state) => state.language);

  // Agrupa experiências por ano
  const groupedExperiences = experiences.reduce(
    (acc, experience) => {
      // Extrai o ano da data de início
      const year = experience.endDate
        ? new Date(experience.endDate).getFullYear().toString()
        : new Date().getFullYear().toString();

      if (!acc[year]) {
        acc[year] = [];
      }

      acc[year].push(experience);
      return acc;
    },
    {} as Record<string, SanityDocument[]>
  );

  // Converte para o formato esperado pelo componente Timeline
  const timelineData = Object.entries(groupedExperiences)
    .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
    .map(([year, yearExperiences]) => ({
      title: year,
      content: (
        <div className="space-y-8 sm:space-y-10">
          {yearExperiences.map((experience) => {
            const title = getLocalizedValue(experience.title, language);
            const description = getLocalizedValue(experience.description, language);

            return (
              <div
                key={experience._id}
                className="rounded-xl bg-ctp-mantle p-5 shadow-xl transition-all duration-300 hover:shadow-lg hover:bg-ctp-mantle/90"
              >
                <h3 className="animated-gradient-text mb-2 text-xl font-bold">{title}</h3>
                <h4 className="mb-1 text-lg font-semibold text-ctp-subtext0">
                  {experience.company}
                </h4>
                <p className="mb-3 text-sm text-ctp-subtext1">
                  {experience.location} • {experience.startDate} - {experience.endDate || 'Present'}
                </p>
                <p className="text-sm text-ctp-text">{description}</p>
              </div>
            );
          })}
        </div>
      ),
    }));

  return <Timeline data={timelineData} />;
};

export default ExperienceTimeline;
