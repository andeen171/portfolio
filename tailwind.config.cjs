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

const colorSafeList = ['ctp-mocha', 'ctp-macchiato', 'ctp-frappe', 'ctp-latte', 'animate-colorchange']
colors.map((color) => {
  colorSafeList.push(`bg-ctp-${color}`)
  colorSafeList.push(`text-ctp-${color}`)
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
  safelist: colorSafeList,
  plugins: [
    require('@catppuccin/tailwindcss')({
      prefix: 'ctp'
    })
  ]
}

module.exports = config
