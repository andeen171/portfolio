import { variants } from '@catppuccin/palette'

type Props = {
  flavorLabel: keyof typeof variants
}

const AnimatedGradientSVG: React.FC<Props> = ({ flavorLabel }) => {
  const flavor = variants[flavorLabel]

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="url(#animated-gradient)"
      className="mr-3 h-5 w-5 transition-all"
    >
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
      <path
        fillRule="evenodd"
        d="M2.25 4.125c0-1.036.84-1.875 1.875-1.875h5.25c1.036 0 1.875.84 1.875 1.875V17.25a4.5 4.5 0 11-9 0V4.125zm4.5 14.25a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25z"
        clipRule="evenodd"
      />
      <path d="M10.719 21.75h9.156c1.036 0 1.875-.84 1.875-1.875v-5.25c0-1.036-.84-1.875-1.875-1.875h-.14l-8.742 8.743c-.09.089-.18.175-.274.257zM12.738 17.625l6.474-6.474a1.875 1.875 0 000-2.651L15.5 4.787a1.875 1.875 0 00-2.651 0l-.1.099V17.25c0 .126-.003.251-.01.375z" />
    </svg>
  )
}

export default AnimatedGradientSVG
