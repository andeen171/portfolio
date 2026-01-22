import { SpeedInsights } from '@vercel/speed-insights/next';
import type { AppProps } from 'next/app';
import { IntlProvider } from 'next-intl';

import '@/styles/globals.css';

type PageProps = {
  messages?: Record<string, unknown>;
  locale?: string;
};

const MyApp = ({ Component, pageProps }: AppProps<PageProps>) => {
  return (
    <IntlProvider
      messages={pageProps.messages || {}}
      locale={pageProps.locale || 'en-US'}
      onError={(error) => {
        if (error.code !== 'MISSING_MESSAGE') {
          console.error(error);
        }
      }}
    >
      <Component {...pageProps} />
      <SpeedInsights />
    </IntlProvider>
  );
};

export default MyApp;
