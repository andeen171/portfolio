/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/forms"),
    require('@catppuccin/tailwindcss')({
      prefix: 'ctp',
    }),
  ],
};

module.exports = config;
