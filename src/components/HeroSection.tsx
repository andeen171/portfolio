import { useEffect, useRef } from 'react'
import { variants } from '@catppuccin/palette'
import Typed from 'typed.js'

type Props = {
  flavorLabel: keyof typeof variants
}

const HeroSection: React.FC<Props> = ({ flavorLabel }) => {
  const flavor = variants[flavorLabel]
  const el = useRef(null)

  useEffect(() => {
    const typed = new Typed(el.current, {
      strings: ['Ambition without effort is merely greed'],
      typeSpeed: 50
    })

    return () => {
      // Destroy Typed instance during cleanup to stop animation
      typed.destroy()
    }
  }, [])
  return (
    <div className="relative isolate px-6 pt-14 lg:px-8">
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
              <stop offset="0%" stopColor={flavor.teal.hex}>
                <animate
                  attributeName="stop-color"
                  values={`${flavor.teal.hex};${flavor.lavender.hex};${flavor.teal.hex}`}
                  dur="5s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="50%" stopColor={flavor.lavender.hex}>
                <animate
                  attributeName="stop-color"
                  values={`${flavor.lavender.hex};${flavor.mauve.hex};${flavor.lavender.hex}`}
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
      <div className="mx-auto max-w-4xl py-32 flex flex-col">
        <div className="animate-colorchange bg-gradient-to-r from-ctp-teal via-ctp-lavender bg-clip-text py-2 text-transparent">
          <span className="text-4xl font-bold tracking-tight" ref={el}></span>
        </div>
        <div>
          <p className="mt-6 text-lg leading-8 text-ctp-subtext0">
            Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui
            lorem cupidatat commodo. Elit sunt amet fugiat veniam occaecat
            fugiat aliqua.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
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
              <stop offset="0%" stopColor={flavor.teal.hex}>
                <animate
                  attributeName="stop-color"
                  values={`${flavor.teal.hex};${flavor.lavender.hex};${flavor.teal.hex}`}
                  dur="5s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="50%" stopColor={flavor.lavender.hex}>
                <animate
                  attributeName="stop-color"
                  values={`${flavor.lavender.hex};${flavor.mauve.hex};${flavor.lavender.hex}`}
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
