import Layout from '@/components/Layout';
import { routing } from '@/i18n/routing';
import '@/styles/globals.css';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: 'Anderson Ribeiro Lopes',
  description: "Anderson's Portfolio",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Layout>{children}</Layout>
          <SpeedInsights />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
