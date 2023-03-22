import { useEffect, useState } from 'react'
import { useCtpStore } from '~/store'
import { variants } from '@catppuccin/palette'

type Props = {
  id: string
}

const CatppuccinGradient: React.FC<Props> = ({ id }) => {
  const flavor = useCtpStore((state) => state.flavor)
  const [labels, setLabels] = useState(variants.mocha)

  useEffect(() => {
    setLabels(variants[flavor])
  }, [flavor])
  return (
    <linearGradient id={id} x1="0%" y1="0%" x2="200%" y2="0%">
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
  )
}

export default CatppuccinGradient
