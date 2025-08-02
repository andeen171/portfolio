import { Menu, Transition } from '@headlessui/react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Fragment, useEffect, useState } from 'react';
import ThemeSelector from './ThemeSelector';

const navigation = [
  { name: 'Home', href: '' },
  { name: 'About', href: 'about' },
  { name: 'Skills', href: 'skills' },
  { name: 'Projects', href: 'projects' },
  { name: 'Experiences', href: 'experiences' },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

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
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled ? 'py-2 bg-ctp-base/80 backdrop-blur-lg shadow-lg' : 'py-4'
      )}
    >
      <div
        className={classNames(
          'mx-auto px-4 sm:px-6 lg:px-8 rounded-xl transition-all duration-300'
        )}
      >
        <nav className="flex items-center justify-between" aria-label="Global">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="group flex items-center">
              <span className="text-3xl font-extrabold animated-gradient-text transition-transform duration-300 group-hover:scale-110">
                戦え
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="relative px-2 py-1 text-ctp-text hover:text-ctp-lavender transition-colors duration-300 font-medium group"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-ctp-teal to-ctp-lavender transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}

            {/* Theme Selector - Desktop */}
            <div className="ml-4 flex items-center">
              <ThemeSelector />
            </div>
          </div>

          {/* Mobile: Theme Selector and Navigation */}
          <div className="flex items-center gap-4 lg:hidden">
            {/* Theme Selector - Mobile */}
            <div className="flex items-center">
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
                    {navigation.map((item) => (
                      <Menu.Item key={item.name}>
                        {({ active }) => (
                          <Link
                            href={item.href}
                            className={classNames(
                              active ? 'bg-ctp-overlay0/30 text-ctp-lavender' : 'text-ctp-lavender',
                              'block px-4 py-3 text-base font-medium nf transition-colors duration-200'
                            )}
                          >
                            {item.name}
                          </Link>
                        )}
                      </Menu.Item>
                    ))}
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
