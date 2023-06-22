import { useEffect, useRef } from 'react'
import Typed from 'typed.js'
import ProgrammingSVG from '~/components/ProgrammingSVG'
import BackgroudBlurSVG from './BackgroundBlurSVG'

const HeroSection: React.FC = () => {
  const nameRef = useRef(null)

  useEffect(() => {
    const name = new Typed(nameRef.current, {
      strings: [
        'Anderson Ribeiro Lopes',
        'Anderson Ribeiro',
        'Anderson',
        'Anderson Lopes'
      ],
      typeSpeed: 50,
      backSpeed: 50,
      loop: true
    })

    return () => {
      name.destroy()
    }
  }, [])

  return (
    <div className="min-w-screen pt-12 relative isolate flex min-h-screen flex-col items-center px-6 md:flex-row lg:px-8">
      <div className="animated-gradient-text h-[35vh] lg:h-full pl-12 w-full lg:w-[50vw] py-2 pt-12 text-6xl sm:min-h-full">
        <span
          className="text-left text-6xl font-bold tracking-tight"
          ref={nameRef}
        ></span>
        <p className="text-left text-lg font-semibold">Full Stack Developer</p>
      </div>
      <div className="flex">
        <ProgrammingSVG />
      </div>
      <BackgroudBlurSVG />
    </div>
  )
}

export default HeroSection
