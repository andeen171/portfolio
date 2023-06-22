import { Fragment, useEffect, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { type Flavor, useCtpStore } from '~/store'
import PaletteSVG from './PaletteSVG'
import PaintBrushSVG from './PaintBrushSVG'
import CheckCircle from './CheckCircle'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

const flavors: Flavor[] = ['latte', 'frappe', 'macchiato', 'mocha']

const ThemeSelector: React.FC = () => {
  const activeFlavor = useCtpStore((state) => state.flavor)
  const [selected, setSelected] = useState<Flavor>('latte')

  const swapFlavor = useCtpStore((state) => state.swapFlavor)

  useEffect(() => {
    setSelected(activeFlavor)
  }, [activeFlavor])

  return (
    <Listbox value={activeFlavor} onChange={swapFlavor}>
      {({ open }) => (
        <>
          <div className="relative">
            <Listbox.Button className="relative w-80 lg:w-40 cursor-default rounded-md bg-ctp-mantle p-2 text-left text-ctp-text shadow-sm ring-1 ring-inset ring-ctp-mantle focus:outline-none focus:ring-2 focus:ring-ctp-lavender sm:text-sm sm:leading-6">
              <span className="pointer-events-none  flex items-center pr-2">
                <PaletteSVG />
                <span
                  className="animate-colorchange bg-gradient-to-r
            from-ctp-teal via-ctp-lavender  bg-clip-text
            text-lg font-semibold text-transparent"
                >
                  {selected.charAt(0).toUpperCase() + selected.slice(1)}
                </span>
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-2 max-h-56 w-full overflow-auto rounded-lg text-base shadow-lg transition-all focus:outline-none sm:text-sm">
                {flavors.map((flavor) => (
                  <Listbox.Option
                    key={flavor}
                    className={({ active }) =>
                      classNames(
                        active
                          ? `bg-ctp-base text-ctp-text`
                          : 'bg-ctp-mantle text-ctp-text',
                        `ctp-${flavor} frist:via-ctp-mauve animate-text relative cursor-default select-none`
                      )
                    }
                    value={flavor}
                  >
                    <div className="flex items-center p-2 pl-3 text-lg">
                      {activeFlavor === flavor ? (
                        <CheckCircle />
                      ) : (
                        <PaintBrushSVG />
                      )}

                      <span
                        className="animate-colorchange bg-gradient-to-r from-ctp-teal via-ctp-lavender
                        bg-clip-text font-semibold text-transparent first:rounded-t-lg first:from-ctp-lavender  first:to-ctp-rosewater last:rounded-b-lg"
                      >
                        {flavor.charAt(0).toUpperCase() + flavor.slice(1)}
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
  )
}

export default ThemeSelector
