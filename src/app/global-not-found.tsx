import '@/styles/globals.css';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import NotFound from '@/app/(localized)/[locale]/not-found';
import Layout from '@/components/Layout';
import { DEFAULT_FLAVOR, themeScript } from '@/lib/theme';

/*
  Every URL that matches no page lands here, and Next answers it with a real
  404 status and this document fully server-rendered. A notFound() thrown
  inside [locale] can't do both: the locale layout is a root layout, so Next
  either fails the HTML shell (a 404 whose body is empty until JS runs) or,
  inside Suspense, has already sent a 200.

  The locale is the one the proxy resolved for the request (/pt-BR/… → pt-BR);
  paths the proxy skips, such as /apple-touch-icon.png, fall back to the
  default. Noindex is added by Next for the 404 status, and there's no
  canonical, hreflang or og:url: a missing page has no URL to claim.
*/

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'notFound' });
  const meta = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: meta('titleTemplate').replace('%s', t('title')),
    description: t('description'),
  };
}

export default async function GlobalNotFound() {
  const locale = await getLocale();
  const messages = await getMessages();

  // The same document shell as [locale]/layout.tsx, minus the JSON-LD.
  return (
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
        <NextIntlClientProvider messages={messages}>
          <Layout>
            <NotFound />
          </Layout>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
