import type { routing } from '@/i18n/routing';
import { urlFor } from '@/sanity/lib/image';
import type { ProfileQueryResult } from '@/sanity/types';

export type AppLocale = (typeof routing.locales)[number];
export type SocialPlatform = 'github' | 'linkedin' | 'x' | 'instagram';
export type IntroSection = 'projects' | 'experiences' | 'skills';

/** A closed-source project in the Tatakae dossier. */
export interface ClassifiedFile {
  key: string;
  codename: string;
  name: string;
  status: string;
  /** YYYY-MM-DD, or empty. */
  since: string;
  /** Paragraphs; `[[words]]` are blacked out. */
  summary: string[];
  skills: { _id: string; name: string }[];
}

export interface SocialProfile {
  platform: SocialPlatform;
  url: string;
  handle: string;
  /** What to reach him there for, on its contact card. */
  blurb: string;
  inContact: boolean;
  inHero: boolean;
}

/**
 * The profile document from Sanity, resolved for one locale: plain strings,
 * paragraphs and lists, with every missing field empty rather than null, so
 * components only ever check for "is there anything to show".
 */
export interface Profile {
  fullName: string;
  shortName: string;
  nickname: string;
  jobTitle: string;
  headline: string;
  location: { city: string; region: string; countryCode: string; label: string; short: string };
  /** The card art, cropped square; null falls back to the bundled portrait. */
  photo: { src: string; blurDataURL?: string; alt: string } | null;
  terminal: { user: string; host: string };
  nameVariants: string[];
  /** The hero line; `*words*` light up. */
  tagline: string;
  lead: string;
  aboutTitle: string;
  roles: string[];
  bio: string[];
  cardFlavor: string;
  tatakae: {
    title: string;
    lede: string[];
    facts: { label: string; value: string }[];
    files: ClassifiedFile[];
  };
  contactTitle: string;
  contactInvite: string;
  socials: SocialProfile[];
  intros: Record<IntroSection, { title: string; lede: string }>;
  seoDescription: string;
  shareTagline: string;
  pageDescriptions: Record<IntroSection, string>;
  quote: string;
  quoteCredit: string;
  footerTagline: string;
  /** Skill names for structured data, from the deck's advanced and expert cards. */
  knowsAbout: string[];
}

type Localized = { _key: string; value?: string }[] | null | undefined;

const KEYS: Record<AppLocale, string> = { 'en-US': 'en', 'pt-BR': 'pt' };

/** The value in the visitor's language, else the first one filled in. */
export function pick(field: Localized, locale: AppLocale): string {
  if (!field?.length) return '';
  const own = field.find((item) => item._key === KEYS[locale])?.value?.trim();
  return own || field.find((item) => item.value?.trim())?.value?.trim() || '';
}

/** Paragraphs from a long text: separated by blank lines in the Studio. */
const paragraphs = (text: string) =>
  text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

/** One entry per line. */
const lines = (text: string) =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

const PLATFORMS = new Set<string>(['github', 'linkedin', 'x', 'instagram']);

export function resolveProfile(raw: ProfileQueryResult, locale: AppLocale): Profile {
  const text = (field: Localized) => pick(field, locale);
  const asset = raw?.photo?.asset;

  return {
    fullName: raw?.fullName?.trim() ?? '',
    shortName: raw?.shortName?.trim() ?? '',
    nickname: raw?.nickname?.trim() ?? '',
    jobTitle: text(raw?.jobTitle),
    headline: text(raw?.headline),
    location: {
      city: raw?.location?.city?.trim() ?? '',
      region: raw?.location?.region?.trim() ?? '',
      countryCode: raw?.location?.countryCode?.trim() ?? '',
      label: text(raw?.location?.label),
      short: raw?.location?.short?.trim() ?? '',
    },
    photo:
      raw?.photo && asset?._id
        ? {
            src: urlFor({ ...raw.photo, asset: { _ref: asset._id } })
              .width(720)
              .height(720)
              .fit('crop')
              .auto('format')
              .url(),
            blurDataURL: asset.metadata?.lqip ?? undefined,
            alt: text(raw.photo.alt),
          }
        : null,
    terminal: { user: raw?.terminal?.user?.trim() ?? '', host: raw?.terminal?.host?.trim() ?? '' },
    nameVariants: (raw?.nameVariants ?? []).map((name) => name.trim()).filter(Boolean),
    tagline: text(raw?.tagline),
    lead: text(raw?.lead),
    aboutTitle: text(raw?.aboutTitle),
    roles: lines(text(raw?.roles)),
    bio: paragraphs(text(raw?.bio)),
    cardFlavor: text(raw?.cardFlavor),
    tatakae: {
      title: text(raw?.tatakae?.title),
      lede: paragraphs(text(raw?.tatakae?.lede)),
      facts: lines(text(raw?.tatakae?.facts)).flatMap((line) => {
        const at = line.indexOf(':');
        const label = line.slice(0, at).trim();
        const value = line.slice(at + 1).trim();
        return at > 0 && value ? [{ label, value }] : [];
      }),
      files: (raw?.tatakae?.files ?? []).flatMap((file) =>
        file.codename?.trim()
          ? [
              {
                key: file._key,
                codename: file.codename.trim(),
                name: text(file.name),
                status: text(file.status),
                since: file.since ?? '',
                summary: paragraphs(text(file.summary)),
                skills: (file.skills ?? []).flatMap((skill) =>
                  skill?.name ? [{ _id: skill._id, name: skill.name }] : []
                ),
              },
            ]
          : []
      ),
    },
    contactTitle: text(raw?.contactTitle),
    contactInvite: text(raw?.contactInvite),
    socials: (raw?.socials ?? []).flatMap((social) =>
      social.platform && PLATFORMS.has(social.platform) && social.url
        ? [
            {
              platform: social.platform,
              url: social.url,
              handle: social.handle?.trim() ?? '',
              blurb: text(social.blurb),
              inContact: social.inContact ?? false,
              inHero: social.inHero ?? false,
            },
          ]
        : []
    ),
    intros: {
      projects: { title: text(raw?.projectsIntro?.title), lede: text(raw?.projectsIntro?.lede) },
      experiences: {
        title: text(raw?.experiencesIntro?.title),
        lede: text(raw?.experiencesIntro?.lede),
      },
      skills: { title: text(raw?.skillsIntro?.title), lede: text(raw?.skillsIntro?.lede) },
    },
    seoDescription: text(raw?.seoDescription),
    shareTagline: text(raw?.shareTagline),
    pageDescriptions: {
      projects: text(raw?.pageDescriptions?.projects),
      experiences: text(raw?.pageDescriptions?.experiences),
      skills: text(raw?.pageDescriptions?.skills),
    },
    quote: text(raw?.quote),
    quoteCredit: raw?.quoteCredit?.trim() ?? '',
    footerTagline: text(raw?.footerTagline),
    knowsAbout: (raw?.knowsAbout ?? []).filter((name): name is string => !!name),
  };
}

/** The X handle, for Twitter-card attribution. */
export const xHandle = (profile: Profile) =>
  profile.socials.find((social) => social.platform === 'x')?.handle || undefined;
