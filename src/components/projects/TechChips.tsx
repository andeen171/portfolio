import { cn } from '@/lib/utils';

type Chip = { _id: string; name?: string | null } | null;

interface TechChipsProps {
  skills?: Chip[] | null;
  /** Accessible name for the list, e.g. "Tech stack". */
  label: string;
  className?: string;
}

/**
 * The stack behind a project or role, as one quiet row of mono chips. Every
 * chip looks the same on purpose: colour here would compete with the cover
 * art and say nothing about the skill.
 */
export default function TechChips({ skills, label, className }: TechChipsProps) {
  // A reference to a deleted skill dereferences to null, and the same skill
  // can be referenced twice — neither should render.
  const seen = new Set<string>();
  const chips = (skills ?? []).filter((skill): skill is { _id: string; name: string } => {
    if (!skill?.name?.trim() || seen.has(skill._id)) return false;
    seen.add(skill._id);
    return true;
  });

  if (chips.length === 0) return null;

  return (
    <ul aria-label={label} className={cn('flex flex-wrap gap-1.5', className)}>
      {chips.map((skill) => (
        <li
          key={skill._id}
          className="rounded-md bg-ctp-surface0/60 px-2 py-0.5 font-nf text-[0.6875rem] leading-5 text-ctp-subtext1 ring-1 ring-ctp-surface1/70 ring-inset"
        >
          {skill.name.trim()}
        </li>
      ))}
    </ul>
  );
}
