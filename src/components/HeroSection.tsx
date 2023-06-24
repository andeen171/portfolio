import { useEffect, useRef } from 'react'
import Typed from 'typed.js'
import ProgrammingSVG from '~/components/SVG/ProgrammingSVG'
import BackgroudBlurSVG from './SVG/BackgroundBlurSVG'

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
    <div className="min-w-screen relative isolate flex min-h-screen flex-col items-center px-6 pt-12 md:flex-row lg:px-8">
      <div className="animated-gradient-text h-[35vh] w-full py-2 pl-12 pt-12 text-6xl sm:min-h-full lg:h-full lg:w-[50vw]">
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
