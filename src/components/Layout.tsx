import { type ReactNode, useState, useEffect } from 'react'
import { type Flavor, useCtpStore } from '~/store'
import Header from '~/components/Header'
import Footer from '~/components/Footer'

interface LayoutProps {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const activeFlavor = useCtpStore((state) => state.flavor)
  const [flavor, setFlavor] = useState<Flavor>('mocha')

  useEffect(() => {
    setFlavor(activeFlavor)
  }, [activeFlavor])

  return (
    <main className={`ctp-${flavor} min-w-screen min-h-screen bg-ctp-base`}>
      <Header />
      {children}
      <Footer />
    </main>
  )
}

export default Layout
