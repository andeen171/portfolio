import {
  BriefcaseIcon,
  CodeBracketIcon,
  HomeIcon,
  RectangleStackIcon,
} from '@heroicons/react/24/outline';

/** The site's pages, in the order the header, footer and palette list them. */
export const NAV_ITEMS = [
  { key: 'home', href: '/', icon: HomeIcon },
  { key: 'skills', href: '/skills', icon: RectangleStackIcon },
  { key: 'projects', href: '/projects', icon: CodeBracketIcon },
  { key: 'experiences', href: '/experiences', icon: BriefcaseIcon },
] as const;

export type NavKey = (typeof NAV_ITEMS)[number]['key'];

/** `pathname` is next-intl's, i.e. without the locale prefix. */
export function isActivePath(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}
