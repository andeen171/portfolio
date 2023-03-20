import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { variants } from '@catppuccin/palette'
import type { Labels, Color, AlphaColor } from '@catppuccin/palette'

export type Flavor = 'latte' | 'frappe' | 'macchiato' | 'mocha'

export type FlavorLabels = Labels<Color, AlphaColor>

interface CtpState {
  flavor: Flavor
  swapFlavor: (flavor: Flavor) => void,
  getLabels: () => FlavorLabels
}

function getFlavorLabels(Flavor: Flavor): Labels<Color, AlphaColor> {
  return variants[Flavor]
}

export const useCtpStore = create<CtpState>()(
  devtools(
    persist(
      (set, get) => ({
        flavor: 'latte',
        swapFlavor: (flavor) => set(() => ({ flavor: flavor })),
        getLabels: () => getFlavorLabels(get().flavor)
      }),
      {
        name: 'ctp-store'
      }
    )
  )
)
