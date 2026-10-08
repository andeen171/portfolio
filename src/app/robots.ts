import type { MetadataRoute } from 'next';

const SITE = 'https://anderson-lopes.dev.br';

export default function robots(): MetadataRoute.Robots {
  return {
    // The embedded Sanity Studio is an editor, not content.
    rules: { userAgent: '*', allow: '/', disallow: '/studio' },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
