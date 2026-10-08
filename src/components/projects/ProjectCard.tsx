import {
  ArrowUpRightIcon,
  CalendarIcon,
  CodeBracketIcon,
  GlobeAltIcon,
} from '@heroicons/react/20/solid';
import { useLocale, useTranslations } from 'next-intl';
import type React from 'react';
import {
  formatMonthYear,
  isoYearMonth,
  parseYearMonth,
  toParagraphs,
} from '@/components/experiences/format';
import { cn } from '@/lib/utils';
import type { ListProjectsQueryResult } from '@/sanity/types';
import { useLocalization } from '@/utils/localization';
import ExpandableText from './ExpandableText';
import ProjectCover from './ProjectCover';
import TechChips from './TechChips';

type Project = ListProjectsQueryResult[number];
type Locale = 'en-US' | 'pt-BR';

interface ProjectCardProps {
  project: Project;
  /** h3 under a page's h2 year headings, h4 under a home section's h3 years. */
  titleAs?: 'h3' | 'h4';
}

/** The last path segment of the repo URL, or a slug of the name. */
function projectSlug(project: Project, name: string): string {
  if (project.repo) {
    try {
      const segment = new URL(project.repo).pathname.split('/').filter(Boolean).pop();
      if (segment) return segment.toLowerCase();
    } catch {
      // Not a URL — fall through to the name.
    }
  }
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const LINK_BASE =
  'group/link inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium ring-1 ring-inset transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ctp-lavender';

function ExternalLink({
  href,
  icon: Icon,
  primary,
  newTabLabel,
  children,
}: {
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  primary: boolean;
  newTabLabel: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        LINK_BASE,
        primary
          ? 'bg-ctp-lavender/15 text-ctp-text ring-ctp-lavender/50 hover:bg-ctp-lavender/25 hover:ring-ctp-lavender'
          : 'bg-ctp-surface0/40 text-ctp-subtext1 ring-ctp-surface1 hover:bg-ctp-surface0/80 hover:text-ctp-text'
      )}
    >
      <Icon
        aria-hidden
        className={cn('size-4', primary ? 'text-ctp-lavender' : 'text-ctp-overlay2')}
      />
      {children}
      <span className="sr-only"> {newTabLabel}</span>
      <ArrowUpRightIcon
        aria-hidden
        className="size-3.5 opacity-60 transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 motion-reduce:transition-none"
      />
    </a>
  );
}

/**
 * One project in the showcase: cover art on the left (top on phones), the
 * story and its links on the right. The links are the card's only actions —
 * the live site leads when there is one, the repository otherwise.
 */
export default function ProjectCard({ project, titleAs: Title = 'h3' }: ProjectCardProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations('projects');
  const { getLocalizedValue } = useLocalization();

  const name = (getLocalizedValue(project.name, locale) ?? '').trim();
  const paragraphs = toParagraphs(getLocalizedValue(project.description, locale));
  const date = parseYearMonth(project.date);
  const image = project.images?.find((img) => img.asset) ?? null;
  const demo = project.url || null;
  const repo = project.repo || null;

  return (
    <article className="group relative overflow-hidden rounded-2xl bg-ctp-mantle/60 shadow-xl shadow-ctp-crust/20 ring-1 ring-ctp-surface1/60 backdrop-blur-md transition-[box-shadow] duration-300 hover:ring-ctp-lavender/40">
      {/* Hairline of light along the top edge on hover. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-linear-to-r from-transparent via-ctp-lavender/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <ProjectCover
          seed={project._id}
          name={name}
          slug={projectSlug(project, name)}
          image={image}
          imageAlt={t('coverAlt', { name })}
          skills={project.skills}
        />

        <div className="flex min-w-0 flex-col p-5 sm:p-6">
          {date && (
            <p className="flex items-center gap-1.5 font-nf text-xs text-ctp-subtext0 latte:text-ctp-subtext1">
              <CalendarIcon aria-hidden className="size-3.5 text-ctp-teal" />
              <time dateTime={isoYearMonth(date)}>{formatMonthYear(locale, date)}</time>
            </p>
          )}

          <Title className="mt-2 text-xl font-bold leading-snug text-balance text-ctp-text">
            {name}
          </Title>

          <ExpandableText
            paragraphs={paragraphs}
            lines={3}
            moreLabel={t('readMore')}
            lessLabel={t('showLess')}
            className="mt-3"
          />

          <TechChips skills={project.skills} label={t('stack')} className="mt-4" />

          {(demo || repo) && (
            <div className="mt-auto flex flex-wrap gap-2 pt-5">
              {demo && (
                <ExternalLink href={demo} icon={GlobeAltIcon} primary newTabLabel={t('newTab')}>
                  {t('demo')}
                </ExternalLink>
              )}
              {repo && (
                <ExternalLink
                  href={repo}
                  icon={CodeBracketIcon}
                  primary={!demo}
                  newTabLabel={t('newTab')}
                >
                  {t('repository')}
                </ExternalLink>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
