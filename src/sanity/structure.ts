import type { StructureResolver } from 'sanity/structure';
import { PROFILE_ID } from '@/sanity/schemaTypes/profile';

/** Document types that exist once, opened directly rather than listed. */
export const SINGLETON_TYPES = new Set(['profile']);

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Profile')
        .id(PROFILE_ID)
        .child(S.document().schemaType('profile').documentId(PROFILE_ID).title('Profile')),
      S.divider(),
      ...S.documentTypeListItems().filter((item) => !SINGLETON_TYPES.has(item.getId() ?? '')),
    ]);
