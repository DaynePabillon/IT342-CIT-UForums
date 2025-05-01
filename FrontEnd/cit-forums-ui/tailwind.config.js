/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        // New color palette
        'vista-blue': '#84A0D9',
        'american-yellow': '#F2B705',
        'orange-ryb': '#F29F05',
        'university-orange': '#F27405',
        'ferrari-red': '#F21B07',
        // Original colors (keeping for backward compatibility)
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
  // Important: This ensures our custom CSS has higher priority
  important: true,
};
