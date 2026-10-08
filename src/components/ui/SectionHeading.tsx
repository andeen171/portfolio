import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  /** Short label printed like a shell path above the title, e.g. "projects". */
  eyebrow: string;
  /** The heading itself. */
  title: string;
  /** Optional ordinal shown before the eyebrow, e.g. "02". */
  index?: string;
  /** Heading level; pages use h1, home-page sections h2. */
  as?: 'h1' | 'h2';
  align?: 'center' | 'left';
  className?: string;
}

/**
 * The one heading style every section shares: a terminal-path eyebrow
 * (`02 ~/projects`) over a large gradient title.
 */
export default function SectionHeading({
  eyebrow,
  title,
  index,
  as: Heading = 'h2',
  align = 'center',
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'font-nf',
        align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl text-left',
        className
      )}
    >
      {/* Latte's muted tones and teal sit under 4.5:1 on its base, so each
          step of the eyebrow moves one shade darker there. */}
      <p className="text-sm font-semibold tracking-wide text-ctp-subtext0 latte:text-ctp-text">
        {index && (
          <span aria-hidden className="mr-2 text-ctp-overlay2 latte:text-ctp-subtext1">
            {index}
          </span>
        )}
        <span aria-hidden className="text-ctp-teal latte:text-ctp-teal-800">
          ~/
        </span>
        {eyebrow}
      </p>
      <Heading className="animated-gradient-text mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
        {title}
      </Heading>
    </div>
  );
}
