import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getPathname, routing } from '@/i18n/routing';

/** The X handle, for Twitter-card attribution. */
export const X_HANDLE = '@Andeen171';

export type AppLocale = (typeof routing.locales)[number];

const OG_LOCALES: Record<AppLocale, string> = { 'en-US': 'en_US', 'pt-BR': 'pt_BR' };

/** Canonical + hreflang links for one route, e.g. "/skills" → "/pt-BR/skills". */
export function alternatesFor(locale: AppLocale, href: string): Metadata['alternates'] {
  return {
    canonical: getPathname({ locale, href }),
    languages: {
      ...Object.fromEntries(
        routing.locales.map((other) => [other, getPathname({ locale: other, href })])
      ),
      'x-default': getPathname({ locale: routing.defaultLocale, href }),
    },
  };
}

/**
 * Open Graph fields every route shares. Images come from the opengraph-image.tsx
 * file convention, which only fills a segment's own openGraph/twitter: each
 * sub-page folder re-exports the locale's card for that reason.
 */
export async function baseOpenGraph(locale: AppLocale) {
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    type: 'website',
    siteName: t('siteName'),
    locale: OG_LOCALES[locale],
    alternateLocale: routing.locales
      .filter((other) => other !== locale)
      .map((other) => OG_LOCALES[other]),
  } satisfies Metadata['openGraph'];
}

type Page = 'skills' | 'projects' | 'experiences';

/**
 * Metadata for a sub-page: a localized title (the layout's template adds
 * " · Anderson Lopes"), description, its own canonical/hreflang links and
 * Open Graph. Pages must set these themselves, since a page that doesn't
 * inherits the home page's canonical from the layout. Setting openGraph and
 * twitter here drops the layout's share image, so the page's folder needs its
 * own opengraph-image.tsx (a re-export of [locale]/opengraph-image).
 *
 *   export async function generateMetadata({ params }) {
 *     const { locale } = await params;
 *     return pageMetadata(locale, 'skills');
 *   }
 */
export async function pageMetadata(locale: string, page: Page): Promise<Metadata> {
  const appLocale = (routing.locales as readonly string[]).includes(locale)
    ? (locale as AppLocale)
    : routing.defaultLocale;
  const t = await getTranslations({ locale: appLocale, namespace: 'meta' });
  const href = `/${page}`;
  const title = t(`pages.${page}.title`);
  const description = t(`pages.${page}.description`);
  const socialTitle = t('titleTemplate').replace('%s', title);

  return {
    title,
    description,
    alternates: alternatesFor(appLocale, href),
    openGraph: {
      ...(await baseOpenGraph(appLocale)),
      title: socialTitle,
      description,
      url: getPathname({ locale: appLocale, href }),
    },
    twitter: { card: 'summary_large_image', creator: X_HANDLE, title: socialTitle, description },
  };
}
