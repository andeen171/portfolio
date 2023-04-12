interface ExperienceProps {
    experience: {
        id: string
        name: string
        company: string
        startDate: string
        endDate: string
        description: string
    }
}

const ExperienceItem: React.FC<ExperienceProps> = ({ experience }) => {
    return (
      <div className="rounded-lg bg-ctp-mantle p-4 text-ctp-text shadow-xl">
        <h3 className="mb-4 text-2xl font-bold animated-gradient-text">{experience.name}</h3>
        <h4 className="mb-2 text-xl font-semibold animated-gradient-text">{experience.company}</h4>
        <p className="mb-2 text-sm text-ctp-subtext1">
          Belo Horizonte &bull; {experience.startDate} -{' '}
          {experience.endDate || 'Present'}
        </p>
        <p className="text-ctp-text">{experience.description}</p>
      </div>
    )
}

export default ExperienceItem