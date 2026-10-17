import Layout from '@/components/Layout';
import { getPathname, routing } from '@/i18n/routing';
import { alternatesFor, baseOpenGraph, X_HANDLE } from '@/lib/metadata';
import { SITE_URL, SOCIAL_IDS, SOCIALS } from '@/lib/social';
import { DEFAULT_FLAVOR, themeScript } from '@/lib/theme';
import '@/styles/globals.css';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';

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
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t('title'), template: t('titleTemplate') },
    description: t('description'),
    applicationName: t('siteName'),
    authors: [{ name: 'Anderson Ribeiro Lopes', url: SITE_URL }],
    creator: 'Anderson Ribeiro Lopes',
    // The home page's; sub-pages replace these with their own (lib/metadata).
    alternates: alternatesFor(locale, '/'),
    openGraph: {
      ...(await baseOpenGraph(locale)),
      title: t('title'),
      description: t('description'),
      url: getPathname({ locale, href: '/' }),
    },
    twitter: {
      card: 'summary_large_image',
      creator: X_HANDLE,
      title: t('title'),
      description: t('description'),
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: 'meta' });
  const home = new URL(getPathname({ locale, href: '/' }), SITE_URL).href;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/#person`,
        name: 'Anderson Ribeiro Lopes',
        alternateName: ['Anderson Lopes', 'Andeen'],
        url: home,
        jobTitle: t('jobTitle'),
        description: t('description'),
        sameAs: SOCIAL_IDS.map((id) => SOCIALS[id].url),
        knowsAbout: [
          'PHP',
          'Hyperf',
          'Go',
          'Rust',
          'TypeScript',
          'React',
          'Laravel',
          'Microservices',
          'Distributed transactions',
          'Payments',
          'Linux',
        ],
        homeLocation: {
          '@type': 'Place',
          name: 'Belo Horizonte, Brazil',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Belo Horizonte',
            addressRegion: 'MG',
            addressCountry: 'BR',
          },
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: home,
        name: t('siteName'),
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
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD built from constants and messages, with "<" escaped
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
        <NextIntlClientProvider messages={messages}>
          <Layout>{children}</Layout>
          <SpeedInsights />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
