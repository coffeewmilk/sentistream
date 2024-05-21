/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    fontFamily: {
      'logo': ['Lilita One', 'sans-serif'],
      'handwrite': ['Shadows Into Light Two', 'cursive'],
      'body': ['Patua One', 'serif']
    },
    colors: {
      'blue-dark': '#182335',
      'blue-light': '#324A6D',
      'blue-dark2': '#0E1521',
      'blue-light2': '#5A7BD1',
      'white-yellow': '#EAE4CC',
      'red-dark': '#AA3326',
      'red-light': '#EEAF9D',
      'green': '#6DA46D'
    },
    fontSize: {
      'xs': '15px',
      'sm': '20px',
      'base': '24px',
      'lg': '40px',
      'xl': '96px'
    },
    scale : {
      'flip': '-1'
    }
  },
  plugins: [],
}

