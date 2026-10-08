import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en-US', 'pt-BR'],
  defaultLocale: 'en-US',
  localePrefix: 'as-needed', // Only adds prefix for non-default locale
});

export const config = {
  // opengraph-image routes are served as-is: redirecting the default locale's
  // image (/en-US/… → /…) would hand crawlers a 307 instead of the PNG.
  matcher: ['/((?!api|_next|_vercel|studio|.*opengraph-image|.*\\..*).*)'],
};
