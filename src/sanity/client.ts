import { env } from '@/env.mjs';
import { createClient } from 'next-sanity';

export const client = createClient({
  projectId: env.SANITY_PROJECT_ID,
  dataset: env.SANITY_DATASET,
  apiVersion: env.SANITY_API_VERSION,
  useCdn: false,
});
