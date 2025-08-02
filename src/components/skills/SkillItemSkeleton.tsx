const SkillItemSkeleton: React.FC = () => {
  return (
    <div className="flex animate-pulse flex-col items-start rounded-xl bg-ctp-mantle p-6 shadow-xl">
      <div className="flex items-center">
        <div className="mb-4 h-8 w-10 bg-ctp-surface1" />
        <div className="mb-2 ml-2 h-4 w-24 bg-ctp-surface1" />
      </div>
      <div className="h-4 w-3/4 bg-ctp-surface1" />
    </div>
  );
};

export default SkillItemSkeleton;
