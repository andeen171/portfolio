import Footer from '@/components/Footer';
import Header from '@/components/Header';
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
    <main className={`ctp-${flavor} min-w-screen min-h-screen bg-ctp-base`}>
      <Header />
      {children}
      <Footer />
    </main>
  );
};

export default Layout;
