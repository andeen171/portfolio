const ProjectItemSkeleton: React.FC = () => {
  return (
    <article className="animate-pulse overflow-hidden rounded-xl shadow-xl transition">
      <div className="h-56 w-full bg-ctp-surface1" />
      <div className="bg-ctp-mantle p-4 sm:p-6">
        <div className="flex flex-wrap gap-1">
          <div className="whitespace-nowrap rounded-full bg-ctp-surface1 px-2.5 py-0.5 text-xs"></div>
        </div>
        <div className="mt-2 h-6 w-1/2 bg-ctp-surface1"></div>
        <div className="mt-2 h-12 w-full bg-ctp-surface1"></div>
        <div className="bg-ctp-sufarce1 mt-4 h-4 w-1/4"></div>
      </div>
    </article>
  )
}

export default ProjectItemSkeleton
