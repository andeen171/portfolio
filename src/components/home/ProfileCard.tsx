import Image from 'next/image';
import ProfilePic from '@/img/icon.png';
import type { Profile } from '@/lib/profile';
import { cn } from '@/lib/utils';

interface ProfileCardProps {
  name: string;
  /** The type line, trading-card style: "Human — Backend Developer". */
  type: string;
  /** Where he is right now, read from the open-ended experience in Sanity. */
  status?: { label: string; company: string; since?: string };
  flavor: string;
  origin: string;
  handle?: string;
  /** The Sanity photo; without one, the bundled portrait. */
  photo: Profile['photo'];
  photoAlt: string;
  className?: string;
}

/**
 * The portrait as a trading card, so About shares a frame with the skill
 * deck: a foil border (a conic gradient spinning behind a 2px gap), name bar,
 * art window, type line, a status row for the current job and flavor text.
 */
export default function ProfileCard({
  name,
  type,
  status,
  flavor,
  origin,
  handle,
  photo,
  photoAlt,
  className,
}: ProfileCardProps) {
  return (
    <div
      className={cn(
        'group relative isolate overflow-hidden rounded-[1.4375rem] p-[3px] shadow-2xl shadow-ctp-crust/60 latte:shadow-ctp-overlay0/40',
        className
      )}
    >
      {/* Foil border. Oversized so the corners stay covered as it turns. */}
      <span
        aria-hidden="true"
        style={{ animationDuration: '9s' }}
        className="absolute inset-[-60%] -z-10 animate-spin bg-[conic-gradient(from_0deg,var(--catppuccin-color-teal),var(--catppuccin-color-sky),var(--catppuccin-color-lavender),var(--catppuccin-color-mauve),var(--catppuccin-color-pink),var(--catppuccin-color-peach),var(--catppuccin-color-teal))] motion-reduce:animate-none"
      />

      <div className="flex flex-col gap-2.5 rounded-[1.25rem] bg-ctp-mantle p-3">
        <div className="flex items-center justify-between gap-3 rounded-lg bg-ctp-crust/70 px-3 py-2 ring-1 ring-ctp-surface0 latte:bg-ctp-base">
          <p className="truncate font-nf text-sm font-bold text-ctp-text">{name}</p>
          {/* The logo's 戦 ("fight") as the card's set symbol. */}
          <span
            aria-hidden="true"
            className="animated-gradient-text shrink-0 text-base leading-none font-extrabold"
          >
            戦
          </span>
        </div>

        <div className="relative overflow-hidden rounded-xl ring-1 ring-ctp-surface1">
          <Image
            {...(photo
              ? {
                  src: photo.src,
                  width: 720,
                  height: 720,
                  ...(photo.blurDataURL && {
                    placeholder: 'blur' as const,
                    blurDataURL: photo.blurDataURL,
                  }),
                }
              : { src: ProfilePic, placeholder: 'blur' as const })}
            alt={photoAlt}
            sizes="(min-width: 1024px) 22rem, 20rem"
            className="aspect-square w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
          />
          {/* Holo sheen that drifts across the art on hover. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -translate-x-1/3 bg-linear-to-tr from-transparent via-ctp-rosewater/40 to-transparent opacity-0 mix-blend-overlay transition duration-1000 ease-out group-hover:translate-x-1/3 group-hover:opacity-100 motion-reduce:transition-none"
          />
        </div>

        {type && (
          <p className="rounded-md bg-ctp-crust/70 px-3 py-1.5 font-nf text-[0.6875rem] font-semibold tracking-wide text-ctp-subtext1 ring-1 ring-ctp-surface0 latte:bg-ctp-base">
            {type}
          </p>
        )}

        {status && (
          // The company comes first and never truncates for the date: the
          // date drops to its own line under it.
          <p className="grid grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-x-2.5 gap-y-0.5 rounded-md bg-ctp-crust/70 px-3 py-2 font-nf text-[0.6875rem] ring-1 ring-ctp-surface0 latte:bg-ctp-base">
            <span aria-hidden="true" className="relative flex size-2">
              <span className="absolute inline-flex size-full rounded-full bg-ctp-green opacity-60 motion-safe:animate-ping" />
              <span className="relative inline-flex size-2 rounded-full bg-ctp-green" />
            </span>
            <span className="font-semibold tracking-wider text-ctp-green uppercase latte:text-ctp-green-900">
              {status.label}
            </span>
            <span className="truncate font-semibold text-ctp-text" title={status.company}>
              {status.company}
            </span>
            {status.since && (
              <span className="col-start-3 text-[0.625rem] text-ctp-subtext0 latte:text-ctp-subtext1">
                {status.since}
              </span>
            )}
          </p>
        )}

        {flavor && (
          <div className="rounded-lg bg-ctp-base/60 px-3 py-3 ring-1 ring-ctp-surface0 latte:bg-ctp-crust/40">
            <p className="text-sm text-ctp-subtext1 italic">“{flavor}”</p>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 px-1 font-nf text-[0.625rem] tracking-wider text-ctp-overlay1 uppercase latte:text-ctp-subtext1">
          <span className="truncate">{origin}</span>
          {handle && <span className="shrink-0 normal-case">{handle}</span>}
        </div>
      </div>
    </div>
  );
}
