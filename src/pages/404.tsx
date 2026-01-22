import type { GetStaticProps } from 'next';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import Layout from '@/components/Layout';

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../messages/${locale || 'en-US'}.json`)).default,
      locale: locale || 'en-US',
    },
  };
};

export default function Custom404() {
  const t = useTranslations('navigation');
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-ctp-text">
        <h1 className="text-6xl font-bold animated-gradient-text mb-4">404</h1>
        <p className="text-xl mb-8">Page Not Found</p>
        <Link
          href="/"
          className="px-6 py-2 bg-ctp-lavender text-ctp-base rounded-full font-semibold hover:bg-ctp-teal transition-colors"
        >
          {t('home')}
        </Link>
      </div>
    </Layout>
  );
}
