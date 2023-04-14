import { useEffect, useRef } from 'react'
import Typed from 'typed.js'
import ProgrammingSVG from '~/components/ProgrammingSVG'

const HeroSection: React.FC = () => {
  const nameRef = useRef(null)

  useEffect(() => {
    const name = new Typed(nameRef.current, {
      strings: ['Anderson Ribeiro Lopes', 'Anderson Ribeiro', 'Anderson Lopes'],
      typeSpeed: 50,
      backSpeed: 50
    })

    return () => {
      name.destroy()
    }
  }, [])

  return (
    <div className="min-w-screen relative isolate flex min-h-screen flex-col items-center p-2 px-6 pt-14 md:flex-row md:p-12 lg:px-8">
      <div className="animated-gradient-text min-h-7xl w-full py-2 pt-12 text-6xl sm:min-h-full">
        <span
          className="text-left text-6xl font-bold tracking-tight"
          ref={nameRef}
        ></span>
        <p className="text-left text-lg font-semibold">Full Stack Developer</p>
      </div>
      <div className="flex">
        <ProgrammingSVG />
      </div>
    </div>
  )
}

export default HeroSection
