'use client';

import type { FlavorName } from '@catppuccin/palette';
import { Listbox, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { useCtpStore } from '@/store';
import CheckCircle from './SVG/CheckCircle';
import PaintBrushSVG from './SVG/PaintBrushSVG';
import PaletteSVG from './SVG/PaletteSVG';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const flavors: FlavorName[] = ['latte', 'frappe', 'macchiato', 'mocha'];

const ThemeSelector: React.FC = () => {
  const activeFlavor = useCtpStore((state) => state.flavor);
  const [selected, setSelected] = useState<FlavorName>(activeFlavor);

  const swapFlavor = useCtpStore((state) => state.swapFlavor);

  useEffect(() => {
    setSelected(activeFlavor);
  }, [activeFlavor]);

  return (
    <Listbox value={activeFlavor} onChange={swapFlavor}>
      {({ open }) => (
        <>
          <div className="relative">
            <Listbox.Button className="relative flex items-center justify-between w-auto sm:min-w-[120px] cursor-default rounded-full bg-ctp-matle/40 backdrop-blur-sm p-2 sm:px-3 text-left text-ctp-text shadow-sm ring-1 ring-inset ring-ctp-overlay0/20 hover:bg-ctp-mantle/60 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ctp-lavender">
              <span className="pointer-events-none flex items-center">
                <PaletteSVG />
              </span>
              <span
                className="animate-colorchange bg-gradient-to-r from-ctp-teal via-ctp-lavender bg-clip-text
                  text-sm font-semibold text-transparent nf sm:mr-4 hidden sm:inline-block"
              >
                {selected.charAt(0).toUpperCase() + selected.slice(1)}
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
                {flavors.map((flavor) => (
                  <Listbox.Option
                    key={flavor}
                    className={({ active }) =>
                      classNames(
                        active ? 'bg-ctp-base/30 text-ctp-text' : 'text-ctp-text',
                        'relative cursor-default select-none transition-colors duration-200'
                      )
                    }
                    value={flavor}
                  >
                    <div className="flex items-center justify-between p-2 px-3">
                      <span className="flex items-center">
                        {activeFlavor === flavor ? <CheckCircle /> : <PaintBrushSVG />}
                      </span>

                      <span
                        className="animate-colorchange bg-gradient-to-r from-ctp-teal via-ctp-lavender
                                                bg-clip-text font-semibold text-transparent nf ml-2 text-sm"
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
  );
};

export default ThemeSelector;
