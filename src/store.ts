import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export enum Flavor {
  latte = 'ctp-latte',
  frappe = 'ctp-frappe',
  mocchiato = 'ctp=mocchiato',
  mocha = 'ctp-mocha',
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
