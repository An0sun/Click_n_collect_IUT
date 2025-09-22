/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
     "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      colors: {
        brown: {
          50:  '#fdf8f6',
          100: '#f5eae6',
          200: '#e6cfc3',
          300: '#d4a38f',
          400: '#b87558',
          500: '#9c5336', 
          600: '#7a3f2a',
          700: '#5a2e20',
          800: '#422419',
          900: '#2c1810',
        },
      },
    },
  },
  plugins: [],
}

