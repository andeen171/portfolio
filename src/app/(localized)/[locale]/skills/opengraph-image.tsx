// The locale's share card, re-exported so this page's own openGraph/twitter
// metadata (lib/metadata pageMetadata) still carries it: a page that sets
// those objects replaces the parent's, images included.
export { alt, contentType, default, generateStaticParams, size } from '../opengraph-image';
