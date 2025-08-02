import { SanityDocument } from 'next-sanity';
import ProjectItem from './ProjectItem';

interface ProjectListProps {
  projects: SanityDocument[];
}

const ProjectList: React.FC<ProjectListProps> = ({ projects }) => {
  return (
    <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
      {projects.map((project) => (
        <ProjectItem key={project._id} project={project} />
      ))}
    </dl>
  );
};

export default ProjectList;
