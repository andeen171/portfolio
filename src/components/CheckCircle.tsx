import { useEffect, useState } from 'react'
import { useCtpStore } from '~/store'
import { variants } from '@catppuccin/palette'

const CheckCircle: React.FC = () => {
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
        d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export default CheckCircle
