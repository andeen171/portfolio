import { type CatppuccinColors, type FlavorName, flavors } from '@catppuccin/palette';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface CtpState {
  flavor: FlavorName;
  swapFlavor: (flavor: FlavorName) => void;
  getLabels: () => CatppuccinColors;
}

function getFlavorLabels(Flavor: FlavorName): CatppuccinColors {
  return flavors[Flavor].colors;
}

export const useCtpStore = create<CtpState>()(
  devtools(
    persist(
      (set, get) => ({
        flavor: 'mocha',
        swapFlavor: (flavor) => set(() => ({ flavor: flavor })),
        getLabels: () => getFlavorLabels(get().flavor),
      }),
      {
        name: 'ctp-store',
      }
    )
  )
);
