/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./resources/**/*.blade.php",
    "./resources/**/*.js",
    "./resources/**/*.vue",
  ],
  theme: {
    extend: {
      colors: {
        nauss: {
          primary: '#016564',
          secondary: '#d0b284',
          light: '#f8f9f9',
          muted: '#d6d7d4',
          accent: '#498983',
          text: '#98aaaa',
          dark: '#0a4a49',
        }
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      },
    },
  },
  plugins: [],
}