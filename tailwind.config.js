/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/prototype.html', './src/index.ejs', './src/script.js'],
  theme: {
    extend: {
      colors: {
        'dark-blue': '#07377E',
        'light-blue': '#9CE7f8',
        'accent': '#EADBA8'
      },
      backgroundImage: {
        'pattern': "url('/assets/img/pattern.svg')"
      },
    },
  },
  plugins: [],
}

