import { Translations, useTranslations } from '@/translations';
import { Menu, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  BriefcaseIcon,
  CodeBracketIcon,
  CommandLineIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Fragment, useEffect, useState } from 'react';
import LanguageSelector from './LanguageSelector';
import ThemeSelector from './ThemeSelector';

const getNavigation = (t: Translations) => [
  { name: t.navigation.home, href: '/', icon: HomeIcon },
  { name: t.navigation.skills, href: '/skills', icon: CommandLineIcon },
  { name: t.navigation.projects, href: '/projects', icon: CodeBracketIcon },
  { name: t.navigation.experiences, href: '/experiences', icon: BriefcaseIcon },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const t = useTranslations();
  const router = useRouter();
  const currentPath = router.pathname;
  const navigation = getNavigation(t);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={classNames(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300 w-full max-w-[100vw]',
        scrolled ? 'py-2 bg-ctp-base/80 backdrop-blur-lg shadow-lg' : 'py-4'
      )}
    >
      <div
        className={classNames(
          'container mx-auto px-3 sm:px-6 lg:px-8 rounded-xl transition-all duration-300'
        )}
      >
        <nav className="flex items-center justify-between" aria-label="Global">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="group flex items-center">
              <span className="text-xl sm:text-2xl md:text-3xl font-extrabold animated-gradient-text transition-transform duration-300 group-hover:scale-110">
                戦え Andeen
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-x-4 xl:gap-x-6">
            {navigation.map((item) => {
              const isActive =
                currentPath === item.href ||
                (item.href !== '/' && currentPath.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative flex items-center gap-1.5 px-0 py-1.5 rounded-md transition-all duration-300 font-medium group hover:bg-ctp-surface0/20 ${
                    isActive ? 'text-ctp-lavender ' : 'text-ctp-text hover:text-ctp-lavender '
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                  <span
                    className={classNames(
                      'absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-ctp-teal to-ctp-lavender transition-all duration-300 ',
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    )}
                  />
                </Link>
              );
            })}

            {/* Language and Theme Selectors - Desktop */}
            <div className="ml-2 xl:ml-4 flex items-center space-x-1 xl:space-x-2">
              <LanguageSelector />
              <ThemeSelector />
            </div>
          </div>

          {/* Mobile: Theme Selector and Navigation */}
          <div className="flex items-center gap-4 lg:hidden">
            {/* Language and Theme Selectors - Mobile */}
            <div className="flex items-center space-x-2">
              <LanguageSelector />
              <ThemeSelector />
            </div>

            {/* Mobile Navigation Dropdown */}
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button className="inline-flex items-center justify-center rounded-full p-2 text-ctp-text bg-ctp-base/50 hover:bg-ctp-mantle/50 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-ctp-lavender">
                  <span className="sr-only">Open main menu</span>
                  <Bars3Icon className="h-6 w-6 text-ctp-lavender" aria-hidden="true" />
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-150"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-42 origin-top-right rounded-xl bg-ctp-base/80 backdrop-blur-md shadow-xl ring-1 ring-ctp-overlay0/20 overflow-hidden focus:outline-none">
                  <div className="py-1">
                    {navigation.map((item) => {
                      const isActive =
                        currentPath === item.href ||
                        (item.href !== '/' && currentPath.startsWith(item.href));
                      const Icon = item.icon;

                      return (
                        <Menu.Item key={item.name}>
                          {({ active }) => (
                            <Link
                              href={item.href}
                              className={classNames(
                                active
                                  ? 'bg-ctp-overlay0/30 text-ctp-lavender'
                                  : isActive
                                    ? 'bg-ctp-surface0/50 text-ctp-lavender'
                                    : 'text-ctp-text',
                                'flex items-center gap-2 px-4 py-3 text-base font-medium nf transition-colors duration-200'
                              )}
                            >
                              <Icon
                                className={`h-5 w-5 ${
                                  isActive ? 'text-ctp-lavender' : 'text-ctp-subtext0'
                                }`}
                              />
                              {item.name}
                              {isActive && (
                                <span className="ml-auto h-2 w-2 rounded-full bg-ctp-lavender" />
                              )}
                            </Link>
                          )}
                        </Menu.Item>
                      );
                    })}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
