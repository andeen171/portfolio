// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
const colors = [
  'rosewater',
  'flamingo',
  'pink',
  'mauve',
  'red',
  'maroon',
  'peach',
  'yellow',
  'green',
  'teal',
  'sky',
  'sapphire',
  'blue',
  'lavender',
  'base',
  'mantle',
  'crust',
  'surface0',
  'surface1'
]

const safeList = ['ctp-mocha', 'ctp-macchiato', 'ctp-frappe', 'ctp-latte', 'animate-colorchange']
colors.map((color) => {
  safeList.push(`bg-ctp-${color}`)
  safeList.push(`text-ctp-${color}`)
})

/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./src/**/*.{js,ts,j1sx,tsx}'],
  theme: {
    extend: {
      animation: {
        colorchange: 'colorchange 5s ease infinite',
      },
      keyframes: {
        colorchange: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
      }
    }
  },
  safelist: safeList,
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('@catppuccin/tailwindcss')({
      prefix: 'ctp'
    }),
    require('@tailwindcss/line-clamp')
  ]
}

module.exports = config
