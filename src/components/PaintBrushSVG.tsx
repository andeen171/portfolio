import { useEffect, useState } from 'react'
import { useCtpStore } from '~/store'
import { variants } from '@catppuccin/palette'

const PaintBrushSVG: React.FC = () => {
  const flavor = useCtpStore((state) => state.flavor)
  const [labels, setLabels] = useState(variants[flavor])
  const [gradientId, setGradientId] = useState(
    Math.random().toString(36).substring(2, 15)
  )

  useEffect(() => {
    setLabels(variants[flavor])
    setGradientId(Math.random().toString(36).substring(2, 15))
  }, [flavor])

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={`url(#${gradientId})`}
      className="mr-3 h-4 w-4"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="200%" y2="0%">
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
      <path
        fillRule="evenodd"
        d="M20.599 1.5c-.376 0-.743.111-1.055.32l-5.08 3.385a18.747 18.747 0 00-3.471 2.987 10.04 10.04 0 014.815 4.815 18.748 18.748 0 002.987-3.472l3.386-5.079A1.902 1.902 0 0020.599 1.5zm-8.3 14.025a18.76 18.76 0 001.896-1.207 8.026 8.026 0 00-4.513-4.513A18.75 18.75 0 008.475 11.7l-.278.5a5.26 5.26 0 013.601 3.602l.502-.278zM6.75 13.5A3.75 3.75 0 003 17.25a1.5 1.5 0 01-1.601 1.497.75.75 0 00-.7 1.123 5.25 5.25 0 009.8-2.62 3.75 3.75 0 00-3.75-3.75z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export default PaintBrushSVG
