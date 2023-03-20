import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export enum Flavor {
  latte = 'ctp-latte',
  frappe = 'ctp-frappe',
  macchiato = 'ctp-macchiato',
  mocha = 'ctp-mocha',
}

export const flavors: { [key in Flavor]: string } = {
  [Flavor.mocha]: 'Mocha',
  [Flavor.macchiato]: 'Macchiato',
  [Flavor.frappe]: 'Frappe',
  [Flavor.latte]: 'Latte'
}

interface CtpState {
  flavor: Flavor
  swapFlavor: (flavor: Flavor) => void
}

export const useCtpStore = create<CtpState>()(
  devtools(
    persist(
      (set) => ({
        flavor: Flavor.latte,
        swapFlavor: (flavor) => set(() => ({ flavor: flavor }))
      }),
      {
        name: 'ctp-flavor'
      }
    )
  )
)
