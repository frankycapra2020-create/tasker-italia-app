/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#e8eaf6',
          100: '#c5cae9',
          700: '#283593',
          800: '#1a237e',
          900: '#0d1757',
        },
      },
    },
  },
  plugins: [],
}

