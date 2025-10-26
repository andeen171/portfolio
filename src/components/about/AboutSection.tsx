import ProfilePic from '@/img/icon.png';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import Typed from 'typed.js';

const AboutSection: React.FC = () => {
  const t = useTranslations('about');
  const titleRef = useRef(null);

  useEffect(() => {
    const name = new Typed(titleRef.current, {
      strings: [
        t('typedStrings.fullstack'),
        t('typedStrings.backend'),
        t('typedStrings.linux'),
        t('typedStrings.arch'),
      ],
      typeSpeed: 70,
      backSpeed: 70,
      loop: true,
    });

    return () => {
      name.destroy();
    };
  });
  return (
    <div className="relative isolate overflow-hidden px-4 py-8 sm:px-6 lg:overflow-visible lg:px-0">
      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:gap-x-8 sm:gap-y-12 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-start lg:gap-y-10">
        <div className="lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
          <div className="px-2 sm:px-4 lg:pr-4">
            <div className="animated-gradient-text text-3xl sm:text-4xl lg:max-w-lg">
              <p className="text-base sm:text-lg font-semibold leading-7 text-ctp-lavender">
                {t('greeting')}
              </p>
              <span
                ref={titleRef}
                className="nf mt-2 min-h-[3rem] text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight"
              />
              <p className="mt-4 sm:mt-8 text-lg sm:text-xl leading-7 sm:leading-8 text-ctp-subtext0">
                {t('description')}
              </p>
            </div>
          </div>
        </div>
        <div className="mx-auto p-4 sm:p-6 lg:sticky lg:top-4 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:overflow-hidden">
          <Image
            className="w-full max-w-sm sm:max-w-md md:max-w-lg rounded-xl bg-ctp-mantle shadow-xl ring-2 sm:ring-4 ring-ctp-overlay0"
            src={ProfilePic}
            placeholder="blur"
            alt="Me, Myself and I"
          />
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
