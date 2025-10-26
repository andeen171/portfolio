import { Listbox, Transition } from '@headlessui/react';
import { useRouter } from 'next/router';
import { useLocale } from 'next-intl';
import { Fragment } from 'react';
import CheckCircle from './SVG/CheckCircle';
import LanguageSVG from './SVG/LanguageSVG';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const languages: { code: string; label: string }[] = [
  { code: 'en-US', label: 'English' },
  { code: 'pt-BR', label: 'Português' },
];

const LanguageSelector: React.FC = () => {
  const router = useRouter();
  const locale = useLocale();

  const switchLanguage = (newLocale: string) => {
    router.push(router.pathname, router.asPath, { locale: newLocale });
  };

  return (
    <Listbox value={locale} onChange={switchLanguage}>
      {({ open }) => (
        <>
          <div className="relative">
            <Listbox.Button className="relative flex items-center w-auto cursor-default rounded-full bg-ctp-matle/40 backdrop-blur-sm p-2 md:px-3 text-left text-ctp-text shadow-sm ring-1 ring-inset ring-ctp-overlay0/20 hover:bg-ctp-mantle/60 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ctp-lavender">
              <span className="pointer-events-none flex items-center">
                <LanguageSVG />
              </span>
              <span
                className="animate-colorchange bg-gradient-to-r from-ctp-teal via-ctp-lavender bg-clip-text
                  text-sm font-semibold text-transparent nf md:mr-3 ml-2 hidden sm:inline-block"
              >
                {locale.toUpperCase()}
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute right-0 z-10 mt-2 max-h-56 w-full min-w-[160px] overflow-hidden rounded-xl bg-ctp-base/80 backdrop-blur-md text-base shadow-xl ring-1 ring-ctp-overlay0/20 transition-all focus:outline-none">
                {languages.map((lang) => (
                  <Listbox.Option
                    key={lang.code}
                    className={({ active }) =>
                      classNames(
                        active ? 'bg-ctp-base/30 text-ctp-text' : 'text-ctp-text',
                        'relative cursor-default select-none transition-colors duration-200'
                      )
                    }
                    value={lang.code}
                  >
                    <div className="flex items-center justify-between p-2 px-3">
                      <span className="flex items-center">
                        {locale === lang.code ? <CheckCircle /> : <LanguageSVG />}
                      </span>

                      <span
                        className="animate-colorchange bg-gradient-to-r from-ctp-teal via-ctp-lavender
                                                bg-clip-text font-semibold text-transparent nf ml-2 text-sm"
                      >
                        {lang.label}
                      </span>
                    </div>
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
};

export default LanguageSelector;
