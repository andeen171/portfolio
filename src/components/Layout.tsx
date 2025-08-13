import Footer from '@/components/Footer';
import Header from '@/components/Header';
import ShootingStars from '@/components/ShootingStars';
import StarsBackground from '@/components/StarsBackground';
import { useCtpStore } from '@/store';
import { type FlavorName } from '@catppuccin/palette';
import { type ReactNode, useEffect, useState } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const activeFlavor = useCtpStore((state) => state.flavor);
  const [flavor, setFlavor] = useState<FlavorName>('mocha');

  useEffect(() => {
    setFlavor(activeFlavor);
  }, [activeFlavor]);

  return (
    <main
      className={`ctp-${flavor} min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-ctp-base relative`}
    >
      {/* Background Stars */}
      <div className="fixed inset-0 z-0">
        <StarsBackground
          starDensity={0.00012}
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

      {/* Content */}
      <div className="relative z-10">
        <Header />
        {children}
        <Footer />
      </div>
    </main>
  );
};

export default Layout;
