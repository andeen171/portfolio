'use client';

import type { AnchorHTMLAttributes, MouseEvent } from 'react';

type AnchorLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** Id of the element on this page to scroll to, without the `#`. */
  to: string;
};

/**
 * A same-page `#hash` link that glides instead of jumping, unless the visitor
 * prefers reduced motion. Without JS it is a plain anchor, and the target's
 * `scroll-margin` keeps it clear of the fixed header either way.
 */
export default function AnchorLink({ to, onClick, ...props }: AnchorLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey) return;
    const target = document.getElementById(to);
    if (!target) return;

    event.preventDefault();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    window.history.pushState(window.history.state, '', `#${to}`);
  };

  return <a href={`#${to}`} onClick={handleClick} {...props} />;
}
