import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import ThemeSelector from './ThemeSelector'
import { useCtpStore } from '../store'
import Link from 'next/link'

const navigation = [
  { name: 'About', href: 'about' },
  { name: 'Skills', href: 'skills' },
  { name: 'Projects', href: 'projects' },
  { name: 'Experiences', href: 'experiences' }
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
          <Link href="/" className="text-2xl font-extrabold">
            戦え
          </Link>
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
          {navigation.map((item, index) => (
            <Link key={index} href={item.href}>
              {item.name}
            </Link>
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
        <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-ctp-base px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <div
              className="flex animate-colorchange rounded-lg bg-gradient-to-r
                from-ctp-teal via-ctp-lavender to-ctp-rosewater bg-clip-text
                font-semibold text-transparent lg:flex  lg:flex-1 lg:gap-x-12"
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
            <div className="-my-6">
              <div
                className="animate-colorchange space-y-2 bg-gradient-to-r from-ctp-teal via-ctp-lavender bg-clip-text py-6
                font-semibold text-transparent first:rounded-t-lg first:from-ctp-lavender first:to-ctp-rosewater last:rounded-b-lg"
              >
                {navigation.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="-mx-3 block px-3 py-2 text-base font-semibold"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="-mx-3 block py-2">
                <ThemeSelector />
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  )
}

export default Header
