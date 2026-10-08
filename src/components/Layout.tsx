'use client';

import { useTranslations } from 'next-intl';
import { type ReactNode, useEffect } from 'react';
import CommandPalette from '@/components/CommandPalette';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import ShootingStars from '@/components/ShootingStars';
import StarsBackground from '@/components/StarsBackground';
import { applyFlavor } from '@/lib/theme';
import { useCtpStore } from '@/store';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const t = useTranslations('navigation');

  // The store owns the flavor; the document follows it. The inline script in
  // the layout already painted the stored flavor, so this only has to track
  // changes: rehydrating (now that hydration is done) and every swap after.
  useEffect(() => {
    const unsubscribe = useCtpStore.subscribe((state, previous) => {
      if (state.flavor !== previous.flavor) applyFlavor(state.flavor);
    });
    void useCtpStore.persist.rehydrate();
    return unsubscribe;
  }, []);

  return (
    <div className="relative min-h-screen w-full max-w-[100vw] overflow-x-clip bg-ctp-base">
      <a
        href="#main-content"
        className="fixed top-3 left-3 z-110 -translate-y-24 rounded-full bg-ctp-mantle px-4 py-2 font-nf text-sm text-ctp-text shadow-lg ring-2 ring-ctp-lavender transition-transform focus:translate-y-0 focus-visible:outline-none motion-reduce:transition-none"
      >
        {t('skipToContent')}
      </a>

      {/* The night sky */}
      <div aria-hidden="true" className="night-sky pointer-events-none fixed inset-0 z-0">
        <StarsBackground
          starDensity={0.00015}
          allStarsTwinkle={true}
          twinkleProbability={0.7}
          minTwinkleSpeed={1.2}
          maxTwinkleSpeed={3.0}
        />
        <ShootingStars
          minSpeed={8}
          maxSpeed={25}
          minDelay={2000}
          maxDelay={6000}
          starWidth={12}
          starHeight={2}
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />
        <main id="main-content" tabIndex={-1} className="flex-1">
          {children}
        </main>
        <Footer />
      </div>

      <CommandPalette />
    </div>
  );
};

export default Layout;
