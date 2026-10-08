import type { MetadataRoute } from 'next';
import { getPathname, routing } from '@/i18n/routing';

const SITE = 'https://anderson-lopes.dev.br';
const PAGES = ['/', '/skills', '/projects', '/experiences'] as const;

type Locale = (typeof routing.locales)[number];

/** Absolute URL of a page in a locale, prefixed the way the router prefixes
 *  it (the default locale has none). */
const url = (href: string, locale: Locale) => `${SITE}${getPathname({ href, locale })}`;

/**
 * Every page in every locale, each listing its translations so search
 * engines serve the right language; `x-default` is the unprefixed URL.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.flatMap((href) => {
    const languages = {
      ...Object.fromEntries(routing.locales.map((locale) => [locale, url(href, locale)])),
      'x-default': url(href, routing.defaultLocale),
    };

    return routing.locales.map((locale) => ({
      url: url(href, locale),
      changeFrequency: 'monthly' as const,
      priority: href === '/' ? 1 : 0.8,
      alternates: { languages },
    }));
  });
}
