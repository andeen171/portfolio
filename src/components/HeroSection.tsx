import { ArrowDownIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import { useLocale, useTranslations } from 'next-intl';
import AnchorLink from '@/components/home/AnchorLink';
import HeroStats, { type HeroStat } from '@/components/home/HeroStats';
import { SOCIALS } from '@/components/home/socials';
import TypedText from '@/components/home/TypedText';
import ProgrammingSVG from '@/components/SVG/ProgrammingSVG';
import { cn } from '@/lib/utils';
import type { HeroQueryResult } from '@/sanity/types';
import { useLocalization } from '@/utils/localization';
import BackgroundBlurSVG from './SVG/BackgroundBlurSVG';

const FULL_NAME = 'Anderson Ribeiro Lopes';
// smartBackspace only erases what differs from the next string, so this order
// reads as the name being trimmed and regrown rather than retyped.
const NAME_VARIANTS = ['Anderson Ribeiro', 'Anderson Lopes', 'Andeen', 'Anderson'];

const YEAR_MS = 365.2425 * 24 * 60 * 60 * 1000;

/**
 * Entrance for the hero's pieces: CSS `@starting-style`, so it runs on the
 * first paint without waiting for hydration and leaves the content fully
 * visible where unsupported, without JS, or under reduced motion.
 */
const reveal =
  'transition-[opacity,translate] duration-700 ease-out starting:translate-y-3 starting:opacity-0 motion-reduce:transition-none';

const iconButton =
  'inline-flex size-12 items-center justify-center rounded-full bg-ctp-mantle/60 text-ctp-subtext1 ring-1 ring-ctp-surface1 backdrop-blur-md transition hover:-translate-y-0.5 hover:text-ctp-text hover:ring-ctp-lavender/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-lavender motion-reduce:hover:translate-y-0';

interface HeroSectionProps {
  hero: HeroQueryResult | null;
}

export default function HeroSection({ hero }: HeroSectionProps) {
  const t = useTranslations('home.hero');
  const tContact = useTranslations('contact');
  const locale = useLocale() as 'en-US' | 'pt-BR';
  const { getLocalizedValue } = useLocalization();

  const role = getLocalizedValue(hero?.current?.title ?? undefined, locale).trim();
  const company = hero?.current?.company?.trim() ?? '';
  const currentRole = [company, role].filter(Boolean).join(' · ');

  // Whole years, floored: "6+" stays true until the seventh anniversary.
  // Rendered on the server, so the client never recomputes it differently.
  const careerStart = hero?.careerStart ? Date.parse(hero.careerStart) : Number.NaN;
  const years = Number.isNaN(careerStart) ? 0 : Math.floor((Date.now() - careerStart) / YEAR_MS);

  const stats: HeroStat[] = [
    { key: 'years', value: years, suffix: '+', label: t('stats.years', { count: years }) },
    {
      key: 'projects',
      value: hero?.projectCount ?? 0,
      label: t('stats.projects', { count: hero?.projectCount ?? 0 }),
    },
    {
      key: 'skills',
      value: hero?.skillCount ?? 0,
      label: t('stats.skills', { count: hero?.skillCount ?? 0 }),
    },
    {
      key: 'companies',
      value: hero?.companyCount ?? 0,
      label: t('stats.companies', { count: hero?.companyCount ?? 0 }),
    },
  ].filter((stat) => stat.value > 0);

  return (
    <section className="relative isolate flex min-h-svh items-center pt-24 pb-28 sm:pt-28 lg:pb-24">
      <BackgroundBlurSVG />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-x-12 gap-y-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:px-8">
        <div className="min-w-0">
          {currentRole && (
            <p
              className={cn(
                reveal,
                'inline-flex max-w-full items-center gap-2.5 rounded-full bg-ctp-mantle/60 py-1.5 pr-4 pl-3 font-nf text-xs ring-1 ring-ctp-surface1/70 backdrop-blur-md sm:text-sm'
              )}
            >
              <span aria-hidden="true" className="relative flex size-2 shrink-0">
                <span className="absolute inline-flex size-full rounded-full bg-ctp-green opacity-60 motion-safe:animate-ping" />
                <span className="relative inline-flex size-2 rounded-full bg-ctp-green" />
              </span>
              <span className="shrink-0 font-semibold uppercase tracking-wider text-ctp-green latte:text-ctp-text">
                {t('now')}
              </span>
              <span aria-hidden="true" className="h-3.5 w-px shrink-0 bg-ctp-surface2" />
              {/* Company first: on a narrow screen the truncation eats the
                  title, not who he works for. */}
              <span className="min-w-0 truncate text-ctp-subtext1" title={currentRole}>
                {company && <span className="text-ctp-text">{company}</span>}
                {company && role && (
                  <>
                    <span aria-hidden="true" className="px-2 text-ctp-overlay1">
                      ·
                    </span>
                    <span className="sr-only">, </span>
                  </>
                )}
                {role}
              </span>
            </p>
          )}

          {/* A shell prompt whose "output" is the name below. */}
          <p
            aria-hidden="true"
            className={cn(reveal, 'mt-8 font-nf text-sm text-ctp-subtext0 delay-75 sm:text-base')}
          >
            <span className="text-ctp-green">anderson</span>
            <span className="text-ctp-overlay1">@</span>
            <span className="text-ctp-blue">arch</span> <span className="text-ctp-mauve">~</span>{' '}
            <span className="text-ctp-teal">❯</span> <span className="text-ctp-text">whoami</span>
          </p>

          <h1
            className={cn(
              reveal,
              'mt-3 font-nf text-4xl font-bold leading-[1.1] tracking-tight delay-150 sm:text-5xl lg:text-4xl xl:text-5xl'
            )}
          >
            <span className="sr-only">{FULL_NAME}</span>
            <TypedText
              initial={FULL_NAME}
              strings={NAME_VARIANTS}
              className="animated-gradient-text"
              typeSpeed={45}
              backSpeed={35}
              backDelay={2600}
            />
          </h1>

          <p
            className={cn(
              reveal,
              'mt-6 max-w-xl text-2xl font-semibold leading-snug tracking-tight text-balance text-ctp-text delay-200 sm:text-3xl'
            )}
          >
            {t.rich('tagline', {
              hl: (chunks) => <span className="animated-gradient-text">{chunks}</span>,
            })}
          </p>
          <p
            className={cn(
              reveal,
              'mt-4 max-w-xl text-base leading-relaxed text-pretty text-ctp-subtext0 delay-300 sm:text-lg latte:text-ctp-subtext1'
            )}
          >
            {t('lead')}
          </p>

          <div className={cn(reveal, 'mt-8 flex flex-wrap items-center gap-3 delay-[400ms]')}>
            <AnchorLink
              to="projects"
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-ctp-text px-6 font-semibold text-ctp-base shadow-lg shadow-ctp-lavender/20 ring-ctp-lavender/40 transition hover:shadow-ctp-lavender/40 hover:ring-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-lavender focus-visible:ring-offset-2 focus-visible:ring-offset-ctp-base"
            >
              {t('exploreProjects')}
              <ArrowDownIcon
                aria-hidden="true"
                className="size-4 transition-transform group-hover:translate-y-0.5 motion-reduce:transition-none"
              />
            </AnchorLink>
            {[
              { ...SOCIALS.github, label: t('github') },
              { ...SOCIALS.linkedin, label: t('linkedin') },
            ].map(({ name, url, Icon, label }) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                title={name}
                className={iconButton}
              >
                <Icon className="size-5" />
                <span className="sr-only">
                  {label} {tContact('newTab')}
                </span>
              </a>
            ))}
          </div>

          {stats.length > 0 && (
            <div className="mt-12 max-w-2xl">
              <HeroStats stats={stats} label={t('stats.label')} />
            </div>
          )}
        </div>

        <div
          className={cn(
            'mx-auto w-full max-w-md transition-[opacity,scale] delay-200 duration-1000 ease-out starting:scale-95 starting:opacity-0 motion-reduce:transition-none sm:max-w-lg lg:max-w-none'
          )}
        >
          <ProgrammingSVG />
        </div>
      </div>

      <AnchorLink
        to="about"
        aria-label={t('scrollLabel')}
        className="group absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 rounded-full px-3 py-1 font-nf text-xs tracking-widest text-ctp-overlay1 transition-colors hover:text-ctp-lavender focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-lavender"
      >
        <span aria-hidden="true">{t('scroll')}</span>
        <ChevronDownIcon aria-hidden="true" className="size-5 motion-safe:animate-bounce" />
      </AnchorLink>
    </section>
  );
}
