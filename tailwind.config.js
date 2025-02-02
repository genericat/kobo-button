/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/prototype.html', './src/index.ejs', './src/script.js'],
  theme: {
    extend: {
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
      }
    },
  },
  plugins: [],
}

