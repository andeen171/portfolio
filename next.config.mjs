// @ts-check

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import('./src/env.mjs'));

import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  // Unknown URLs render app/global-not-found.tsx with a real 404. The app has
  // no single root layout ([locale] and studio are each one), so a not-found
  // file inside [locale] can't answer for paths that never reach a page.
  experimental: {
    globalNotFound: true,
  },

  images: {
    remotePatterns: [
      // Sanity's image CDN: the profile photo.
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};
export default withNextIntl(config);
