import { useEffect, useRef, useState } from 'react'
import Typed from 'typed.js'
import ProgrammingSVG from './ProgrammingSVG'
import { useCtpStore } from '../store'
import { variants } from '@catppuccin/palette'

const HeroSection: React.FC = () => {
  const flavor = useCtpStore((state) => state.flavor)
  const [labels, setLabels] = useState(variants[flavor])
  const phraseRef = useRef(null)
  const nameRef = useRef(null)

  useEffect(() => {
    setLabels(variants[flavor])
  }, [flavor])

  useEffect(() => {
    // const phrase = new Typed(phraseRef.current, {
    //   strings: [
    //     'Ambition without effort is merely greed',
    //     'Make money and stay alive'
    //   ],
    //   typeSpeed: 50,
    //   backSpeed: 50,
    //   loop: true
    // })

    const name = new Typed(nameRef.current, {
      strings: ['Anderson Ribeiro Lopes'],
      typeSpeed: 50
    })

    return () => {
      // Destroy Typed instance during cleanup to stop animation
      // phrase.destroy()
      name.destroy()
    }
  }, [])

  return (
    <div className="relative isolate min-h-screen px-6 pt-14 lg:px-8">
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <svg
          className="relative left-[calc(50%-11rem)] -z-10 h-[21.1875rem] max-w-none -translate-x-1/2 rotate-[30deg] sm:left-[calc(50%-30rem)] sm:h-[42.375rem]"
          viewBox="0 0 1155 678"
        >
          <path
            fill="url(#animated-gradient)"
            fillOpacity=".3"
            d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
          />
          <defs>
            <linearGradient
              id="animated-gradient"
              x1="0%"
              y1="0%"
              x2="200%"
              y2="0%"
            >
              <stop offset="0%" stopColor={labels.teal.hex}>
                <animate
                  attributeName="stop-color"
                  values={`${labels.teal.hex};${labels.lavender.hex};${labels.teal.hex}`}
                  dur="5s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="50%" stopColor={labels.lavender.hex}>
                <animate
                  attributeName="stop-color"
                  values={`${labels.lavender.hex};${labels.mauve.hex};${labels.lavender.hex}`}
                  dur="5s"
                  repeatCount="indefinite"
                />
              </stop>
              <animate
                attributeName="x2"
                from="200%"
                to="0%"
                dur="5s"
                repeatCount="indefinite"
              />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="min-w-screen flex flex-col p-12 md:flex-row">
        <div className="min-w-96 animate-colorchange bg-gradient-to-r from-ctp-teal via-ctp-lavender bg-clip-text py-2 pt-12 text-transparent">
          <span
            className="text-left text-6xl font-bold tracking-tight"
            ref={nameRef}
          ></span>
        </div>
        <div className="flex">
          <ProgrammingSVG />
        </div>
      </div>
      {/* <div className="flex pl-8 pb-8">
        <div className="max-w-6xl py-2">
          <div className="animate-colorchange bg-gradient-to-r from-ctp-teal via-ctp-lavender bg-clip-text py-2 text-transparent">
            <span
              className="text-6xl font-bold tracking-tight"
              ref={phraseRef}
            ></span>
          </div>
          <div>
            <div className="mt-10 flex items-center gap-x-6">
              <a
                href="#"
                className=" animate-colorchange rounded-lg bg-gradient-to-r from-ctp-teal via-ctp-lavender to-ctp-mauve 
              px-3.5 py-2.5 text-center text-sm font-semibold text-ctp-base shadow-sm"
              >
                Get started
              </a>
              <a
                href="#"
                className="animate-colorchange bg-gradient-to-r from-ctp-teal via-ctp-lavender to-ctp-mauve bg-clip-text text-center text-sm 
          font-semibold leading-6 text-transparent"
              >
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div> */}
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
        <svg
          className="relative left-[calc(50%+3rem)] h-[21.1875rem] max-w-none -translate-x-1/2 sm:left-[calc(50%+36rem)] sm:h-[42.375rem]"
          viewBox="0 0 1155 678"
        >
          <path
            fill="url(#animated-gradient)"
            fillOpacity=".3"
            d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
          />
          <defs>
            <linearGradient
              id="animated-gradient"
              x1="0%"
              y1="0%"
              x2="200%"
              y2="0%"
            >
              <stop offset="0%" stopColor={labels.teal.hex}>
                <animate
                  attributeName="stop-color"
                  values={`${labels.teal.hex};${labels.lavender.hex};${labels.teal.hex}`}
                  dur="5s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="50%" stopColor={labels.lavender.hex}>
                <animate
                  attributeName="stop-color"
                  values={`${labels.lavender.hex};${labels.mauve.hex};${labels.lavender.hex}`}
                  dur="5s"
                  repeatCount="indefinite"
                />
              </stop>
              <animate
                attributeName="x2"
                from="200%"
                to="0%"
                dur="5s"
                repeatCount="indefinite"
              />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  )
}

export default HeroSection
