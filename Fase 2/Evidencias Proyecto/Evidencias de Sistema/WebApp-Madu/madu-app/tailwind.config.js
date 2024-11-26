/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js"
  ],
  darkMode: 'class', // Habilita el modo oscuro (no funciona)
  theme: {
    screens: {
      'xs': '475px',
      ...defaultTheme.screens,
    },
    extend: {
      backdropBlur: {
        xs: '2px',
      }
      // colors: {
      //   primary: {
      //     DEFAULT: '#5A4FCF',
      //     dark: '#4B0082',
      //     light: '#8A8EF2',
      //   },
      //   accent: {
      //     lavender: '#C2AFFF',
      //     emerald: '#4CAF50',
      //     gold: '#FFC107',
      //   },
      //   background: {
      //     light: '#F5F7FA',
      //     dark: '#1A1A1A',
      //   }
      // },
      // fontFamily: {
      //   sans: ['Inter', 'sans-serif'],
      // },
      // spacing: {
      //   '128': '32rem',
      //   '144': '36rem',
      // },
      // borderRadius: {
      //   '4xl': '2rem',
      // },
    },
    
  },

  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('tailwindcss-animated'),
    require('flowbite/plugin')
  ],
}


