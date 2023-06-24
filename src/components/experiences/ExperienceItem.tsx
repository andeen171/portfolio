import { type Experience } from '@prisma/client'

interface ExperienceProps {
  experience: Experience
}

const ExperienceItem: React.FC<ExperienceProps> = ({ experience }) => {
  return (
    <div className="rounded-lg bg-ctp-mantle p-4 text-ctp-text shadow-xl">
      <h3 className="animated-gradient-text mb-4 text-2xl font-bold">
        {experience.title}
      </h3>
      <h4 className="animated-gradient-text mb-2 text-xl font-semibold">
        {experience.company}
      </h4>
      <p className="mb-2 text-sm text-ctp-subtext1">
        Belo Horizonte &bull; {experience.startDate.toLocaleDateString()} -{' '}
        {experience.endDate?.toLocaleDateString() || 'Present'}
      </p>
      <p className="text-ctp-text">{experience.description}</p>
    </div>
  )
}

export default ExperienceItem
