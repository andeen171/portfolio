const ExperienceItemSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse rounded-lg bg-ctp-mantle p-4 text-ctp-text shadow-xl">
      <div className="mb-4 h-4 w-1/2 bg-ctp-surface1" />
      <div className="mb-2 h-4 w-1/3 bg-ctp-surface1" />
      <div className="mb-2 h-4 w-1/4 bg-ctp-surface1 text-sm" />
      <div className="h-4 w-full bg-ctp-surface1" />
    </div>
  );
};

export default ExperienceItemSkeleton;
