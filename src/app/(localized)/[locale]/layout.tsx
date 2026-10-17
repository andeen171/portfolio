import Layout from '@/components/Layout';
import { ProfileProvider } from '@/components/ProfileProvider';
import { getPathname, routing } from '@/i18n/routing';
import { getProfile } from '@/lib/getProfile';
import { alternatesFor, baseOpenGraph, titleTemplate } from '@/lib/metadata';
import { xHandle } from '@/lib/profile';
import { SITE_URL } from '@/lib/social';
import { DEFAULT_FLAVOR, themeScript } from '@/lib/theme';
import '@/styles/globals.css';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Any other first segment is not a locale. The proxy skips dotted paths, so
// /apple-touch-icon.png would otherwise reach this layout as a "locale", whose
// notFound() has no boundary above a root layout and turns into a bare 500;
// unmatched, it gets app/global-not-found.tsx and a 404 instead.
export const dynamicParams = false;

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const profile = await getProfile(locale);
  // "Anderson Lopes · Full-stack developer", or whichever half exists.
  const title = [profile.shortName, profile.jobTitle].filter(Boolean).join(' · ');
  const description = profile.seoDescription || undefined;

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: titleTemplate(profile) },
    description,
    applicationName: profile.shortName || undefined,
    authors: profile.fullName ? [{ name: profile.fullName, url: SITE_URL }] : undefined,
    creator: profile.fullName || undefined,
    // The home page's; sub-pages replace these with their own (lib/metadata).
    alternates: alternatesFor(locale, '/'),
    openGraph: {
      ...baseOpenGraph(locale, profile),
      title,
      description,
      url: getPathname({ locale, href: '/' }),
    },
    twitter: {
      card: 'summary_large_image',
      creator: xHandle(profile),
      title,
      description,
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const [messages, profile] = await Promise.all([getMessages(), getProfile(locale)]);
  const home = new URL(getPathname({ locale, href: '/' }), SITE_URL).href;
  const { location } = profile;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/#person`,
        name: profile.fullName,
        alternateName: [...new Set([profile.shortName, profile.nickname].filter(Boolean))].filter(
          (name) => name !== profile.fullName
        ),
        url: home,
        jobTitle: profile.jobTitle || undefined,
        description: profile.seoDescription || undefined,
        sameAs: profile.socials.map((social) => social.url),
        knowsAbout: profile.knowsAbout,
        homeLocation: location.city
          ? {
              '@type': 'Place',
              name: location.label || location.city,
              address: {
                '@type': 'PostalAddress',
                addressLocality: location.city,
                addressRegion: location.region || undefined,
                addressCountry: location.countryCode || undefined,
              },
            }
          : undefined,
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: home,
        name: profile.shortName,
        inLanguage: locale,
        author: { '@id': `${SITE_URL}/#person` },
      },
    ],
  };

  return (
    // The flavor class is the server's default; the inline script swaps in the
    // stored one before first paint, hence suppressHydrationWarning.
    <html
      lang={locale}
      className={DEFAULT_FLAVOR}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: a fixed, build-time string (lib/theme) that must run before paint */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD built from the Sanity profile, with "<" escaped
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
        <NextIntlClientProvider messages={messages}>
          <ProfileProvider profile={profile}>
            <Layout>{children}</Layout>
          </ProfileProvider>
          <SpeedInsights />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
