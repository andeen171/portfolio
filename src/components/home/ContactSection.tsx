import { ArrowUpRightIcon } from '@heroicons/react/20/solid';
import { useTranslations } from 'next-intl';
import SectionHeading from '@/components/ui/SectionHeading';
import { cn } from '@/lib/utils';
import { SOCIALS } from './socials';

/** A shell prompt line; decorative, so the commands aren't read aloud. */
function Prompt({
  cwd,
  command,
  cursor = false,
}: {
  cwd: string;
  command?: string;
  cursor?: boolean;
}) {
  return (
    <p aria-hidden="true" className="font-nf text-sm text-ctp-subtext0 sm:text-base">
      <span className="text-ctp-mauve">{cwd}</span> <span className="text-ctp-teal">❯</span>{' '}
      {command && <span className="text-ctp-text">{command}</span>}
      {cursor && (
        <span className="inline-block h-[1.1em] w-[0.55em] translate-y-[0.2em] bg-ctp-lavender motion-safe:animate-pulse" />
      )}
    </p>
  );
}

export default function ContactSection() {
  const t = useTranslations('contact');
  // The same localized path the section eyebrow prints.
  const cwd = `~/${t('eyebrow')}`;

  // Static class strings so Tailwind sees every accent.
  const channels = [
    {
      ...SOCIALS.linkedin,
      description: t('linkedin'),
      accent: 'text-ctp-sapphire',
      hover: 'hover:ring-ctp-sapphire/70 hover:shadow-ctp-sapphire/15',
    },
    {
      ...SOCIALS.github,
      description: t('github'),
      accent: 'text-ctp-mauve',
      hover: 'hover:ring-ctp-mauve/70 hover:shadow-ctp-mauve/15',
    },
    {
      ...SOCIALS.x,
      description: t('x'),
      accent: 'text-ctp-sky',
      hover: 'hover:ring-ctp-sky/70 hover:shadow-ctp-sky/15',
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 pt-16 pb-24 sm:px-6 sm:pt-24 sm:pb-32 lg:px-8">
      <SectionHeading index="05" eyebrow={t('eyebrow')} title={t('title')} />

      <div className="mt-12 overflow-hidden rounded-2xl bg-ctp-mantle/70 shadow-2xl shadow-ctp-crust/50 ring-1 ring-ctp-surface1/70 backdrop-blur-md latte:shadow-ctp-overlay0/30">
        {/* Window chrome */}
        <div
          aria-hidden="true"
          className="relative flex items-center gap-2 border-b border-ctp-surface0 bg-ctp-crust/60 px-4 py-3"
        >
          <span className="size-3 rounded-full bg-ctp-red/80" />
          <span className="size-3 rounded-full bg-ctp-yellow/80" />
          <span className="size-3 rounded-full bg-ctp-green/80" />
          <span className="absolute inset-x-20 truncate text-center font-nf text-xs text-ctp-overlay1 latte:text-ctp-subtext0">
            anderson@arch: {cwd}
          </span>
        </div>

        <div className="space-y-5 p-5 sm:p-8">
          <Prompt cwd={cwd} command="cat invite.md" />
          <p className="max-w-2xl text-lg leading-relaxed text-pretty text-ctp-text sm:text-xl">
            {t('invite')}
          </p>

          <Prompt cwd={cwd} command="ls channels/" />
          <h3 className="sr-only">{t('channels')}</h3>
          <ul className="grid gap-3 sm:grid-cols-3">
            {channels.map(({ name, handle, url, Icon, description, accent, hover }) => (
              <li key={name}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'group relative flex h-full items-center gap-4 rounded-xl bg-ctp-base/60 p-4 pr-10 shadow-lg shadow-transparent ring-1 ring-ctp-surface1 transition duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-lavender motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:flex-col sm:items-start sm:pr-4',
                    hover
                  )}
                >
                  <Icon className={cn('size-6 shrink-0', accent)} />
                  <ArrowUpRightIcon
                    aria-hidden="true"
                    className="absolute top-4 right-4 size-4 text-ctp-overlay1 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ctp-text motion-reduce:transition-none"
                  />
                  {/* A row on phones, a small card from `sm` up. */}
                  <span className="min-w-0">
                    <span className="block font-semibold text-ctp-text">{name}</span>
                    <span className="block truncate font-nf text-xs text-ctp-subtext0">
                      {handle}
                    </span>
                    <span className="mt-1 block text-sm text-ctp-subtext1 sm:mt-4">
                      {description}
                    </span>
                  </span>
                  <span className="sr-only">{t('newTab')}</span>
                </a>
              </li>
            ))}
          </ul>

          <Prompt cwd={cwd} cursor />
        </div>
      </div>
    </div>
  );
}
