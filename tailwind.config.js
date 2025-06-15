/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/prototype.html', './src/index.ejs', './src/script.js'],
  theme: {
    extend: {
      animation: {
        'loading': 'loading 1s infinite'
      },
      backdropBlur: {
        'default': '8px'
      },
      backgroundImage: {
        'pattern': "url('img/pattern.svg')"
      },
      colors: {
        'dark-blue-p3': '#093CB7',
        'light-blue-p3': '#65D5F4',
        'dark-blue': '#07377E',
        'light-blue': '#9CE7f8',
        'accent': '#EADBA8',
      },
      keyframes: {
        'loading': {
          '0%, 100%': {
            transform: 'translate(-2px, -3px)',
            animationTimeFunction: 'cubic-bezier(0.8, 0, 1, 1)'
          },
          '50%': {
            transform: 'translate(-2px, 0)',
            animationTimeFunction: 'cubic-bezier(0, 0, 0.2, 1)'
          },
        }
      }
    },
  },
  plugins: [],
}

