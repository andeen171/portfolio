import { cache } from 'react';
import { type AppLocale, type Profile, resolveProfile } from '@/lib/profile';
import { client } from '@/sanity/lib/client';
import { profileQuery } from '@/sanity/queries';

/**
 * The profile for a locale, on the server. Fetched once per request however
 * many components ask (React `cache`), and revalidated like the rest of the
 * site's content.
 */
export const getProfile = cache(async (locale: AppLocale): Promise<Profile> => {
  const raw = await client.fetch(profileQuery, {}, { next: { revalidate: 16800 } });
  return resolveProfile(raw, locale);
});
