import ExperienceItem from '@/components/experiences/ExperienceItem';
import type { ListExperiencesQueryResult, PreviewExperiencesQueryResult } from '@/sanity/types';
import { Timeline } from '../timeline/timeline';

type Experiences = ListExperiencesQueryResult | PreviewExperiencesQueryResult;

type Experience = Experiences[number];

interface ExperienceTimelineProps {
  experiences: Experiences;
}

const ExperienceTimeline: React.FC<ExperienceTimelineProps> = ({ experiences }) => {
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
    {} as Record<string, Experience[]>
  );

  return (
    <Timeline
      data={Object.entries(groupedExperiences)
        .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
        .map(([year, yearExperiences]) => ({
          title: year,
          content: (
            <div className="space-y-8 sm:space-y-10">
              {yearExperiences.map((experience) => (
                <ExperienceItem key={experience._id} experience={experience} />
              ))}
            </div>
          ),
        }))}
    />
  );
};

export default ExperienceTimeline;
