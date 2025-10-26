import { IntlProvider } from 'next-intl';
import type { AppProps } from 'next/app';

import '@/styles/globals.css';

type PageProps = {
  messages?: Record<string, unknown>;
  locale?: string;
};

const MyApp = ({ Component, pageProps }: AppProps<PageProps>) => {
  return (
    <IntlProvider messages={pageProps.messages} locale={pageProps.locale || 'en-US'}>
      <Component {...pageProps} />
    </IntlProvider>
  );
};

export default MyApp;
