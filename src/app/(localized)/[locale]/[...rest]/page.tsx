import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import NotFound from '../not-found';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'notFound' });
  // Next adds the noindex itself once notFound() is thrown.
  return { title: t('title') };
}

function Missing(): never {
  notFound();
}

/*
  Unknown paths only reach not-found.tsx through notFound() inside a segment;
  without this catch-all they'd get Next's bare, unlocalized 404.

  The Suspense boundary is what keeps the page server-rendered: a notFound()
  outside one fails the whole HTML shell, and Next then ships an empty
  document that only paints once JS renders it (a white flash, nothing
  without JS). Inside one, the layout streams as usual, the fallback is the
  very same 404 view, and on the client the boundary rethrows into
  not-found.tsx. The trade-off: the response is a 200 carrying noindex.
*/
export default function CatchAllPage() {
  return (
    <Suspense fallback={<NotFound />}>
      <Missing />
    </Suspense>
  );
}
