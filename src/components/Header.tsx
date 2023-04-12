import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import ThemeSelector from './ThemeSelector'
import { useCtpStore } from '../store';

const navigation = [
  { name: 'About', href: '#' },
  { name: 'Skills', href: '#' },
  { name: 'Projects', href: '#' },
  { name: 'Experiences', href: '#' }
]

const Header: React.FC = () => {
  const flavor = useCtpStore((state) => state.flavor)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav
        className="flex items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <div
          className="flex animate-colorchange bg-gradient-to-r from-ctp-teal 
          via-ctp-lavender bg-clip-text font-semibold text-transparent 
          first:rounded-t-lg first:from-ctp-lavender first:to-ctp-rosewater 
          last:rounded-b-lg lg:flex  lg:flex-1 lg:gap-x-12"
        >
          <span className="text-2xl font-extrabold">戦え</span>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-ctp-text"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div
          className="hidden animate-colorchange bg-gradient-to-r from-ctp-teal via-ctp-lavender bg-clip-text font-semibold 
          text-transparent first:rounded-t-lg first:from-ctp-lavender first:to-ctp-rosewater last:rounded-b-lg  lg:flex lg:gap-x-12"
        >
          {navigation.map((item) => (
            <a key={item.name} href={item.href}>
              {item.name}
            </a>
          ))}
        </div>
        <div className="mr-6 hidden lg:flex lg:flex-1 lg:justify-end">
          <ThemeSelector />
        </div>
      </nav>
      <Dialog
        as="div"
        className={`lg:hidden ctp-${flavor}`}
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className="fixed inset-0 z-50" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-ctp-base px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <div
              className="flex animate-colorchange bg-gradient-to-r from-ctp-teal 
          via-ctp-lavender bg-clip-text font-semibold text-transparent 
          first:rounded-t-lg first:from-ctp-lavender first:to-ctp-rosewater 
          last:rounded-b-lg lg:flex  lg:flex-1 lg:gap-x-12"
            >
              <span className="text-xl font-bold">戦え</span>
            </div>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-ctp-text"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="-mx-3 block rounded-lg py-2 px-3 text-base font-semibold leading-7 text-ctp-text hover:bg-gray-50"
                  >
                    {item.name}
                  </a>
                ))}
                <div className="-mx-3 block rounded-lg py-2 px-3 text-base font-semibold leading-7 text-ctp-text hover:bg-gray-50">
                  <ThemeSelector />
                </div>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  )
}

export default Header
