module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        'nauss-green': '#016564',
        'nauss-green-dark': '#014948',
        'nauss-green-deep': '#022f2f',
        'nauss-gold': '#d0b284',
        'nauss-ink': '#163434',
        'nauss-muted': '#738484',
        'nauss-line': '#d9e4e4',
        'nauss-soft': '#f4f8f8',
        'nauss-danger': '#bf3d30',
        'nauss-success': '#14805a',
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      },
      borderRadius: {
        'sm': '18px',
        'md': '24px',
        'lg': '30px',
        'xl': '38px',
      },
      boxShadow: {
        'nauss-xs': '0 12px 30px rgba(6, 26, 26, 0.05)',
        'nauss-sm': '0 18px 42px rgba(6, 26, 26, 0.06)',
        'nauss-md': '0 30px 86px rgba(6, 26, 26, 0.10)',
        'nauss-lg': '0 40px 140px rgba(6, 26, 26, 0.12)',
      },
    }
  },
  plugins: []
};
