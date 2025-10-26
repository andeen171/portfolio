import ProgrammingSVG from '@/components/SVG/ProgrammingSVG';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import Typed from 'typed.js';
import BackgroundBlurSVG from './SVG/BackgroundBlurSVG';

const HeroSection: React.FC = () => {
  const t = useTranslations('home.hero');
  const nameRef = useRef(null);

  useEffect(() => {
    const name = new Typed(nameRef.current, {
      strings: ['Anderson Ribeiro Lopes', 'Anderson Ribeiro', 'Anderson', 'Anderson Lopes'],
      typeSpeed: 30,
      backSpeed: 50,
      loop: true,
    });

    return () => {
      name.destroy();
    };
  }, []);

  return (
    <div className="min-w-screen relative isolate flex min-h-[80vh] md:min-h-screen flex-col justify-center items-center px-4 pt-16 sm:px-6 lg:flex-row md:pt-8 lg:px-8">
      {/* SVG first in mobile, reordered in md screens */}
      <div className="flex w-full max-w-md mb-8 order-first md:order-last md:mb-0 md:mt-0 md:max-w-lg lg:max-w-none lg:w-[50vw]">
        <ProgrammingSVG />
      </div>
      {/* Text below SVG in mobile, side by side in md screens */}
      <div className="animated-gradient-text w-full sm:pl-8 md:pl-12 md:pt-12 lg:h-full lg:w-[50vw] text-4xl sm:text-5xl md:text-6xl">
        <span
          className="text-left text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight"
          ref={nameRef}
        />
        <p className="text-left text-base sm:text-lg font-semibold">{t('subtitle')}</p>
      </div>
      <BackgroundBlurSVG />
    </div>
  );
};

export default HeroSection;
