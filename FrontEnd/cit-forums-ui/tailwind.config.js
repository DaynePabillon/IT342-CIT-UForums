/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          500: '#800000',
          600: '#6B0000',
          700: '#570000',
          800: '#430000',
          900: '#2F0000',
        },
        gold: {
          400: '#FFD700',
          500: '#FFC000',
          600: '#E6AF00',
          700: '#CC9900',
        },
      },
    },
  },
  plugins: [],
};
