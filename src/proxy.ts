import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en-US', 'pt-BR'],
  defaultLocale: 'en-US',
  localePrefix: 'as-needed', // Only adds prefix for non-default locale
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
