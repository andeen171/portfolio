import { client } from '@/sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { SanityDocument } from 'next-sanity';

const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset ? imageUrlBuilder({ projectId, dataset }).image(source) : null;

interface ProjectItemProps {
  project: SanityDocument;
}

const ProjectItem: React.FC<ProjectItemProps> = ({ project }) => {
  const projectImageUrl = project.images
    ? urlFor(project.images[0]!)?.width(550).height(310).url()
    : null;

  return (
    <article className="overflow-hidden rounded-xl shadow-xl transition hover:shadow-lg">
      {projectImageUrl && (
        <img
          src={projectImageUrl}
          alt={project.name[0].value}
          className="aspect-video rounded-xl"
          width="550"
          height="310"
        />
      )}
      <div className="bg-ctp-mantle p-4 sm:p-6">
        <div className="flex flex-wrap gap-1">
          {project.skills.map((skill: SanityDocument) => (
            <span
              key={skill._id}
              className="whitespace-nowrap rounded-full bg-ctp-pink px-2.5 py-0.5 text-xs
                font-semibold text-ctp-base first:bg-ctp-lavender last:bg-ctp-teal"
            >
              {skill.name}
            </span>
          ))}
        </div>
        <a href="/">
          <h3 className="animated-gradient-text mt-2 text-lg font-bold">{project.name[0].value}</h3>
        </a>

        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ctp-subtext0">
          {project.description[0].value}
        </p>
        <a
          href={project.repo}
          className="group mt-4 inline-flex items-center gap-1 text-sm font-medium text-ctp-lavender"
        >
          Repository
          <span aria-hidden="true" className="block transition group-hover:translate-x-0.5">
            &rarr;
          </span>
        </a>
      </div>
    </article>
  );
};

export default ProjectItem;
