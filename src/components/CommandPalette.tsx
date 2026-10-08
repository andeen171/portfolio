'use client';

import type { FlavorName } from '@catppuccin/palette';
import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { ArrowUpRightIcon, CheckIcon, XMarkIcon } from '@heroicons/react/20/solid';
import {
  ChatBubbleLeftRightIcon,
  CommandLineIcon,
  LinkIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { useRouter as useNextRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  type ComponentType,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { LANGUAGES, useSwitchLocale } from '@/components/LanguageSelector';
import { FlavorSwatch } from '@/components/ThemeSelector';
import { getPathname, usePathname, useRouter } from '@/i18n/routing';
import { NAV_ITEMS, type NavKey } from '@/lib/navigation';
import { SOCIAL_IDS, SOCIALS } from '@/lib/social';
import { FLAVOR_NAMES, FLAVORS } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { useCommandPalette, useCtpStore } from '@/store';

/* ── Shortcut label ────────────────────────────────────────────────────── */

const noopSubscribe = () => () => {};

/** Apple keyboards say ⌘, everything else Ctrl. False on the server. */
function useIsApple() {
  return useSyncExternalStore(
    noopSubscribe,
    () => /Mac|iPhone|iPad|iPod/.test(navigator.userAgent),
    () => false
  );
}

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-ctp-surface0/80 px-1.5 font-nf text-[0.7rem] leading-none font-medium text-ctp-subtext1 shadow-[inset_0_-1px_0] shadow-ctp-surface2/60 ring-1 ring-ctp-surface1 latte:text-ctp-text',
        className
      )}
    >
      {children}
    </kbd>
  );
}

/** The palette's shortcut as keycaps, e.g. ⌘ K or Ctrl K. Decorative. */
export function PaletteShortcut({ className }: { className?: string }) {
  const apple = useIsApple();
  return (
    <span aria-hidden="true" className={cn('inline-flex items-center gap-1', className)}>
      <Kbd>{apple ? '⌘' : 'Ctrl'}</Kbd>
      <Kbd>K</Kbd>
    </span>
  );
}

/* ── Matching ──────────────────────────────────────────────────────────── */

/** Lowercase without accents, so "experiencias" finds "Experiências". */
function normalize(text: string) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

interface Match {
  score: number;
  /** Matched character positions in the label, for highlighting. */
  indices: number[];
}

/**
 * Scores one query token against a text: a substring beats a scattered
 * subsequence, and earlier, word-initial hits beat later ones. Null when the
 * token's letters don't all appear in order.
 */
function matchToken(token: string, text: string): Match | null {
  const at = text.indexOf(token);
  if (at !== -1) {
    const wordStart = at === 0 || /[\s\-/@.]/.test(text[at - 1] ?? '');
    return {
      score: 100 - Math.min(at, 40) + (wordStart ? 40 : 0),
      indices: Array.from({ length: token.length }, (_, i) => at + i),
    };
  }

  const indices: number[] = [];
  let from = 0;
  for (const char of token) {
    const found = text.indexOf(char, from);
    if (found === -1) return null;
    indices.push(found);
    from = found + 1;
  }
  const spread = (indices.at(-1) ?? 0) - (indices[0] ?? 0) - token.length + 1;
  return { score: Math.max(1, 40 - spread * 2 - (indices[0] ?? 0)), indices };
}

/**
 * Every whitespace-separated token must match the label or the command's
 * keywords; label hits score higher and are the ones highlighted.
 */
function matchCommand(query: string, label: string, keywords: string): Match | null {
  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return { score: 0, indices: [] };

  const inLabelText = normalize(label);
  const inKeywordText = normalize(keywords);
  let score = 0;
  const indices = new Set<number>();

  for (const token of tokens) {
    const inLabel = matchToken(token, inLabelText);
    const inKeywords = matchToken(token, inKeywordText);
    if (!inLabel && !inKeywords) return null;
    if (inLabel && (!inKeywords || inLabel.score >= inKeywords.score * 0.8)) {
      score += inLabel.score;
      for (const index of inLabel.indices) indices.add(index);
    } else if (inKeywords) {
      score += inKeywords.score * 0.8;
    }
  }
  return { score, indices: [...indices] };
}

function Highlighted({ text, indices }: { text: string; indices: number[] }) {
  if (indices.length === 0) return <>{text}</>;
  const marked = new Set(indices);
  // Runs of matched / unmatched characters, so a label stays a few nodes.
  const runs: { text: string; hit: boolean; start: number }[] = [];
  Array.from(text).forEach((char, i) => {
    const hit = marked.has(i);
    const last = runs.at(-1);
    if (last && last.hit === hit) last.text += char;
    else runs.push({ text: char, hit, start: i });
  });
  return (
    <>
      {runs.map((run) =>
        run.hit ? (
          <mark
            key={run.start}
            className="bg-transparent font-semibold text-ctp-lavender latte:text-ctp-lavender-900"
          >
            {run.text}
          </mark>
        ) : (
          <span key={run.start}>{run.text}</span>
        )
      )}
    </>
  );
}

/* ── Commands ──────────────────────────────────────────────────────────── */

type GroupId = 'navigate' | 'theme' | 'language' | 'social' | 'actions';

const GROUPS: GroupId[] = ['navigate', 'theme', 'language', 'social', 'actions'];

interface Command {
  id: string;
  group: GroupId;
  label: string;
  /** Extra search terms in both languages, never shown. */
  keywords: string;
  icon: ReactNode;
  /** Right-aligned mono detail, e.g. the path or handle. */
  hint?: string;
  current?: boolean;
  external?: boolean;
  /**
   * `now` runs inside the keypress/click: snappy, and pop-ups and the
   * clipboard need that user gesture. `afterClose` waits until the dialog has
   * unmounted and handed focus back to its trigger, so the focus a section
   * jump moves isn't pulled back there.
   */
  timing: 'now' | 'afterClose';
  perform: () => void;
}

const LANGUAGE_KEYWORDS: Record<(typeof LANGUAGES)[number]['code'], string> = {
  'en-US': 'english ingles language idioma',
  'pt-BR': 'portuguese portugues brasil language idioma',
};

const NAV_KEYWORDS: Record<NavKey, string> = {
  home: 'home inicio start top',
  skills: 'skills habilidades stack cards cartas tech',
  projects: 'projects projetos work trabalhos portfolio',
  experiences: 'experiences experiencias career carreira jobs work trabalho',
};

const SECTIONS = {
  about: { icon: UserCircleIcon, keywords: 'about sobre bio me whoami' },
  contact: { icon: ChatBubbleLeftRightIcon, keywords: 'contact contato hire talk falar' },
} as const;

function IconTile({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-ctp-mantle text-ctp-lavender ring-1 ring-ctp-surface1/80"
    >
      {children}
    </span>
  );
}

/**
 * Calls `run` when it unmounts. Rendered inside the dialog, it unmounts in the
 * same commit as Headless UI's focus trap, whose focus restore is a microtask
 * queued from that unmount; a timeout queued alongside it always runs after.
 */
function OnUnmount({ run }: { run: () => void }) {
  const latest = useRef(run);
  latest.current = run;
  useEffect(() => () => latest.current(), []);
  return null;
}

function iconTile(Icon: ComponentType<{ className?: string }>) {
  return (
    <IconTile>
      <Icon className="size-4" />
    </IconTile>
  );
}

/* ── Palette ───────────────────────────────────────────────────────────── */

const CommandPalette: React.FC = () => {
  const t = useTranslations('palette');
  const tNav = useTranslations('navigation');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const nextRouter = useNextRouter();
  const switchLocale = useSwitchLocale();
  const flavor = useCtpStore((state) => state.flavor);
  const swapFlavor = useCtpStore((state) => state.swapFlavor);
  const open = useCommandPalette((state) => state.open);
  const setOpen = useCommandPalette((state) => state.setOpen);
  const toggle = useCommandPalette((state) => state.toggle);

  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [toast, setToast] = useState({ message: '', ok: true, shown: false });
  const pending = useRef<(() => void) | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const baseId = useId();
  const listId = `${baseId}-list`;
  const optionId = useCallback((index: number) => `${baseId}-option-${index}`, [baseId]);

  // ⌘K / Ctrl+K from anywhere, including other text fields.
  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'k' || event.altKey || event.shiftKey) return;
      if (!(event.metaKey || event.ctrlKey) || event.isComposing) return;
      event.preventDefault();
      // A native modal (a skill card's <dialog>) holds the top layer and makes
      // the page inert: the palette would open beneath it, unreachable.
      if (document.querySelector('dialog:modal')) return;
      toggle();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggle]);

  // Reopened before the closing animation ended: the dialog never unmounted,
  // so afterLeave won't run. Run what was chosen now, start from a clean
  // prompt and put the caret back (the dialog's autofocus only fires on mount).
  useEffect(() => {
    if (!open) return;
    const perform = pending.current;
    pending.current = null;
    perform?.();
    setQuery('');
    setActiveIndex(0);
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!toast.shown) return;
    // Hide, but keep the text for the leave transition.
    const timeout = window.setTimeout(() => setToast((prev) => ({ ...prev, shown: false })), 2400);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const scrollToSection = useCallback(
    (id: string) => {
      const target = pathname === '/' ? document.getElementById(id) : null;
      if (!target) {
        // Another page: let the router land on the home page's anchor. The
        // path is localized by next-intl; only the #hash is appended here,
        // because next-intl's own router drops it.
        nextRouter.push(`${getPathname({ locale, href: '/' })}#${id}`);
        return;
      }
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      // Move focus along with the view, so the next Tab continues from there.
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      window.history.replaceState(window.history.state, '', `#${id}`);
    },
    [locale, nextRouter, pathname]
  );

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToast({ message: t('copied'), ok: true, shown: true });
    } catch {
      setToast({ message: t('copyFailed'), ok: false, shown: true });
    }
  }, [t]);

  const commands = useMemo<Command[]>(() => {
    const pages: Command[] = NAV_ITEMS.map((item) => ({
      id: `nav-${item.key}`,
      group: 'navigate',
      label: t(`commands.${item.key}`),
      keywords: NAV_KEYWORDS[item.key],
      icon: iconTile(item.icon),
      hint: item.href === '/' ? '~' : `~${item.href}`,
      current: pathname === item.href,
      timing: 'now',
      perform: () => router.push(item.href),
    }));

    // The home page's sections, by the anchor ids it promises.
    const sections: Command[] = (['about', 'contact'] as const).map((id) => ({
      id: `section-${id}`,
      group: 'navigate',
      label: t(`commands.${id}`),
      keywords: SECTIONS[id].keywords,
      icon: iconTile(SECTIONS[id].icon),
      hint: `~/#${id}`,
      timing: 'afterClose',
      perform: () => scrollToSection(id),
    }));

    const themes: Command[] = FLAVORS.map((name: FlavorName) => ({
      id: `theme-${name}`,
      group: 'theme',
      label: t('commands.theme', { name: FLAVOR_NAMES[name] }),
      keywords: `theme tema flavor sabor color cor ${name} ${name === 'latte' ? 'light claro' : 'dark escuro'}`,
      icon: (
        <IconTile>
          <FlavorSwatch flavor={name} />
        </IconTile>
      ),
      hint: name === 'latte' ? tNav('light') : tNav('dark'),
      current: flavor === name,
      timing: 'now',
      perform: () => swapFlavor(name),
    }));

    const languages: Command[] = LANGUAGES.map((language) => ({
      id: `lang-${language.code}`,
      group: 'language',
      label: language.label,
      keywords: LANGUAGE_KEYWORDS[language.code],
      icon: (
        <IconTile>
          <span className="font-nf text-[0.7rem] font-semibold">{language.short}</span>
        </IconTile>
      ),
      hint: language.code,
      current: locale === language.code,
      timing: 'now',
      perform: () => switchLocale(language.code),
    }));

    const socials: Command[] = SOCIAL_IDS.map((id) => {
      const social = SOCIALS[id];
      return {
        id: `social-${id}`,
        group: 'social',
        label: t('commands.social', { name: social.name }),
        keywords: `social redes ${id} ${social.handle}`,
        icon: iconTile(social.Icon),
        hint: social.handle,
        external: true,
        timing: 'now',
        perform: () => window.open(social.url, '_blank', 'noopener,noreferrer'),
      };
    });

    const actions: Command[] = [
      {
        id: 'copy-link',
        group: 'actions',
        label: t('commands.copyLink'),
        keywords: 'copy copiar link url share compartilhar clipboard',
        icon: iconTile(LinkIcon),
        hint: 'url',
        timing: 'now',
        perform: () => void copyLink(),
      },
    ];

    return [...pages, ...sections, ...themes, ...languages, ...socials, ...actions];
  }, [
    t,
    tNav,
    pathname,
    router,
    scrollToSection,
    flavor,
    swapFlavor,
    locale,
    switchLocale,
    copyLink,
  ]);

  // Filtered, grouped in a fixed order, best match first within a group.
  // `index` is the row's place in the flat list the arrow keys walk.
  const { groups, flat } = useMemo(() => {
    const scored = commands.flatMap((command) => {
      const match = matchCommand(query, command.label, command.keywords);
      return match ? [{ command, match }] : [];
    });
    let index = 0;
    const grouped = GROUPS.map((group) => ({
      group,
      items: scored
        .filter((result) => result.command.group === group)
        .sort((a, b) => b.match.score - a.match.score)
        .map((result) => ({ ...result, index: index++ })),
    })).filter((entry) => entry.items.length > 0);
    return { groups: grouped, flat: grouped.flatMap((entry) => entry.items) };
  }, [commands, query]);

  const activeId = flat[activeIndex] ? optionId(activeIndex) : undefined;

  // Keep the active row in view while arrowing through a scrolled list.
  useEffect(() => {
    if (!activeId) return;
    document.getElementById(activeId)?.scrollIntoView({ block: 'nearest' });
  }, [activeId]);

  const run = (command: Command) => {
    if (command.timing === 'now') command.perform();
    else pending.current = command.perform;
    setOpen(false);
  };

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const count = flat.length;
    const ctrl = event.ctrlKey && !event.metaKey && !event.altKey;
    if (event.key === 'ArrowDown' || (ctrl && event.key === 'n')) {
      event.preventDefault();
      if (count) setActiveIndex((index) => (index + 1) % count);
    } else if (event.key === 'ArrowUp' || (ctrl && event.key === 'p')) {
      event.preventDefault();
      if (count) setActiveIndex((index) => (index - 1 + count) % count);
    } else if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
      event.preventDefault();
      const command = flat[activeIndex]?.command;
      if (command) run(command);
    }
  };

  const afterLeave = () => {
    setQuery('');
    setActiveIndex(0);
  };

  // An `afterClose` command, once the dialog is gone and focus is restored.
  const runPending = () => {
    const perform = pending.current;
    pending.current = null;
    if (perform) window.setTimeout(perform, 0);
  };

  return (
    <>
      <Transition show={open} afterLeave={afterLeave}>
        <Dialog onClose={() => setOpen(false)} className="relative z-100">
          <TransitionChild>
            <div
              aria-hidden="true"
              className="fixed inset-0 bg-ctp-crust/50 backdrop-blur-sm transition-opacity duration-200 ease-out data-leave:duration-150 data-leave:ease-in data-closed:opacity-0 motion-reduce:transition-none latte:bg-ctp-overlay0/30"
            />
          </TransitionChild>

          <div className="fixed inset-0 overflow-y-auto px-3 pt-[9vh] pb-6 sm:px-6 sm:pt-[14vh]">
            <TransitionChild>
              <DialogPanel className="mx-auto w-full max-w-xl overflow-hidden rounded-2xl bg-ctp-base/90 shadow-2xl shadow-ctp-crust/60 ring-1 ring-ctp-surface1 backdrop-blur-xl transition duration-200 ease-out data-leave:duration-150 data-leave:ease-in data-closed:translate-y-2 data-closed:scale-[0.98] data-closed:opacity-0 motion-reduce:transition-none motion-reduce:data-closed:translate-y-0 motion-reduce:data-closed:scale-100 latte:shadow-ctp-overlay0/25">
                <DialogTitle className="sr-only">{t('title')}</DialogTitle>
                <Description className="sr-only">{t('description')}</Description>
                <OnUnmount run={runPending} />

                {/* Window chrome */}
                <div className="relative flex items-center gap-2 border-b border-ctp-surface0 bg-ctp-mantle/80 px-4 py-2.5">
                  <span aria-hidden="true" className="size-3 rounded-full bg-ctp-red/80" />
                  <span aria-hidden="true" className="size-3 rounded-full bg-ctp-yellow/80" />
                  <span aria-hidden="true" className="size-3 rounded-full bg-ctp-green/80" />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-24 truncate text-center font-nf text-xs text-ctp-subtext0 latte:text-ctp-subtext1"
                  >
                    anderson@arch: ~
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="ml-auto inline-flex items-center rounded-md px-1.5 py-1 font-nf text-[0.7rem] text-ctp-subtext0 transition-colors hover:bg-ctp-surface0 hover:text-ctp-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-lavender latte:text-ctp-subtext1"
                  >
                    <span aria-hidden="true" className="hidden sm:inline">
                      esc
                    </span>
                    <XMarkIcon aria-hidden="true" className="size-4 sm:hidden" />
                    <span className="sr-only">{t('keys.close')}</span>
                  </button>
                </div>

                {/* Prompt */}
                <div className="flex items-center gap-2.5 border-b border-ctp-surface0 px-4 py-3.5 font-nf text-sm sm:text-base">
                  {/* The hero's prompt; user@host gives way to the query on phones. */}
                  <span aria-hidden="true" className="shrink-0 select-none">
                    <span className="hidden sm:inline">
                      <span className="text-ctp-green">anderson</span>
                      <span className="text-ctp-overlay1">@</span>
                      <span className="text-ctp-blue">arch</span>{' '}
                    </span>
                    <span className="text-ctp-mauve">~</span>{' '}
                    <span className="text-ctp-teal">❯</span>
                  </span>
                  <input
                    ref={inputRef}
                    data-autofocus
                    type="text"
                    role="combobox"
                    aria-label={t('inputLabel')}
                    aria-expanded={flat.length > 0}
                    aria-controls={listId}
                    aria-autocomplete="list"
                    aria-activedescendant={activeId}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    enterKeyHint="go"
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setActiveIndex(0);
                    }}
                    onKeyDown={onInputKeyDown}
                    placeholder={t('placeholder')}
                    className="min-w-0 flex-1 border-0 bg-transparent p-0 text-ctp-text caret-ctp-lavender placeholder:text-ctp-overlay1 focus:ring-0 focus:outline-none"
                  />
                </div>

                {/* Results. Kept mounted (the input's aria-controls points here)
                    but hidden when nothing matches: a listbox may only hold
                    options, so the empty state is its sibling. */}
                <div
                  id={listId}
                  role="listbox"
                  aria-label={t('title')}
                  hidden={flat.length === 0}
                  className="max-h-[min(26rem,56vh)] scroll-py-2 overflow-y-auto overscroll-contain p-2"
                >
                  {groups.map(({ group, items }) => (
                    // biome-ignore lint/a11y/useSemanticElements: the ARIA listbox pattern groups options with role="group"; a fieldset isn't allowed there
                    <div
                      key={group}
                      role="group"
                      aria-labelledby={`${baseId}-group-${group}`}
                      className="pb-1 last:pb-0"
                    >
                      <div
                        id={`${baseId}-group-${group}`}
                        className="px-3 pt-2.5 pb-1.5 font-nf text-[0.7rem] font-medium tracking-wide text-ctp-subtext0 latte:text-ctp-subtext1"
                      >
                        <span aria-hidden="true" className="text-ctp-overlay1">
                          #{' '}
                        </span>
                        {t(`groups.${group}`)}
                      </div>
                      {items.map(({ command, match, index }) => {
                        const active = index === activeIndex;
                        return (
                          // biome-ignore lint/a11y/useKeyWithClickEvents: the combobox input owns the keyboard (arrows + Enter)
                          <div
                            key={command.id}
                            id={optionId(index)}
                            role="option"
                            aria-selected={active}
                            tabIndex={-1}
                            onMouseMove={() => {
                              if (!active) setActiveIndex(index);
                            }}
                            // Keep focus in the input when picking with the mouse.
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => run(command)}
                            className={cn(
                              'relative flex cursor-pointer items-center gap-3 rounded-xl py-2 pr-3 pl-6 text-sm',
                              active
                                ? 'bg-ctp-surface0/80 text-ctp-text ring-1 ring-ctp-surface1/80'
                                : 'text-ctp-subtext1'
                            )}
                          >
                            <span
                              aria-hidden="true"
                              className={cn(
                                'absolute left-2 font-nf text-xs text-ctp-lavender',
                                !active && 'invisible'
                              )}
                            >
                              ❯
                            </span>
                            {command.icon}
                            <span className="min-w-0 flex-1 truncate">
                              <Highlighted text={command.label} indices={match.indices} />
                              {command.external && <span className="sr-only">, {t('newTab')}</span>}
                            </span>
                            {command.current && (
                              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-ctp-green/15 px-2 py-0.5 font-nf text-[0.65rem] font-medium text-ctp-green ring-1 ring-ctp-green/30 latte:text-ctp-green-900">
                                <CheckIcon aria-hidden="true" className="size-3" />
                                {t('current')}
                              </span>
                            )}
                            {command.hint && (
                              <span className="hidden shrink-0 font-nf text-xs text-ctp-subtext0 sm:inline latte:text-ctp-subtext1">
                                {command.hint}
                              </span>
                            )}
                            {command.external && (
                              <ArrowUpRightIcon
                                aria-hidden="true"
                                className="size-4 shrink-0 text-ctp-overlay1"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                {flat.length === 0 && (
                  <div className="px-5 py-10 font-nf text-sm">
                    <p className="wrap-anywhere text-ctp-text">
                      <span className="text-ctp-red">zsh: </span>
                      {t('notFound', { query: query.trim() })}
                    </p>
                    <p className="mt-2 text-ctp-subtext0 latte:text-ctp-subtext1">
                      {t('notFoundHint')}
                    </p>
                  </div>
                )}

                {/* Announces the filtered count to screen readers. */}
                <p aria-live="polite" className="sr-only">
                  {query ? t('results', { count: flat.length }) : ''}
                </p>

                {/* Key legend, for keyboards */}
                <div
                  aria-hidden="true"
                  className="hidden items-center gap-4 border-t border-ctp-surface0 bg-ctp-mantle/60 px-4 py-2.5 font-nf text-[0.7rem] text-ctp-subtext0 sm:flex latte:text-ctp-subtext1"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Kbd>↑</Kbd>
                    <Kbd>↓</Kbd>
                    {t('keys.navigate')}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Kbd>↵</Kbd>
                    {t('keys.run')}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Kbd>esc</Kbd>
                    {t('keys.close')}
                  </span>
                  <span className="ml-auto inline-flex items-center gap-1.5 text-ctp-overlay1">
                    <CommandLineIcon className="size-3.5" />
                    andeen.sh
                  </span>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>

      {/* Outcome of "copy link", outlasting the dialog. */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-100 flex justify-center px-4"
      >
        <Transition show={toast.shown}>
          <p className="flex items-center gap-2 rounded-full bg-ctp-mantle/90 px-4 py-2 font-nf text-xs text-ctp-text shadow-xl shadow-ctp-crust/40 ring-1 ring-ctp-surface1 backdrop-blur-md transition duration-200 ease-out data-leave:duration-150 data-leave:ease-in data-closed:translate-y-2 data-closed:opacity-0 motion-reduce:transition-none motion-reduce:data-closed:translate-y-0">
            {toast.ok ? (
              <CheckIcon aria-hidden="true" className="size-4 text-ctp-green" />
            ) : (
              <XMarkIcon aria-hidden="true" className="size-4 text-ctp-red" />
            )}
            {toast.message}
          </p>
        </Transition>
      </div>
    </>
  );
};

export default CommandPalette;
