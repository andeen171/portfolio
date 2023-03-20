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
  'lavender'
]

const colorSafeList = ['ctp-mocha', 'ctp-macchiato', 'ctp-frappe', 'ctp-latte']
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
        cursor: 'cursor .6s linear infinite alternate',
        type: 'type 1.8s ease-out .8s 1 normal both',
        'type-reverse': 'type 1.8s ease-out 0s infinite alternate-reverse both'
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
        type: {
          '0%': { width: '0ch' },
          '5%, 10%': { width: '1ch' },
          '15%, 20%': { width: '2ch' },
          '25%, 30%': { width: '3ch' },
          '35%, 40%': { width: '4ch' },
          '45%, 50%': { width: '5ch' },
          '55%, 60%': { width: '6ch' },
          '65%, 70%': { width: '7ch' },
          '75%, 80%': { width: '8ch' },
          '85%, 90%': { width: '9ch' },
          '95%': { width: '10ch' }
        }
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
