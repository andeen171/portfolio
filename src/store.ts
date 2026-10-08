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
        // Read before paint by the inline theme script in the locale layout;
        // keep the key and the `{ state: { flavor } }` shape in sync with it.
        name: 'ctp-store',
        // The server always renders mocha, so the stored flavor is applied
        // after hydration (Layout calls rehydrate) instead of at import time,
        // which would make the first client render disagree with the HTML.
        skipHydration: true,
      }
    )
  )
);

interface CommandPaletteState {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

/** Shared open state, so any trigger (header, footer, 404) can summon the palette. */
export const useCommandPalette = create<CommandPaletteState>()((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((state) => ({ open: !state.open })),
}));
