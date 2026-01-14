// @ts-nocheck

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
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
      },
    },
  },
  plugins: [],
};

module.exports = config;
