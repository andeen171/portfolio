import { ArrowRightIcon } from '@heroicons/react/20/solid';
import type React from 'react';
import { Link } from '@/i18n/routing';

/** The "see everything" link closing a home section, styled as a shell `cd`. */
export default function SeeMoreLink({
  href,
  path,
  children,
}: {
  href: '/projects' | '/experiences';
  path: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-3 rounded-full bg-ctp-mantle/60 py-2.5 pr-4 pl-5 text-sm font-semibold text-ctp-text ring-1 ring-ctp-surface1 backdrop-blur-md transition-colors hover:bg-ctp-mantle hover:ring-ctp-lavender/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ctp-lavender"
    >
      <span
        aria-hidden
        className="hidden font-nf text-xs font-normal text-ctp-subtext0 latte:text-ctp-subtext1 sm:inline"
      >
        <span className="text-ctp-teal latte:text-ctp-teal-800">cd</span> ~/{path}
      </span>
      <span>{children}</span>
      <ArrowRightIcon
        aria-hidden
        className="size-4 text-ctp-lavender transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
      />
    </Link>
  );
}
